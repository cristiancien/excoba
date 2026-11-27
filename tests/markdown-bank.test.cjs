const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { context, memoryStorage } = require('./test-utils.cjs');
const { parseMarkdownBank, isSafeFigureUrl, SAMPLE_MARKDOWN } = require('../composables/markdownBank.js');

test('EXCOBA-MD parses multiple, open (exact + self), table, stimulus, hints and LaTeX', () => {
  const samplePath = path.join(__dirname, '..', 'data', 'ejemplo-banco.md');
  const parsed = parseMarkdownBank(fs.readFileSync(samplePath, 'utf8'));
  assert.equal(parsed.meta.questionCount, 4);
  assert.deepEqual(parsed.meta.byType, { multiple: 1, open: 2, table: 1 });
  assert.equal(parsed.warnings.length, 0);

  const [q1, q2, q3, q4] = parsed.questions;
  assert.equal(q1.type, 'multiple');
  assert.equal(q1.options.length, 4);
  assert.equal(q1.options.filter(o => o.isCorrect).length, 1);
  assert.equal(q1.correctAnswer, '$3x^2$');
  assert.match(q1.stimulus, /potencia/);
  assert.match(q1.hint, /exponente/);

  assert.equal(q2.type, 'open');
  assert.equal(q2.answerMode, 'exact');
  assert.equal(q2.section, 'Primaria');
  assert.equal(q2.topic, 'Matemáticas');
  assert.deepEqual(q2.acceptableAnswers, ['0.75']);

  assert.equal(q3.type, 'open');
  assert.equal(q3.answerMode, 'self');
  assert.equal(q3.level, 4);

  assert.equal(q4.type, 'table');
  assert.deepEqual(q4.headers, ['Figura', '3 lados', '4 lados', '5 lados']);
  assert.equal(q4.rows.length, 3);
  assert.equal(q4.rows[1].correct, '4 lados');
});

test('EXCOBA-MD infers question type automatically and enforces safe figure URLs', () => {
  const md = `
## Auto1 | Cálculo
![Triángulo](./assets/questions/triangulo.svg "Figura 1")
¿Valor de $2^3$?
- [ ] 6
- [x] 8
!explicacion: $2^3 = 8$.
`;
  const parsed = parseMarkdownBank(md);
  assert.equal(parsed.questions[0].type, 'multiple');
  assert.equal(parsed.questions[0].figure, './assets/questions/triangulo.svg');
  assert.equal(parsed.questions[0].figureCaption, 'Figura 1');

  assert.equal(isSafeFigureUrl('./assets/questions/a.png'), true);
  assert.equal(isSafeFigureUrl('https://example.com/fig.png'), true);
  assert.equal(isSafeFigureUrl('javascript:alert(1)'), false);
  assert.equal(isSafeFigureUrl('../secret.png'), false);
  assert.equal(isSafeFigureUrl('data:text/html;base64,PHNjcmlwdD4='), false);

  assert.throws(() => parseMarkdownBank('## BadFig\n![x](javascript:alert(1))\nPregunta\n!respuesta: 1'), /no permitida/i);
  assert.throws(() => parseMarkdownBank('## BadMcq | multiple\nPregunta\n- [ ] A\n- [ ] B'), /exactamente 1/i);
  assert.throws(() => parseMarkdownBank('## BadOpen | open\nSin respuesta'), /!respuesta/i);
  assert.throws(() => parseMarkdownBank('Solo texto sin encabezados'), /No se encontraron reactivos/i);
});

test('useQuestionBank + App consume Markdown banks without altering built-in bank or localStorage', () => {
  const storage = memoryStorage();
  const env = context({ storage, globals: { setInterval: () => 1, clearInterval() {} } });
  env.ctx['vue3-sfc-loader'] = { loadModule() {} };
  env.ctx.__SFC_OPTIONS__ = {};
  for (const file of [
    'data/questions.js',
    'composables/answerValidation.js',
    'composables/markdownBank.js',
    'composables/useQuestionBank.js',
    'composables/useTimer.js',
    'composables/useScoring.js',
    'composables/useTheme.js',
    'composables/useCalculator.js'
  ]) env.load(file);

  const state = env.component('App.vue').setup();
  assert.equal(state.activeBankSource.value, 'default');
  assert.equal(state.activeBankCount.value, 11300);

  // Load sample Markdown bank
  assert.equal(state.loadMarkdownInput(SAMPLE_MARKDOWN, 'Mi repaso'), true);
  assert.equal(state.activeBankSource.value, 'markdown');
  assert.equal(state.activeBankCount.value, 4);
  assert.equal(state.bankQuestionCount, 11300);

  // Start practice directly from loaded Markdown bank
  state.startMarkdownPractice();
  assert.equal(state.currentScreen.value, 'exam');
  assert.equal(state.totalQuestions.value, 4);
  assert.equal(storage.getItem('excoba_session_v2'), null);

  // Record an answer on the Markdown multiple-choice question
  const q = state.currentQuestion.value;
  state.handleAnswer({ questionId: q.id, isCorrect: true, gradingMethod: 'exact', selectedOptionId: 'opt_2' });
  assert.equal(state.overallSolvedCount.value, 1);
  assert.equal(state.score.value, 10);

  // Restore default 11300-item bank cleanly
  state.restoreDefaultBank();
  assert.equal(state.activeBankSource.value, 'default');
  assert.equal(state.activeBankCount.value, 11300);
  assert.equal(state.totalQuestions.value, 0);
});

test('markdownBank CLI validates data/ejemplo-banco.md cleanly to stdout', () => {
  const cli = path.join(__dirname, '..', 'composables', 'markdownBank.js');
  const sample = path.join(__dirname, '..', 'data', 'ejemplo-banco.md');
  const out = execFileSync(process.execPath, [cli, sample], { encoding: 'utf8' });
  const result = JSON.parse(out);
  assert.equal(result.ok, true);
  assert.equal(result.meta.questionCount, 4);
});
