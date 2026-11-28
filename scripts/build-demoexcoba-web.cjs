#!/usr/bin/env node
'use strict';
// ============================================================================
// build-demoexcoba-web.cjs - Construye data/demoexcoba-temario.js de forma
// 100% independiente de patch/, recovered/ y Licenciatura 2026-2/.
// Uso: node scripts/build-demoexcoba-web.cjs [--check]
// ============================================================================

const fs = require('node:fs');
const path = require('node:path');
const { buildShowcaseBank } = require('./lib/demoexcoba-showcase-bank.cjs');
const { buildTemarioWebBank } = require('./lib/demoexcoba-temario-web.cjs');

const REPO = path.resolve(__dirname, '..');
const OUT_FILE = path.join(REPO, 'data', 'demoexcoba-temario.js');

function buildWebPayload() {
  const showcase = buildShowcaseBank();
  const temario = buildTemarioWebBank();

  const payload = {
    version: temario.version,
    totalTopics: temario.totalTopics,
    reactivosPerTopic: temario.reactivosPerTopic,
    totalReactivos: temario.totalReactivos,
    originalCount: showcase.items.length,
    packages: [
      showcase.pkg,
      ...temario.packages.map(p => ({
        id: p.id,
        prefix: p.prefix,
        stage: p.stage,
        subject: p.subject,
        careerCode: p.careerCode,
        careerName: p.careerName,
        count: p.items.length,
        isOriginal: false,
        topics: p.topics,
      })),
    ],
    items: [...showcase.items, ...temario.items],
  };

  const js = `// Generado automaticamente por scripts/build-demoexcoba-web.cjs (${payload.originalCount} interactivos SVG/Canvas/LaTeX + ${payload.totalTopics} temas x ${payload.reactivosPerTopic} = ${payload.totalReactivos} del temario)\n`
    + `window.EXCOBA_DEMO_TEMARIO = ${JSON.stringify(payload)};\n`;

  if (/recovered\/|Excoba3\//i.test(js)) {
    throw new Error('Fallo de independencia: data/demoexcoba-temario.js contiene referencias a recovered/ o Excoba3/.');
  }
  return { payload, js };
}

if (require.main === module) {
  const checkOnly = process.argv.includes('--check');
  const { payload, js } = buildWebPayload();

  if (checkOnly) {
    const existing = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : '';
    if (existing !== js) {
      console.error('data/demoexcoba-temario.js esta desactualizado. Ejecuta: node scripts/build-demoexcoba-web.cjs');
      process.exit(1);
    }
    console.log(JSON.stringify({
      version: payload.version,
      showcase: payload.originalCount,
      temario: payload.totalReactivos,
      topics: payload.totalTopics,
      packages: payload.packages.length,
      independent: true,
      check: true,
    }));
  } else {
    fs.writeFileSync(OUT_FILE, js, 'utf8');
    console.log(`[WEB OK] data/demoexcoba-temario.js (${(Buffer.byteLength(js) / 1024).toFixed(1)} KB, ${payload.originalCount} interactivos + ${payload.totalReactivos} temario, 0 imagenes externas)`);
  }
}

module.exports = { buildWebPayload };
