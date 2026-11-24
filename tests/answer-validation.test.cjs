const test = require('node:test');
const assert = require('node:assert/strict');
const { parseScalar, gradeExact, validateModelVerdict } = require('../composables/answerValidation.js');
const grade = (student, reference, extra = {}) => gradeExact({ answerMode: 'exact', correctAnswer: reference, ...extra }, student).verdict;

test('exact rational arithmetic accepts equivalent fractions, decimals and numeric LaTeX', () => {
  for (const [student, expected] of [
    ['0.5', '\\frac{1}{2}'], ['2/4', '$\\frac{1}{2}$.'], ['-2 1/3', '-7/3'],
    ['1,25', '5/4'], ['-2^2', '-4'], ['(-2)^2', '4'], ['2^-3', '1/8'],
    ['(2+3)*4', '20'], ['\\frac{1}{\\frac{2}{3}}', '3/2'], ['x=3/2', '1.5']
  ]) assert.equal(grade(student, expected), 'correct', student + ' = ' + expected);
  assert.equal(grade('0.333', '1/3'), 'incorrect');
  assert.equal(grade('0.333', '1/3', { numericTolerance: 0.001 }), 'correct');
  assert.equal(grade('1/4', '1/3'), 'incorrect');
});

test('unit conversion is exact and dimensions must agree', () => {
  for (const [student, expected] of [['50 cm', '0.5 m'], ['2 h', '120 min'], ['2500 g', '2.5 kg'], ['10000 cm²', '1 m^2'], ['1000 ml', '1 l'], ['45°', '45^{\\circ}'], ['5', '5 cm'], ['50%', '1/2'], ['1/2', '50%'], ['50', '50%']]) {
    assert.equal(grade(student, expected), 'correct', student + ' = ' + expected);
  }
  for (const [student, expected] of [['5 cm', '5 m'], ['1 m', '1 m²'], ['1 kg', '1 m'], ['2 kg', '2'], ['40%', '1/2']]) assert.equal(grade(student, expected), 'incorrect');
});

test('unsafe, malformed and unbounded inputs are rejected without evaluation', () => {
  for (const value of ['1/0', '0^0', '2^100000', 'alert(1)', 'globalThis.x=1', 'process.exit()', '1;2', 'Infinity', 'NaN', '((((1)', '1..2', '9'.repeat(500), '2^(2^20)', '(999999999999999999999999999999^20)^20']) {
    assert.equal(parseScalar(value), null, value.slice(0, 50));
  }
  assert.equal(globalThis.x, undefined);
});

test('review answers are never auto-marked by literal comparison', () => {
  assert.equal(gradeExact({ answerMode: 'self', correctAnswer: 'x+1' }, 'x+1').verdict, 'needs_review');
  assert.equal(grade('', '2'), 'needs_review');
  assert.equal(grade('BÁSICO', 'básico'), 'correct');
  assert.equal(grade('si', 'sí'), 'incorrect');
  assert.equal(grade('otra', 'modelo', { acceptableAnswers: ['otra'] }), 'correct');
});

test('model verdict validation is strict and low confidence requires review', () => {
  assert.equal(validateModelVerdict({ verdict: 'correct', feedback: 'Bien.', confidence: 0.95 }).verdict, 'correct');
  assert.equal(validateModelVerdict({ verdict: 'incorrect', feedback: 'Dudoso.', confidence: 0.84 }).verdict, 'needs_review');
  assert.equal(validateModelVerdict({ verdict: 'needs_review', feedback: 'Falta un dato.', confidence: 1 }).verdict, 'needs_review');
  for (const value of [null, {}, { verdict: 'maybe', feedback: '', confidence: 1 }, { verdict: 'correct', feedback: 1, confidence: 1 }, { verdict: 'correct', feedback: '', confidence: 2 }]) assert.throws(() => validateModelVerdict(value));
});
