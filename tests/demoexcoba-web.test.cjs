'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { context, memoryStorage } = require('./test-utils.cjs');

function loadDemoEnv(storage = memoryStorage()) {
  const env = context({ storage, globals: { setInterval: () => 1, clearInterval() {} } });
  env.ctx['vue3-sfc-loader'] = { loadModule() {} };
  env.ctx.__SFC_OPTIONS__ = {};
  for (const file of [
    'data/questions.js',
    'data/demoexcoba-temario.js',
    'composables/useQuestionBank.js',
    'composables/useTimer.js',
    'composables/useScoring.js',
    'composables/useTheme.js',
    'composables/useCalculator.js',
    'composables/useDemoExcoba.js',
  ]) env.load(file);
  return env;
}

test('useDemoExcoba serves 70 original unique items + 20 reactivos per topic across all 126 topics and grades cleanly', () => {
  const env = loadDemoEnv();
  const demo = env.ctx.useDemoExcoba();
  assert.equal(demo.originalCount, 70);
  assert.equal(demo.totalTopics, 126);
  assert.equal(demo.reactivosPerTopic, 20);
  assert.equal(demo.totalReactivos, 2520);
  assert.equal(demo.packages.length, 10); // 1 original (70) + 9 Temario (2,520)
  assert.equal(demo.totalCount.value, 70);

  // Switch to Bachillerato Matematicas para Calculo (176) and verify 20 reactivos per topic
  demo.selectPackage(176);
  assert.equal(demo.availableTopics.value.length, 25);
  assert.equal(demo.totalCount.value, 20);

  const utils = env.ctx.EXCOBA_DEMO_UTILS;

  // Verify independent showcase items (70 visual SVG/Canvas/LaTeX, 0 recovered/ references)
  const fs = require('node:fs');
  const rawBundle = fs.readFileSync('data/demoexcoba-temario.js', 'utf8');
  assert.equal(/recovered\/|Excoba3\//i.test(rawBundle), false);

  const origItems = env.ctx.EXCOBA_DEMO_TEMARIO.items.filter(i => i.isOriginal);
  assert.equal(origItems.length, 70);
  assert.ok(origItems.some(i => i.figureSvg), 'Expected procedural SVG figures');
  assert.ok(origItems.some(i => i.canvasSpec), 'Expected Canvas 2D plot specs');
  const expectedTipos = [3, 4, 5, 6, 7, 8, 11, 12, 15, 16, 18, 19, 22, 23, 24];
  const actualTipos = [...new Set(origItems.map(i => i.tipo))].sort((a, b) => a - b);
  assert.deepEqual(actualTipos, expectedTipos, 'All 15 DemoExcoba interactive question types must be present');
  const origT5 = origItems.find(i => i.tipo === 5);
  assert.ok(origT5 && origT5.statements.length > 0);
  const origRightMap = Object.fromEntries(origT5.statements.map(s => [s.id, s.category]));
  assert.equal(utils.gradeDemoItem(origT5, { map: origRightMap }), true);
  assert.equal(utils.gradeDemoItem(origT5, { map: {} }), false);

  const origT4 = origItems.find(i => i.tipo === 4);
  assert.ok(origT4 && origT4.tokens.length > 0);
  const origRightToks = Object.fromEntries(origT4.tokens.map(t => [t.id, (t.options.find(o => o.correcta === 1) || t.options[0]).val]));
  assert.equal(utils.gradeDemoItem(origT4, { tokens: origRightToks }), true);

  const origHotspot = origItems.find(i => i.tipo === 24 && i.areas?.length);
  assert.ok(origHotspot);
  const wantIds = origHotspot.areas.filter(a => a.correcta).map(a => a.id);
  assert.equal(utils.gradeDemoItem(origHotspot, { picked: wantIds }), true);
  assert.equal(utils.gradeDemoItem(origHotspot, { picked: [] }), false);

  // Grade one item of each type across Temario items (non-original)
  const temarioItems = env.ctx.EXCOBA_DEMO_TEMARIO.items.filter(i => !i.isOriginal);
  assert.equal(temarioItems.length, 2520);
  const t7 = temarioItems.find(i => i.tipo === 7);
  const t4 = temarioItems.find(i => i.tipo === 4);
  const t5 = temarioItems.find(i => i.tipo === 5);

  assert.equal(utils.gradeDemoItem(t7, { text: String(t7.numericValue) }), true);
  assert.equal(utils.gradeDemoItem(t7, { text: String(t7.numericValue + 9999) }), false);

  const rightOpt = t4.options.find(o => o.isCorrect);
  const wrongOpt = t4.options.find(o => !o.isCorrect);
  assert.equal(utils.gradeDemoItem(t4, { optionId: rightOpt.id }), true);
  assert.equal(utils.gradeDemoItem(t4, { optionId: wrongOpt.id }), false);

  const rightMap = Object.fromEntries(t5.statements.map(s => [s.id, s.category]));
  const wrongMap = Object.fromEntries(t5.statements.map(s => [s.id, s.category === 'correcta' ? 'incorrecta' : 'correcta']));
  assert.equal(utils.gradeDemoItem(t5, { map: rightMap }), true);
  assert.equal(utils.gradeDemoItem(t5, { map: wrongMap }), false);
});

test('App.vue switches cleanly between classic (11,300) and DemoExcoba replica modes with persistence', () => {
  const storage = memoryStorage();
  const env = loadDemoEnv(storage);
  const state = env.component('App.vue').setup();

  assert.equal(state.uiMode.value, 'classic');
  assert.equal(state.bankQuestionCount, 11300);

  state.setUiMode('demoexcoba');
  assert.equal(state.uiMode.value, 'demoexcoba');
  assert.equal(storage.getItem('excoba_ui_mode_v1'), 'demoexcoba');
  assert.equal(state.bankQuestionCount, 11300);

  state.setUiMode('classic');
  assert.equal(state.uiMode.value, 'classic');
  assert.equal(storage.getItem('excoba_ui_mode_v1'), 'classic');
});
