const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { context, ROOT } = require('./test-utils.cjs');
const open = extra => ({ id: 1, type: 'open', question: 'Resuelve x+1=3.', answerMode: 'self', correctAnswer: 'x=2', explanation: 'Resta 1.', ...extra });
function quiz(question = open(), gemini = {}, pastAnswer = null) {
  const env = context();
  env.load('composables/answerValidation.js');
  env.ctx.useGemini = () => ({ ready: { value: false }, grade: async () => { throw new Error('not configured'); }, ...gemini });
  const events = [], props = { question, pastAnswer, hintAlreadyUsed: false };
  const component = env.component('components/QuizView.vue');
  const state = component.setup(props, { emit: (...args) => events.push(args) });
  return { ...env, props, state, events };
}

test('self-review requires an attempt and an explicit decision', () => {
  const { state, events } = quiz();
  state.submitAnswer();
  assert.equal(state.reviewOpen.value, false);
  state.finishSelfReview(true);
  assert.equal(events.length, 0);
  state.openAnswer.value = '2';
  state.submitAnswer();
  assert.equal(state.reviewOpen.value, true);
  assert.equal(events.length, 0);
  state.finishSelfReview(true);
  assert.equal(events.length, 1);
  assert.equal(events[0][1].gradingMethod, 'self');
  assert.equal(events[0][1].isCorrect, true);
  state.finishSelfReview(false);
  assert.equal(events.length, 1);
});

test('exact open answers accept equivalent fractions and do not emit twice', () => {
  const { state, events } = quiz(open({ answerMode: 'exact', correctAnswer: '1/2' }));
  state.openAnswer.value = '0.5'; state.submitAnswer(); state.submitAnswer();
  assert.equal(events.length, 1);
  assert.equal(events[0][1].isCorrect, true);
  assert.equal(events[0][1].gradingMethod, 'exact');
});

test('model needs_review and API errors never silently mark an attempt wrong', async () => {
  let env = quiz(open(), { ready: { value: true }, grade: async () => ({ verdict: 'needs_review', confidence: 0.6, feedback: 'Falta una condición.' }) });
  env.state.openAnswer.value = 'mi respuesta';
  await env.state.reviewWithGemini();
  assert.equal(env.events.length, 0);
  assert.equal(env.state.reviewOpen.value, true);
  assert.equal(env.state.showResult.value, false);
  env.state.finishSelfReview(false);
  assert.equal(env.events[0][1].gradingMethod, 'self');
  env = quiz(open(), { ready: { value: true }, grade: async () => { throw new Error('Cuota agotada.'); } });
  env.state.openAnswer.value = '2';
  await env.state.reviewWithGemini();
  assert.equal(env.events.length, 0);
  assert.equal(env.state.showResult.value, false);
  assert.match(env.state.reviewError.value, /Cuota/);
  env.state.reviewOpen.value = true; env.state.finishSelfReview(true);
  assert.equal(env.events[0][1].gradingMethod, 'self');
});

test('successful Gemini evaluation retains provenance and plain-text feedback', async () => {
  const { state, events } = quiz(open(), { ready: { value: true }, grade: async () => ({ verdict: 'correct', confidence: 0.99, feedback: '<img src=x onerror=alert(1)>' }) });
  state.openAnswer.value = '2'; await state.reviewWithGemini();
  assert.equal(events[0][1].gradingMethod, 'gemini');
  assert.equal(events[0][1].confidence, 0.99);
  assert.equal(events[0][1].modelFeedback, '<img src=x onerror=alert(1)>');
  const quizSource = fs.readFileSync(path.join(ROOT, 'components/QuizView.vue'), 'utf8');
  const feedbackSource = fs.readFileSync(path.join(ROOT, 'components/FeedbackOverlay.vue'), 'utf8');
  assert.ok(quizSource.includes('{{ reviewFeedback }}'));
  assert.ok(!/v-(?:html|latex)="reviewFeedback"/.test(quizSource));
  assert.ok(!/v-(?:html|latex)="modelFeedback"/.test(feedbackSource));
});

test('navigation and unmount discard stale asynchronous Gemini responses', async () => {
  let resolve;
  let env = quiz(open(), { ready: { value: true }, grade: () => new Promise(r => { resolve = r; }) });
  env.state.openAnswer.value = '2';
  let pending = env.state.reviewWithGemini();
  assert.equal(env.state.grading.value, true);
  env.props.question = open({ id: 2 }); env.vue.flush();
  resolve({ verdict: 'correct', confidence: 1, feedback: 'correcto' }); await pending;
  assert.equal(env.events.length, 0);
  assert.equal(env.state.grading.value, false);
  env = quiz(open(), { ready: { value: true }, grade: () => new Promise(r => { resolve = r; }) });
  env.state.openAnswer.value = '2'; pending = env.state.reviewWithGemini(); env.vue.unmount();
  resolve({ verdict: 'incorrect', confidence: 1, feedback: 'no' }); await pending;
  assert.equal(env.events.length, 0);
});

test('multiple-choice and table types retain native deterministic grading', () => {
  let env = quiz({ id: 3, type: 'multiple', question: 'Elige', options: [{ id: 'a', text: 'Uno', isCorrect: true }, { id: 'b', text: 'Dos', isCorrect: false }] });
  env.state.selectedOption.value = 'a'; env.state.submitAnswer();
  assert.equal(env.events[0][1].isCorrect, true);
  env = quiz({ id: 4, type: 'table', question: 'Clasifica', rows: [{ id: 'a', correct: 'V' }, { id: 'b', correct: 'F' }] });
  env.state.tableAnswers.value = { a: 'V' }; env.state.submitAnswer(); assert.equal(env.events.length, 0);
  env.state.tableAnswers.value.b = 'F'; env.state.submitAnswer();
  assert.equal(env.events[0][1].isCorrect, true);
});

test('restored review results are readonly and are not regraded', () => {
  const env = quiz(open(), {}, { isCorrect: true, gradingMethod: 'self', openAnswer: '2' });
  assert.equal(env.state.showResult.value, true);
  assert.equal(env.state.answerCorrect.value, true);
  assert.equal(env.state.resultMethod.value, 'self');
  env.state.submitAnswer();
  assert.equal(env.events.length, 0);
});

test('all SFC scripts parse; score and timers tolerate corrupt or unavailable storage', () => {
  const env = context();
  env.ctx['vue3-sfc-loader'] = { loadModule() {} };
  env.ctx.loadModule = () => {};
  env.ctx.__SFC_OPTIONS__ = {};
  for (const file of ['App.vue', 'components/QuizView.vue', 'components/SettingsPanel.vue', 'components/FeedbackOverlay.vue']) assert.equal(typeof env.component(file).setup, 'function', file);
  env.storage.setItem('excoba_hints_used', '{bad');
  env.storage.setItem('excoba_score', 'Infinity');
  env.storage.setItem('excoba_exam_time', '-10');
  env.load('composables/useScoring.js'); env.load('composables/useTimer.js');
  const scoring = env.ctx.useScoring(), timer = env.ctx.useTimer();
  assert.equal(scoring.score.value, 0); assert.equal(timer.examTime.value, 0);
  env.storage.setItem = () => { throw new Error('quota'); };
  env.storage.removeItem = () => { throw new Error('blocked'); };
  scoring.applyAnswer(true); env.vue.flush(); scoring.resetScoring(); timer.resetTimers();
  assert.equal(scoring.score.value, 0);
});
