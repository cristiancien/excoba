const test = require('node:test');
const assert = require('node:assert/strict');
const { memoryStorage, context } = require('./test-utils.cjs');
require('../composables/answerValidation.js');
const { createGeminiService, STORAGE_KEY, validModel } = require('../composables/useGemini.js');
const KEY = 'mock-only-not-a-real-key';
const MODEL = 'models/gemini-test-flash';
const response = data => ({ ok: true, json: async () => data });
const generated = payload => response({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }] });
function configured(fetchImpl, timeoutMs) {
  const storage = memoryStorage();
  const service = createGeminiService({ storage, fetchImpl, timeoutMs });
  service.save({ enabled: true, apiKey: KEY, model: MODEL });
  return { service, storage };
}

test('Gemini defaults off, saves only locally, and key deletion disables it', async () => {
  const storage = memoryStorage({ [STORAGE_KEY]: 'invalid json' });
  let calls = 0;
  const service = createGeminiService({ storage, fetchImpl: async () => { calls++; } });
  assert.deepEqual(service.read(), { enabled: false, apiKey: '', model: '' });
  await assert.rejects(service.grade({ question: 'x' }, '1'), /desactivado/);
  assert.equal(calls, 0);
  assert.throws(() => service.save({ enabled: true, apiKey: KEY }), /selecciona/);
  service.save({ enabled: true, apiKey: KEY, model: MODEL });
  assert.equal(service.read().apiKey, KEY);
  assert.equal([...storage.data.keys()].length, 1);
  service.clear();
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(service.read().enabled, false);
  assert.equal(validModel('models/x:generateContent?key=bad'), false);
});

test('model discovery paginates, filters multimodal-only models and prefers stable Flash', async () => {
  const requests = [];
  const make = name => ({ name, displayName: name, supportedGenerationMethods: ['generateContent'] });
  const service = createGeminiService({ storage: memoryStorage(), fetchImpl: async (url, options) => {
    requests.push({ url, options });
    return response(requests.length === 1 ? { models: [make('models/gemini-3-pro'), make('models/gemini-3-flash-preview'), make('models/gemini-3-flash-image'), { name: 'models/embedding', supportedGenerationMethods: ['embedContent'] }], nextPageToken: 'second page' } : { models: [make('models/gemini-3-flash'), make('models/gemini-2-flash'), make('models/gemini-3-flash')] });
  } });
  const models = await service.listModels(KEY);
  assert.equal(models[0].name, 'models/gemini-3-flash');
  assert.equal(models.length, 4);
  assert.ok(requests[1].url.endsWith('&pageToken=second%20page'));
  for (const r of requests) {
    assert.ok(r.url.startsWith('https://generativelanguage.googleapis.com/v1beta/models?'));
    assert.ok(!r.url.includes(KEY));
    assert.equal(r.options.headers['x-goog-api-key'], KEY);
    assert.equal(r.options.credentials, 'omit');
  }
});

test('structured grading sends task data directly to Google, keeps key out of URL/body', async () => {
  let captured;
  const { service } = configured(async (url, options) => { captured = { url, options }; return generated({ verdict: 'correct', feedback: 'La expresión es equivalente.', confidence: 0.97 }); });
  const result = await service.grade({ question: 'Factoriza x²−1', correctAnswer: '(x−1)(x+1)', explanation: 'Diferencia de cuadrados.' }, '(x+1)(x-1)');
  assert.equal(result.verdict, 'correct');
  assert.equal(captured.url, 'https://generativelanguage.googleapis.com/v1beta/' + MODEL + ':generateContent');
  assert.equal(captured.options.headers['x-goog-api-key'], KEY);
  assert.ok(!captured.options.body.includes(KEY));
  const body = JSON.parse(captured.options.body);
  assert.equal(body.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(body.generationConfig.responseJsonSchema.required, ['verdict', 'feedback', 'confidence']);
  assert.equal(body.generationConfig.responseSchema, undefined);
  assert.equal(JSON.parse(body.contents[0].parts[0].text).studentAnswer, '(x+1)(x-1)');
});

test('low-confidence or malformed replies do not become incorrect answers', async () => {
  let { service } = configured(async () => generated({ verdict: 'incorrect', feedback: 'No estoy seguro.', confidence: 0.5 }));
  assert.equal((await service.grade({}, 'x')).verdict, 'needs_review');
  ({ service } = configured(async () => generated({ verdict: 'correct', confidence: 1 })));
  await assert.rejects(service.grade({}, 'x'), /formato/);
  ({ service } = configured(async () => response({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{}' }] } }] })));
  await assert.rejects(service.grade({}, 'x'), /no completó/);
  ({ service } = configured(async () => response({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not json' }] } }] })));
  await assert.rejects(service.grade({}, 'x'), /incompleta/);
});

test('HTTP, network, timeout and cancellation errors are safe and actionable', async () => {
  for (const [status, word] of [[401, 'clave'], [403, 'permiso'], [404, 'modelo'], [429, 'cuota'], [500, 'completar']]) {
    const { service } = configured(async () => ({ ok: false, status, json: async () => ({ key: KEY }) }));
    await assert.rejects(service.grade({}, 'x'), error => !error.message.includes(KEY) && error.message.includes(word));
  }
  let { service } = configured(async () => { throw new Error('network secret: ' + KEY); });
  await assert.rejects(service.grade({}, 'x'), error => !error.message.includes(KEY));
  ({ service } = configured((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')))), 5));
  await assert.rejects(service.grade({}, 'x'), /tardó demasiado/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(service.grade({}, 'x', { signal: controller.signal }), /cancelada/);
});

test('model cache is scoped to the key that listed it', async () => {
  const env = context({ globals: { fetch: async () => response({ models: [{ name: MODEL, supportedGenerationMethods: ['generateContent'] }] }) } });
  env.load('composables/answerValidation.js'); env.load('composables/useGemini.js');
  const gemini = env.ctx.useGemini();
  await gemini.listModels(KEY);
  assert.equal(gemini.modelsForKey(KEY).length, 1);
  assert.equal(gemini.modelsForKey('different-mock-key').length, 0);
  gemini.save({ enabled: true, apiKey: KEY, model: MODEL });
  assert.equal(gemini.modelsForKey(KEY).length, 1);
  gemini.save({ enabled: false, apiKey: 'different-mock-key', model: MODEL });
  assert.equal(gemini.modelsForKey(KEY).length, 0);
  assert.equal(gemini.modelsForKey('different-mock-key').length, 0);
});

test('Settings masks the key, lists models, explicitly saves and explicitly deletes', async () => {
  const env = context({ globals: { fetch: async () => response({ models: [{ name: MODEL, displayName: 'Mock Flash', supportedGenerationMethods: ['generateContent'] }] }) } });
  env.load('composables/answerValidation.js'); env.load('composables/useGemini.js');
  const state = env.component('components/SettingsPanel.vue').setup({}, { emit() {} });
  assert.equal(state.showKey.value, false);
  assert.equal(state.enabled.value, false);
  state.apiKey.value = KEY; env.vue.flush();
  assert.equal(env.storage.getItem(STORAGE_KEY), null);
  await state.testConnection();
  assert.equal(state.verified.value, true);
  assert.equal(state.model.value, MODEL);
  state.enabled.value = true; state.save();
  assert.equal(JSON.parse(env.storage.getItem(STORAGE_KEY)).apiKey, KEY);
  state.apiKey.value = 'another-mock-key'; env.vue.flush();
  assert.equal(state.model.value, '');
  assert.equal(state.availableModels.value.length, 0);
  state.deleteKey(); env.vue.flush();
  assert.equal(env.storage.getItem(STORAGE_KEY), null);
  assert.equal(state.enabled.value, false);
  assert.match(state.notice.value, /eliminada/);
});
