const test = require('node:test');
const assert = require('node:assert/strict');
const { context, memoryStorage } = require('./test-utils.cjs');
function app(storage = memoryStorage()) {
  const env = context({ storage, globals: { setInterval: () => 1, clearInterval() {} } });
  env.ctx['vue3-sfc-loader'] = { loadModule() {} };
  env.ctx.__SFC_OPTIONS__ = {};
  for (const file of ['data/questions.js', 'composables/useQuestionBank.js', 'composables/useTimer.js', 'composables/useScoring.js', 'composables/useTheme.js', 'composables/useCalculator.js']) env.load(file);
  const state = env.component('App.vue').setup();
  return { ...env, state };
}

test('App starts practice, records manual attempts without points, rejects stale and duplicate events', () => {
  const { state } = app();
  state.practiceThemeId.value = 'M31';
  state.practiceLevel.value = 2;
  state.practiceCount.value = 25;
  state.startPractice();
  assert.equal(state.currentScreen.value, 'exam');
  assert.equal(state.totalQuestions.value, 25);
  assert.ok(state.questions.value.every(q => q.themeId === 'M31' && q.level === 2));
  const id = state.currentQuestion.value.id;
  state.handleAnswer({ questionId: id, isCorrect: true, gradingMethod: 'self', openAnswer: 'respuesta' });
  assert.equal(state.score.value, 0);
  assert.equal(state.sessionStats.value.self, 1);
  state.handleAnswer({ questionId: id, isCorrect: true, gradingMethod: 'exact' });
  assert.equal(state.score.value, 0);
  state.nextQuestion();
  state.handleAnswer({ questionId: id, isCorrect: true, gradingMethod: 'gemini' });
  assert.equal(state.overallSolvedCount.value, 1);
  state.handleAnswer({ questionId: state.currentQuestion.value.id, isCorrect: true, gradingMethod: 'exact' });
  assert.equal(state.score.value, 10);
  state.returnToMenu();
  assert.equal(state.questions.value.length, 25);
  assert.equal(state.currentScreen.value, 'menu');
});

test('App reset clears progress and scores while retaining saved Gemini settings', () => {
  const config = JSON.stringify({ enabled: true, apiKey: 'mock-only-key', model: 'models/mock-flash' });
  const storage = memoryStorage({ excoba_gemini_config_v1: config });
  const { state } = app(storage);
  state.startExam();
  assert.equal(state.totalQuestions.value, 180);
  state.handleAnswer({ questionId: state.currentQuestion.value.id, isCorrect: true, gradingMethod: 'exact' });
  assert.equal(state.score.value, 10);
  state.resetProgress();
  assert.equal(state.totalQuestions.value, 0);
  assert.equal(state.score.value, 0);
  assert.equal(state.currentScreen.value, 'menu');
  assert.equal(storage.getItem('excoba_gemini_config_v1'), config);
});
