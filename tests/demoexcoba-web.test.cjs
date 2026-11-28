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
    'data/excoba-formulas.js',
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
  assert.equal(demo.packages.length, 10); // 1 showcase (70) + 9 Temario (2,520)
  // Default view is the random 180-question Demostrativo in strict Temario.pdf order (9 blocks x 20 = 180)
  const expectedPkgOrder = [170, 171, 172, 173, 174, 175, 176, 177, 178];
  const verifyStrictTemario180 = (items) => {
    assert.equal(items.length, 180);
    assert.equal(new Set(items.map(i => i.id)).size, 180, 'Demostrativo 180 items must be distinct');
    expectedPkgOrder.forEach((pkgId, blockIdx) => {
      const slice = items.slice(blockIdx * 20, (blockIdx + 1) * 20);
      assert.equal(slice.length, 20);
      const pkg = demo.packages.find(p => p.id === pkgId);
      const topicIdx = new Map(pkg.topics.map((t, idx) => [t.ref, idx]));
      let prevTopic = -1;
      for (const it of slice) {
        assert.equal(it.packageId, pkgId, `Block ${blockIdx} must stay strictly in package ${pkgId}`);
        const curTopic = topicIdx.get(it.topicRef);
        assert.ok(curTopic >= prevTopic, `Topics inside package ${pkgId} must stay in strict Temario.pdf order`);
        prevTopic = curTopic;
      }
    });
  };
  verifyStrictTemario180(demo.sessionItems.value);

  // Verify regenerateDemo180 keeps exact 9 x 20 strict Temario.pdf order
  demo.regenerateDemo180();
  verifyStrictTemario180(demo.sessionItems.value);

  // Verify subject-group aggregation exposes Demostrativo (180), all 2,520 temario items grouped by subject + 70 interactive
  const grpByKey = Object.fromEntries(demo.subjectGroups.map(g => [g.key, g.count]));
  assert.equal(grpByKey.DEMO180, 180);
  assert.equal(grpByKey.ORIG, 70);
  assert.equal(grpByKey['Matemáticas'], 1000);
  assert.equal(grpByKey['Español'], 320);
  assert.equal(grpByKey.ALL, 2520);
  // Verify every subject group stays strictly ordered by Temario.pdf curriculum sequence
  const curriculumRank = new Map();
  let r = 0;
  for (const p of demo.packages.filter(p => !p.isOriginal)) {
    for (const t of p.topics) curriculumRank.set(`${p.id}:${t.ref}`, r++);
  }
  for (const key of ['Español', 'Matemáticas', 'Ciencias Naturales', 'Ciencias Sociales', 'Física', 'Lenguaje', 'ALL']) {
    demo.selectSubjectGroup(key);
    let prev = -1;
    for (const it of demo.sessionItems.value) {
      const rank = curriculumRank.get(`${it.packageId}:${it.topicRef}`);
      assert.ok(rank !== undefined && rank >= prev, `${key} must stay in strict Temario.pdf order`);
      prev = rank;
    }
  }
  demo.selectSubjectGroup('Matemáticas');
  assert.equal(demo.totalCount.value, 1000);
  assert.equal(demo.topicsByStage.value.length, 3);
  demo.selectSubjectGroup('ALL');
  assert.equal(demo.totalCount.value, 2520);

  // Verify enriched formula catalog has 4 tabs with vars/tip/example help
  const formulas = env.ctx.EXCOBA_FORMULAS;
  assert.equal(formulas.tabs.length, 4);
  for (const t of formulas.tabs) {
    const cards = formulas.sections[t.id];
    assert.ok(cards.length >= 3);
    assert.ok(cards.every(c => c.vars && c.tip && c.example));
  }

  // Verify clock status transitions: ok -> warn (<= 15 min left) -> over (past limit, keeps running)
  demo.selectSubjectGroup('DEMO180');
  assert.equal(demo.timeLimitSeconds.value, 180 * 60);
  demo.elapsedSeconds.value = 100;
  assert.equal(demo.clockStatus.value, 'ok');
  demo.elapsedSeconds.value = 165 * 60; // 15 min remaining
  assert.equal(demo.clockStatus.value, 'warn');
  demo.elapsedSeconds.value = 185 * 60; // 5 min overtime, continues running
  assert.equal(demo.clockStatus.value, 'over');
  assert.equal(demo.elapsedFormatted.value, '03:05:00');

  // Verify finish() grades by general group (Etapa › Materia) and lists wrong items
  demo.selectSubjectGroup('DEMO180');
  const firstItem = demo.sessionItems.value[0];
  if (firstItem.tipo === 7) demo.setAnswer(firstItem.id, { text: String(firstItem.numericValue) });
  else if (firstItem.tipo === 4) demo.setAnswer(firstItem.id, { optionId: firstItem.options.find(o => o.isCorrect).id });
  else if (firstItem.tipo === 5) demo.setAnswer(firstItem.id, { map: Object.fromEntries(firstItem.statements.map(s => [s.id, s.category])) });
  demo.finish();
  assert.equal(demo.hasFinished.value, true);
  assert.equal(demo.resultsSummary.value.totalCorrect, 1);
  assert.equal(demo.resultsSummary.value.totalWrong, 179);
  assert.equal(demo.resultsSummary.value.rows.length, 9);
  assert.equal(demo.resultsSummary.value.rows[0].title, 'Primaria › Español');
  assert.equal(demo.resultsSummary.value.rows[0].wrongItems.length, 19);

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
  // All 1,000 Math Temario items (packages 171, 173, 176) must be open input box (tipo 7)
  const mathItems = temarioItems.filter(i => [171, 173, 176].includes(i.packageId));
  assert.equal(mathItems.length, 1000);
  assert.ok(mathItems.every(i => i.tipo === 7), 'Every Mathematics Temario item must be open input box (tipo 7)');

  const t7 = temarioItems.find(i => i.tipo === 7 && Number.isFinite(i.numericValue));
  const t7Alg = mathItems.find(i => i.numericValue === null);
  const t4 = temarioItems.find(i => i.tipo === 4);
  const t5 = temarioItems.find(i => i.tipo === 5);

  assert.equal(utils.gradeDemoItem(t7, { text: String(t7.numericValue) }), true);
  assert.equal(utils.gradeDemoItem(t7, { text: String(t7.numericValue + 9999) }), false);
  if (t7Alg) {
    assert.equal(utils.gradeDemoItem(t7Alg, { text: t7Alg.expectedText }), true);
  }
  assert.equal(utils.matchOpenMathExpression('-6, 6', 'x = -6; x = 6.'), true);
  assert.equal(utils.matchOpenMathExpression('6, -6', 'x = -6; x = 6.'), true);
  // Automatic rounding to 2 decimals + power (^) syntax support
  assert.equal(utils.parseNumericAnswer('2^3'), 8);
  assert.equal(utils.parseNumericAnswer('10^-2'), 0.01);
  assert.equal(utils.roundToTwo(3.14159), 3.14);
  assert.equal(utils.numbersMatchRounded(3.14159, 3.14, 0.01), true);
  assert.equal(utils.numbersMatchRounded(0.333333, 0.33, 0.01), true);

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
