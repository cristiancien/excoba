'use strict';
// ============================================================================
// demoexcoba-temario-web.cjs - Generador web independiente del banco Temario:
// 20 reactivos x 126 temas de Temario.pdf (2,520 reactivos) a partir de
// data/source-bank.json, sin dependencias de patch/ ni recovered/.
// ============================================================================

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseScalar } = require('../../composables/answerValidation.js');

const REVIEW_REQUIRED = /justifica|explica|comprueba|demuestra|corrige|dibuja|traza|representa|construye|describe|modelo|factoriza|racionaliza|fracción irreducible|notación científica|decimal exacto|redondea/i;

const TEMARIO_PACKAGES = Object.freeze([
  { id: 170, prefix: '1.1', stage: 'EDUCACIÓN PRIMARIA', subject: 'Español', careerCode: 'TEM170PRI01', careerName: 'TEMARIO EXCOBA - PRIMARIA ESPAÑOL (200)' },
  { id: 171, prefix: '1.2', stage: 'EDUCACIÓN PRIMARIA', subject: 'Matemáticas', careerCode: 'TEM171PRI02', careerName: 'TEMARIO EXCOBA - PRIMARIA MATEMÁTICAS (180)' },
  { id: 172, prefix: '2.1', stage: 'EDUCACIÓN SECUNDARIA', subject: 'Español', careerCode: 'TEM172SEC01', careerName: 'TEMARIO EXCOBA - SECUNDARIA ESPAÑOL (120)' },
  { id: 173, prefix: '2.2', stage: 'EDUCACIÓN SECUNDARIA', subject: 'Matemáticas', careerCode: 'TEM173SEC02', careerName: 'TEMARIO EXCOBA - SECUNDARIA MATEMÁTICAS (320)' },
  { id: 174, prefix: '2.3', stage: 'EDUCACIÓN SECUNDARIA', subject: 'Ciencias Naturales', careerCode: 'TEM174SEC03', careerName: 'TEMARIO EXCOBA - SECUNDARIA CIENCIAS NATURALES (240)' },
  { id: 175, prefix: '2.4', stage: 'EDUCACIÓN SECUNDARIA', subject: 'Ciencias Sociales', careerCode: 'TEM175SEC04', careerName: 'TEMARIO EXCOBA - SECUNDARIA CIENCIAS SOCIALES (380)' },
  { id: 176, prefix: '3.2', stage: 'BACHILLERATO', subject: 'Matemáticas para Cálculo', careerCode: 'TEM176BAC01', careerName: 'TEMARIO EXCOBA - BACHILLERATO MATEMÁTICAS CÁLCULO (500)' },
  { id: 177, prefix: '3.3', stage: 'BACHILLERATO', subject: 'Física', careerCode: 'TEM177BAC02', careerName: 'TEMARIO EXCOBA - BACHILLERATO FÍSICA (160)' },
  { id: 178, prefix: '3.5', stage: 'BACHILLERATO', subject: 'Lenguaje', careerCode: 'TEM178BAC03', careerName: 'TEMARIO EXCOBA - BACHILLERATO LENGUAJE (420)' },
]);

const REACTIVOS_PER_TOPIC = 20;

const cleanText = v => String(v ?? '').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/\s+/g, ' ').trim();

function stripLatex(value) {
  return cleanText(value)
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\times|\\cdot/g, '×').replace(/\\div/g, '÷')
    .replace(/\\pi/g, 'π').replace(/\\le/g, '≤').replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠').replace(/\\approx/g, '≈').replace(/\\pm/g, '±')
    .replace(/\\circ/g, '°').replace(/\\infty/g, '∞').replace(/[{}]/g, '')
    .replace(/\s+/g, ' ').trim();
}

function deterministicHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function deterministicShuffle(arr, seed) {
  const copy = [...arr];
  let s = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(correctAns, pool, seed, count = 3) {
  const norm = s => stripLatex(s).toLowerCase();
  const seen = new Set([norm(correctAns)]);
  const unique = [];
  for (const cand of deterministicShuffle(pool, seed)) {
    const clean = cleanText(cand);
    const key = norm(clean);
    if (!clean || clean.length > 150 || seen.has(key)) continue;
    seen.add(key);
    unique.push(clean);
    if (unique.length >= count) break;
  }
  return unique;
}

function buildNumericDistractors(val, unit, seed) {
  const out = [];
  const seen = new Set([String(val)]);
  for (const d of deterministicShuffle([1, -1, 2, -2, 3, 5, 10, 0.5], seed)) {
    const cand = Math.abs(val) >= 10 ? Math.round((val + d) * 100) / 100 : Math.round((val + d * 0.5) * 100) / 100;
    if (seen.has(String(cand))) continue;
    seen.add(String(cand));
    out.push(unit ? `${cand} ${unit}` : String(cand));
    if (out.length >= 3) break;
  }
  return out;
}

function extractShortFact(work, fallbackAnswer) {
  const clean = cleanText(work);
  const firstClause = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  if (firstClause.length >= 16 && firstClause.length <= 140 && stripLatex(firstClause).toLowerCase() !== stripLatex(fallbackAnswer).toLowerCase()) {
    return firstClause;
  }
  return `Resultado verificado: ${cleanText(fallbackAnswer)}`;
}

function selectTwentyForTopic(ref, candidateBlocks, usedIds, fallbackPool) {
  const perLevel = { 1: [], 2: [], 3: [], 4: [] };
  const allCandidates = [];
  for (const block of candidateBlocks) {
    for (let i = 0; i < block.items.length; i++) {
      const it = block.items[i];
      allCandidates.push({
        ...it, uid: `${block.code}.${String(i + 1).padStart(3, '0')}`,
        blockCode: block.code, blockTitle: block.title, area: block.area, intro: block.intro || '',
      });
    }
  }
  const offset = deterministicHash(ref) % Math.max(1, allCandidates.length);
  const rotated = [...allCandidates.slice(offset), ...allCandidates.slice(0, offset)];
  for (const cand of rotated) {
    if (perLevel[cand.level].length < 5 && !usedIds.has(cand.uid)) {
      perLevel[cand.level].push(cand);
      usedIds.add(cand.uid);
    }
  }
  const chosen = [...perLevel[1], ...perLevel[2], ...perLevel[3], ...perLevel[4]];
  if (chosen.length < REACTIVOS_PER_TOPIC) {
    const localUsed = new Set(chosen.map(c => c.uid));
    for (const cand of [...rotated, ...fallbackPool]) {
      if (chosen.length >= REACTIVOS_PER_TOPIC) break;
      if (!localUsed.has(cand.uid)) {
        chosen.push(cand);
        localUsed.add(cand.uid);
      }
    }
  }
  return chosen.slice(0, REACTIVOS_PER_TOPIC).sort((a, b) => a.level - b.level);
}

function buildReactivo(raw, { ref, topicTitle, pkg, itemIdx, topicAnswerPool, areaAnswerPool }) {
  const seed = deterministicHash(`${ref}:${itemIdx}:${raw.uid}`);
  const isMathPkg = ['1.2', '2.2', '3.2'].includes(pkg.prefix);
  const scalar = !REVIEW_REQUIRED.test(`${raw.q} ${raw.intro}`) ? parseScalar(raw.a) : null;
  const scalarVal = scalar ? Number(scalar.n) / Number(scalar.d) : NaN;
  const code = `T${ref.replace(/\./g, '_')}_${String(itemIdx + 1).padStart(2, '0')}`;

  const base = {
    id: code,
    packageId: pkg.id,
    stage: pkg.stage,
    subject: pkg.subject,
    topicRef: ref,
    topicTitle: cleanText(topicTitle),
    sourceCode: raw.uid,
    level: raw.level,
    skill: cleanText(raw.skill),
    calculator: ['1.2', '2.2', '2.3', '3.2', '3.3'].includes(pkg.prefix),
    stimulus: cleanText(raw.intro),
    question: cleanText(raw.q),
    correctAnswer: cleanText(raw.a),
    explanation: cleanText(raw.work),
  };

  // Todas las preguntas de Matemáticas son de respuesta abierta (input box, tipo 7)
  if (isMathPkg) {
    const numOk = scalar && Number.isFinite(scalarVal) && Math.abs(scalarVal) < 1e9;
    return {
      ...base,
      tipo: 7,
      numericValue: numOk ? Math.round(scalarVal * 10000) / 10000 : null,
      tolerance: numOk ? (Number.isInteger(scalarVal) ? 0.01 : 0.05) : 0.01,
      unit: numOk ? (scalar.unit || '') : '',
      expectedText: stripLatex(raw.a),
    };
  }

  if (scalar && Number.isFinite(scalarVal) && Math.abs(scalarVal) < 1e9 && itemIdx % 4 !== 3) {
    return {
      ...base,
      tipo: 7,
      numericValue: Math.round(scalarVal * 10000) / 10000,
      tolerance: Number.isInteger(scalarVal) ? 0.01 : 0.05,
      unit: scalar.unit || '',
    };
  }

  if (itemIdx % 4 === 3) {
    const distractors = pickDistractors(raw.a, [...topicAnswerPool, ...areaAnswerPool], seed, 3);
    const fallbackDist = Number.isFinite(scalarVal)
      ? buildNumericDistractors(scalarVal, scalar.unit || '', seed)
      : ['Enunciado contrario al texto', 'Dato no relacionado con el caso'];
    const wrongs = distractors.length >= 2 ? distractors.slice(0, 2) : [...distractors, ...fallbackDist].slice(0, 2);
    const statements = deterministicShuffle([
      { id: 1, text: cleanText(raw.a), category: 'correcta' },
      { id: 2, text: extractShortFact(raw.work, raw.a), category: 'correcta' },
      { id: 3, text: wrongs[0] || 'Dato incongruente con el enunciado', category: 'incorrecta' },
      { id: 4, text: wrongs[1] || 'Conclusión incompatible con el tema', category: 'incorrecta' },
    ], seed);
    return {
      ...base,
      tipo: 5,
      categories: [
        { id: 'correcta', title: 'Representa la respuesta / idea correcta' },
        { id: 'incorrecta', title: 'No corresponde al reactivo' },
      ],
      statements,
    };
  }

  let distractors = pickDistractors(raw.a, [...topicAnswerPool, ...areaAnswerPool], seed, 3);
  if (distractors.length < 3 && Number.isFinite(scalarVal)) {
    distractors = [...distractors, ...buildNumericDistractors(scalarVal, scalar.unit || '', seed)].slice(0, 3);
  }
  while (distractors.length < 3) distractors.push(`Alternativa ${distractors.length + 1}`);
  const options = deterministicShuffle([
    { id: 'A', text: cleanText(raw.a), isCorrect: true },
    ...distractors.slice(0, 3).map((text, k) => ({ id: String.fromCharCode(66 + k), text, isCorrect: false })),
  ], seed).map((opt, idx) => ({ ...opt, id: String.fromCharCode(65 + idx) }));

  return { ...base, tipo: 4, tokenId: `ID1_${code}`, options };
}

function buildTemarioWebBank(sourcePath = path.join(__dirname, '..', '..', 'data', 'source-bank.json')) {
  const rawBytes = fs.readFileSync(sourcePath);
  const source = JSON.parse(rawBytes.toString('utf8'));
  const version = 'web-demoexcoba-' + crypto.createHash('sha256').update(rawBytes).digest('hex').slice(0, 10);

  const pkgByPrefix = new Map(TEMARIO_PACKAGES.map(p => [p.prefix, p]));
  const usedIds = new Set();
  const packages = TEMARIO_PACKAGES.map(p => ({ ...p, topics: [], items: [] }));
  const pkgMap = new Map(packages.map(p => [p.id, p]));

  const areaPools = new Map();
  for (const b of source.blocks) {
    if (!areaPools.has(b.area)) areaPools.set(b.area, []);
    for (const it of b.items) areaPools.get(b.area).push(it.a);
  }

  const allTopics = [];
  const allItems = [];
  for (const row of source.curriculum) {
    const ref = row.reference;
    const prefix = ref.split('.').slice(0, 2).join('.');
    const pkgMeta = pkgByPrefix.get(prefix);
    if (!pkgMeta) throw new Error(`Prefijo de temario sin paquete: ${ref}`);
    const pkg = pkgMap.get(pkgMeta.id);

    const blocks = source.blocks.filter(b => b.refs.includes(ref));
    const fallbackPool = source.blocks
      .filter(b => b.refs.some(r => r.startsWith(prefix + '.')))
      .flatMap(b => b.items.map((it, i) => ({
        ...it, uid: `${b.code}.${String(i + 1).padStart(3, '0')}`,
        blockCode: b.code, blockTitle: b.title, area: b.area, intro: b.intro || '',
      })));

    const selected = selectTwentyForTopic(ref, blocks, usedIds, fallbackPool);
    const topicAnswerPool = blocks.flatMap(b => b.items.map(it => it.a));
    const areaAnswerPool = blocks[0] ? (areaPools.get(blocks[0].area) || []) : [];
    const startIndex = pkg.items.length + 1;
    const topicItems = selected.map((raw, itemIdx) => buildReactivo(raw, {
      ref, topicTitle: row.title, pkg, itemIdx, topicAnswerPool, areaAnswerPool,
    }));
    const topicRecord = {
      ref, title: cleanText(row.title), packageId: pkg.id,
      stage: pkg.stage, subject: pkg.subject, count: topicItems.length,
      startIndex, endIndex: startIndex + topicItems.length - 1,
    };
    pkg.topics.push(topicRecord);
    pkg.items.push(...topicItems);
    allTopics.push(topicRecord);
    allItems.push(...topicItems);
  }

  return { version, totalTopics: allTopics.length, reactivosPerTopic: REACTIVOS_PER_TOPIC, totalReactivos: allItems.length, packages, items: allItems };
}

module.exports = { buildTemarioWebBank, TEMARIO_PACKAGES, REACTIVOS_PER_TOPIC };
