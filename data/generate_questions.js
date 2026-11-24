#!/usr/bin/env node
'use strict';
/** Fuente editorial JSON -> artefactos estáticos. No ejecuta contenido del banco. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseScalar } = require('../composables/answerValidation.js');

const REVIEW_REQUIRED = /justifica|explica|comprueba|demuestra|corrige|dibuja|traza|representa|construye|describe|modelo|factoriza|racionaliza|fracción irreducible|notación científica|decimal exacto|redondea/i;
const PRIMARY_MATH = new Set([1, 4, 5, 6, 7, 8, 9, 10, 11]);
const SECONDARY_MATH = new Set([2, 3, 12, 13, 14, 15, 16, 17, 18, 26, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 45]);
function clean(value) {
  return String(value).split(/(\$[^$]*\$)/).map(part => part.startsWith('$') ? part : part
    .replace(/\b([a-záéíóúüñ]+)(?=\d)/g, '$1 ')
    .replace(/(\d)(?=(?:pesos|años|litros|grados)\b)/g, '$1 ')
    .replace(/EXCOBAoficial/g, 'EXCOBA')).join('').trim();
}
function group(code) {
  const prefix = code[0], number = Number(code.slice(1));
  if (prefix === 'M') return PRIMARY_MATH.has(number) ? ['Primaria', 'Matemáticas'] : SECONDARY_MATH.has(number) ? ['Secundaria', 'Matemáticas'] : ['Bachillerato', 'Matemáticas para cálculo'];
  if (prefix === 'E') return number <= 7 ? ['Primaria', 'Español'] : number <= 12 ? ['Secundaria', 'Español'] : ['Bachillerato', 'Lenguaje'];
  if ('GHC'.includes(prefix)) return ['Secundaria', 'Ciencias Sociales'];
  if (prefix === 'B') return number <= 4 ? ['Secundaria', 'Ciencias Naturales'] : ['Bachillerato', 'Biología'];
  if (prefix === 'Q') return number <= 4 ? ['Secundaria', 'Ciencias Naturales'] : ['Bachillerato', 'Química'];
  if (prefix === 'F') return ['Bachillerato', 'Física'];
  if (prefix === 'U') return ['Bachillerato', 'Humanidades'];
  if (prefix === 'S') return ['Bachillerato', 'Ciencias Sociales'];
  if (prefix === 'D') return ['Bachillerato', 'Económico administrativas'];
  throw new Error(`Área desconocida: ${code}`);
}
function assert(condition, message) { if (!condition) throw new Error(message); }
function buildBank(sourceBytes) {
  const raw = Buffer.isBuffer(sourceBytes) ? sourceBytes : Buffer.from(sourceBytes);
  const source = JSON.parse(raw.toString('utf8'));
  assert(source.schemaVersion === 1, 'Versión de fuente no compatible');
  assert(Array.isArray(source.blocks) && Array.isArray(source.curriculum) && Array.isArray(source.figures), 'Fuente incompleta');
  const version = 'progressivo-' + crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
  const figures = new Map(source.figures.map(figure => [figure.name, figure]));
  const questions = [], themes = [], codes = new Set();
  for (const block of source.blocks) {
    assert(/^[MBQFEGHCUSD]\d{2}$/.test(block.code) && !codes.has(block.code), `Código de tema inválido: ${block.code}`);
    codes.add(block.code);
    assert(Array.isArray(block.refs) && Array.isArray(block.items) && block.items.length === 100, `Tema incompleto: ${block.code}`);
    assert(!('figure_path' in block), `Ruta local en ${block.code}`);
    const [section, topic] = group(block.code);
    const schoolLevels = [...new Set(block.refs.filter(ref => /^[123]\./.test(ref)).map(ref => ({ 1: 'Primaria', 2: 'Secundaria', 3: 'Bachillerato' })[ref[0]]))].sort();
    if (!schoolLevels.length) schoolLevels.push(section);
    const levels = { 1: 0, 2: 0, 3: 0, 4: 0 }, seen = new Set();
    for (const [index, item] of block.items.entries()) {
      const code = `${block.code}.${String(index + 1).padStart(3, '0')}`;
      assert([1, 2, 3, 4].includes(item.level), `Nivel inválido: ${code}`);
      levels[item.level]++;
      assert(['q', 'a', 'work', 'skill'].every(key => typeof item[key] === 'string' && item[key].trim()), `Campo vacío: ${code}`);
      assert(!seen.has(item.q), `Enunciado duplicado: ${code}`); seen.add(item.q);
      for (const key of ['q', 'a', 'work']) assert((item[key].match(/\$/g) || []).length % 2 === 0, `Delimitadores de matemáticas: ${code}/${key}`);
      const q = {
        id: 10001 + questions.length, code, section, topic, themeId: block.code, theme: clean(block.title),
        subtopic: clean(item.subtopic || item.skill), skill: clean(item.skill), level: item.level,
        schoolLevels, curriculumRefs: block.refs, question: clean(item.q), type: 'open',
        correctAnswer: clean(item.a), explanation: clean(item.work), answerMode: 'self'
      };
      const context = [block.intro, block.stimulus, item.stimulus].filter(Boolean).map(clean).join(' ');
      if (context) q.stimulus = context;
      if (item.acceptableAnswers) q.acceptableAnswers = item.acceptableAnswers.map(clean);
      const reviewRequired = REVIEW_REQUIRED.test(item.q + ' ' + (block.intro || ''));
      if (!reviewRequired && parseScalar(q.correctAnswer)) q.answerMode = 'exact';
      if (block.figure && ((block.code === 'M55' && item.q.includes('Venn')) || (block.code === 'M40' && (/gráfico/i.test(item.q) || /\b[BL]\b/.test(item.q))))) {
        const figure = figures.get(block.figure);
        assert(figure && /^\.\/assets\/questions\/[\w.-]+$/.test(figure.asset), `Figura inválida: ${block.figure}`);
        q.figure = figure.asset; q.figureAlt = clean(figure.description); q.figureCaption = clean(block.figure_caption || '');
      }
      questions.push(q);
    }
    assert(Object.values(levels).every(count => count === 25), `Niveles desequilibrados: ${block.code}`);
    themes.push({ code: block.code, title: clean(block.title), area: block.area, section, topic, count: block.items.length, levels, curriculumRefs: block.refs, skills: [...new Set(block.items.map(item => clean(item.skill)))] });
  }
  const coverage = source.curriculum.map(row => ({ reference: row.reference, title: row.title, themes: source.blocks.filter(block => block.refs.includes(row.reference)).map(block => block.code) }));
  assert(new Set(coverage.map(row => row.reference)).size === coverage.length, 'Referencias curriculares duplicadas');
  assert(coverage.every(row => row.themes.length), 'Referencias curriculares sin cobertura');
  assert(questions.length === source.metadata.questionCount && themes.length === source.metadata.themeCount, 'Recuento de fuente inconsistente');
  const manifest = { version, questionCount: questions.length, themeCount: themes.length, levels: source.metadata.levels,
    questionsPerTheme: 100, questionsPerLevelPerTheme: 25, sourceLeafCount: coverage.length, coveredLeafCount: coverage.filter(row => row.themes.length).length,
    themes, coverage, sourceFiles: source.metadata.sourceFiles, editorialNote: source.metadata.editorialNote };
  const meta = { version, questionCount: questions.length, themeCount: themes.length, levels: manifest.levels };
  return { questions, manifest, meta };
}
function serializeBank(bank) {
  return {
    questions: '// Banco original de práctica. Fuente: source-bank.json. Cobertura: bank-manifest.json.\nwindow.EXCOBA_BANK_META = ' + JSON.stringify(bank.meta) + ';\nwindow.EXCOBA_QUESTIONS = [\n' + bank.questions.map(q => JSON.stringify(q)).join(',\n') + '\n];\n',
    manifest: JSON.stringify(bank.manifest, null, 2) + '\n'
  };
}
function main(args) {
  let sourcePath = path.join(__dirname, 'source-bank.json'), outDir = __dirname, check = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) sourcePath = path.resolve(args[++i]);
    else if (args[i] === '--out-dir' && args[i + 1]) outDir = path.resolve(args[++i]);
    else if (args[i] === '--check') check = true;
    else throw new Error(`Argumento desconocido o incompleto: ${args[i]}`);
  }
  const bank = buildBank(fs.readFileSync(sourcePath)), output = serializeBank(bank);
  for (const [filename, text] of [['questions.js', output.questions], ['bank-manifest.json', output.manifest]]) {
    const target = path.join(outDir, filename);
    if (check) assert(fs.existsSync(target) && fs.readFileSync(target, 'utf8') === text, `Regenera ${filename}: no coincide con la fuente`);
    else { fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(target, text, 'utf8'); }
  }
  console.log(JSON.stringify({ version: bank.meta.version, questions: bank.questions.length, themes: bank.manifest.themeCount, exact: bank.questions.filter(q => q.answerMode === 'exact').length, check }));
}
if (require.main === module) { try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; } }
module.exports = { buildBank, serializeBank, group };
