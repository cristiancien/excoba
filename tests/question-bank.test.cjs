const test = require('node:test');
const assert = require('node:assert/strict');
const { context, memoryStorage } = require('./test-utils.cjs');
const SESSION = 'excoba_session_v2';
function realBank(storage) {
  const env = context({ storage });
  env.load('data/questions.js'); env.load('composables/useQuestionBank.js');
  return { ...env, bank: env.ctx.useQuestionBank() };
}

test('real catalogue has 113 themes, 100 questions per theme and 25 at each level', () => {
  const { bank } = realBank();
  assert.equal(bank.bankQuestionCount, 11300);
  assert.equal(bank.catalogue.length, 113);
  for (const theme of bank.catalogue) {
    assert.equal(theme.count, 100, theme.id);
    for (const level of [1, 2, 3, 4]) assert.equal(theme.levels[level], 25, theme.id + ' level ' + level);
    assert.ok(theme.skills.length > 0, theme.id);
  }
});

test('simulacro is 180 distinct items, 20 per original subject and 5 per difficulty', () => {
  const { bank, ctx } = realBank();
  assert.equal(bank.buildExamBank(), true);
  assert.equal(bank.questions.value.length, 180);
  assert.equal(new Set(bank.questions.value.map(q => q.id)).size, 180);
  for (const [section, topics] of Object.entries(ctx.EXCOBA_BANK_UTILS.SUBTEMA_MAP)) {
    for (const topic of topics) {
      const items = bank.questions.value.filter(q => q.section === section && q.topic === topic);
      assert.equal(items.length, 20, section + ' ' + topic);
      for (const level of [1, 2, 3, 4]) assert.equal(items.filter(q => q.level === level).length, 5);
    }
  }
  assert.equal(bank.overallSolvedCount.value, 0);
  assert.equal(bank.progressPercentage.value, 0);
});

test('practice filters theme, level and skill and preserves question types', () => {
  const { bank, ctx } = realBank();
  const theme = bank.catalogue.find(t => t.id === 'M55');
  assert.ok(theme);
  assert.equal(bank.buildPracticeBank({ themeId: 'M55', level: 3, count: 100, ordered: true }), true);
  assert.equal(bank.totalQuestions.value, 25);
  assert.ok(bank.questions.value.every(q => q.themeId === 'M55' && q.level === 3));
  assert.equal(bank.sessionMode.value, 'practice');
  const skill = bank.questions.value[0].skill;
  bank.buildPracticeBank({ themeId: 'M55', level: 3, skill, count: 100 });
  assert.ok(bank.questions.value.every(q => q.skill === skill && q.level === 3));
  const original = new Map(ctx.EXCOBA_QUESTIONS.map(q => [q.id, q.type]));
  assert.ok(bank.questions.value.every(q => q.type === original.get(q.id)));
  assert.equal(bank.buildPracticeBank({ themeId: 'NOT_FOUND' }), false);
  assert.match(bank.sessionError.value, /No hay/);
});

test('persistence saves IDs and answer metadata, never the full 11300-item bank', () => {
  const { bank, storage, vue } = realBank();
  bank.buildPracticeBank({ themeId: 'M31', count: 100, ordered: true });
  let saved = JSON.parse(storage.getItem(SESSION));
  assert.equal(saved.ids.length, 100);
  assert.equal(saved.questions, undefined);
  assert.ok(storage.getItem(SESSION).length < 5000);
  const id = bank.questions.value[0].id;
  assert.equal(bank.recordAnswer(id, { isCorrect: true, gradingMethod: 'self', openAnswer: 'mi razonamiento' }), true);
  assert.equal(bank.recordAnswer(id, { isCorrect: false, gradingMethod: 'exact' }), false);
  assert.equal(bank.recordAnswer(-1, { isCorrect: true }), false);
  assert.equal(bank.recordAnswer(bank.questions.value[1].id, null), false);
  assert.equal(bank.sessionStats.value.self, 1);
  assert.equal(bank.sessionStats.value.exact, 0);
  assert.equal(bank.progressPercentage.value, 1);
  bank.currentQuestionIndex.value = 100; vue.flush();
  const restored = realBank(storage).bank;
  assert.equal(restored.currentQuestionIndex.value, 100);
  assert.equal(restored.currentQuestion.value, null);
  assert.equal(restored.answeredStatus.value[id].gradingMethod, 'self');
  saved = JSON.parse(storage.getItem(SESSION));
  assert.equal(saved.answers[id].openAnswer, 'mi razonamiento');
});

test('corrupt, stale, unknown or duplicate session data is handled safely', () => {
  let bank = realBank(memoryStorage({ [SESSION]: '{invalid' })).bank;
  assert.equal(bank.totalQuestions.value, 0);
  const env = realBank();
  env.bank.buildPracticeBank({ themeId: 'M31', count: 10 });
  const saved = JSON.parse(env.storage.getItem(SESSION));
  const id = saved.ids[0];
  saved.ids = [id, id, -999];
  saved.answers = { [id]: null, '-999': { isCorrect: true } };
  saved.index = 900;
  env.storage.setItem(SESSION, JSON.stringify(saved));
  bank = realBank(env.storage).bank;
  assert.equal(bank.totalQuestions.value, 1);
  assert.equal(bank.currentQuestionIndex.value, 1);
  assert.equal(bank.overallSolvedCount.value, 0);
  saved.bankVersion = 'obsolete';
  env.storage.setItem(SESSION, JSON.stringify(saved));
  assert.equal(realBank(env.storage).bank.totalQuestions.value, 0);
});

test('quota failures keep practice usable and resetting progress retains Gemini configuration', () => {
  const geminiConfig = '{"enabled":true,"apiKey":"mock-only","model":"models/mock"}';
  const storage = memoryStorage({ excoba_gemini_config_v1: geminiConfig }, 64);
  const { bank } = realBank(storage);
  assert.equal(bank.buildPracticeBank({ themeId: 'M31', count: 100 }), true);
  assert.equal(bank.totalQuestions.value, 100);
  assert.match(bank.persistenceWarning.value, /guardar/);
  bank.resetBank();
  assert.equal(bank.totalQuestions.value, 0);
  assert.equal(storage.getItem('excoba_gemini_config_v1'), geminiConfig);
});

test('grading stats preserve the distinction between exact, Gemini and self-review', () => {
  const { bank } = realBank();
  bank.buildPracticeBank({ themeId: 'M31', count: 10 });
  for (const [i, method] of ['exact', 'gemini', 'self'].entries()) {
    bank.recordAnswer(bank.questions.value[i].id, { isCorrect: true, gradingMethod: method, confidence: 0.96, modelFeedback: '<b>plain text</b>' });
  }
  assert.equal(bank.sessionStats.value.exactCorrect, 1);
  assert.equal(bank.sessionStats.value.geminiCorrect, 1);
  assert.equal(bank.sessionStats.value.selfCorrect, 1);
  assert.equal(bank.overallSolvedCount.value, 3);
  const saved = bank.answeredStatus.value[bank.questions.value[1].id];
  assert.equal(saved.modelFeedback, '<b>plain text</b>');
  assert.equal(saved.confidence, 0.96);
});
