const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildBank, serializeBank } = require('../data/generate_questions.js');
const { parseScalar } = require('../composables/answerValidation.js');
const sourceBytes = fs.readFileSync(path.join(__dirname, '../data/source-bank.json'));
const source = JSON.parse(sourceBytes);
const bank = buildBank(sourceBytes);

test('editorial source is portable, complete and has stable identifiers', () => {
  assert.equal(bank.questions.length, 11300);
  assert.equal(bank.manifest.themeCount, 113);
  assert.equal(bank.manifest.sourceLeafCount, 126);
  assert.equal(bank.manifest.coveredLeafCount, 126);
  assert.equal(new Set(bank.questions.map(q => q.code)).size, 11300);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 11300);
  assert.doesNotMatch(sourceBytes.toString(), /"figure_path"|\/workspace\/|\/home\//);
  for (const block of source.blocks) {
    assert.equal(block.items.length, 100, block.code);
    for (const level of [1, 2, 3, 4]) assert.equal(block.items.filter(q => q.level === level).length, 25, block.code);
    const exported = bank.questions.filter(q => q.themeId === block.code);
    assert.deepEqual(exported.map(q => q.code), block.items.map((q, index) => q.code || `${block.code}.${String(index + 1).padStart(3, '0')}`));
    assert.deepEqual(exported.map(q => q.correctAnswer), block.items.map(q => q.a));
  }
});

test('build is deterministic and source changes invalidate the bank version', () => {
  assert.deepEqual(serializeBank(bank), serializeBank(buildBank(sourceBytes)));
  assert.equal(bank.meta.version, 'progressivo-' + crypto.createHash('sha256').update(sourceBytes).digest('hex').slice(0, 12));
  const changed = structuredClone(source);
  changed.blocks[0].items[0].work += ' Verificación adicional.';
  assert.notEqual(buildBank(JSON.stringify(changed)).meta.version, bank.meta.version);
  const serialized = serializeBank(bank);
  assert.ok(serialized.questions.includes('window.EXCOBA_BANK_META'));
  assert.deepEqual(JSON.parse(serialized.manifest), bank.manifest);
});

test('only scalar answers without an explanatory task are automatically graded', () => {
  for (const q of bank.questions.filter(q => q.answerMode === 'exact')) assert.ok(parseScalar(q.correctAnswer), q.code);
  assert.ok(bank.questions.some(q => q.answerMode === 'exact'));
  assert.ok(bank.questions.some(q => q.themeId === 'D02' && q.answerMode === 'self'));
  const changed = structuredClone(source);
  changed.blocks[0].items[0].q = 'Calcula 20 + 19 y justifica.';
  changed.blocks[0].items[0].answerMode = 'exact';
  assert.equal(buildBank(JSON.stringify(changed)).questions[0].answerMode, 'self');
});

test('figures keep descriptions and resolve inside repository assets', () => {
  const illustrated = bank.questions.filter(q => q.figure);
  assert.ok(illustrated.some(q => q.themeId === 'M40'));
  assert.ok(illustrated.some(q => q.themeId === 'M55'));
  for (const q of illustrated) {
    assert.ok(q.figureAlt.length > 20, q.code);
    assert.ok(fs.existsSync(path.resolve(__dirname, '..', q.figure)), q.figure);
    assert.ok(source.figures.some(figure => figure.asset === q.figure), q.code);
  }
});

test('invalid levels and duplicate questions fail before output', () => {
  const changed = structuredClone(source);
  changed.blocks[0].items[0].level = 5;
  assert.throws(() => buildBank(JSON.stringify(changed)), /Nivel inválido/);
  changed.blocks[0].items[0].level = 1;
  changed.blocks[0].items[1].q = changed.blocks[0].items[0].q;
  assert.throws(() => buildBank(JSON.stringify(changed)), /duplicado/);
});
