/**
 * Parser y validador de bancos de reactivos en Markdown estructurado (EXCOBA-MD v1).
 * Sin dependencias externas, sin evaluación dinámica y seguro para navegador + Node.
 */
(function (root) {
  'use strict';

  const MAX_INPUT_BYTES = 2 * 1024 * 1024;
  const MAX_QUESTIONS = 1000;
  const REVIEW_REQUIRED = /justifica|explica|comprueba|demuestra|corrige|dibuja|traza|representa|construye|describe|modelo|factoriza|racionaliza|fracción irreducible|notación científica|decimal exacto|redondea/i;
  const LEVEL_ALIASES = Object.freeze({
    '1': 1, facil: 1, easy: 1, basico: 1,
    '2': 2, medio: 2, intermedio: 2, medium: 2,
    '3': 3, semidificil: 3, avanzado: 3,
    '4': 4, dificil: 4, hard: 4
  });

  function normKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  function hash32(text) {
    let h = 2166136261;
    const str = String(text || '');
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function parseLevel(value, fallback = 2) {
    if (value === undefined || value === null || value === '') return fallback;
    const key = normKey(value);
    if (key in LEVEL_ALIASES) return LEVEL_ALIASES[key];
    const num = Number(value);
    if (Number.isInteger(num) && num >= 1 && num <= 4) return num;
    return null;
  }

  function isSafeFigureUrl(raw) {
    const url = String(raw || '').trim();
    if (!url || /\s/.test(url)) return false;
    if (/^https:\/\/[^\s"'<>]+$/i.test(url)) return true;
    if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(url)) return true;
    if (/^(?:\.\/)?assets\/[\w./-]+$/.test(url) && !url.includes('..')) return true;
    return false;
  }

  function hasBalancedMath(text) {
    const s = String(text || '');
    let count = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === '$') { i++; continue; }
      if (s[i] === '$') count++;
    }
    return count % 2 === 0;
  }

  function getParseScalar() {
    if (root.EXCOBA_ANSWER_VALIDATION && typeof root.EXCOBA_ANSWER_VALIDATION.parseScalar === 'function') {
      return root.EXCOBA_ANSWER_VALIDATION.parseScalar;
    }
    if (typeof require === 'function') {
      try { return require('./answerValidation.js').parseScalar; } catch (_) { /* optional */ }
    }
    return null;
  }

  function parseFrontmatter(lines) {
    const meta = {};
    let startIndex = 0;
    while (startIndex < lines.length && !lines[startIndex].trim()) startIndex++;
    if (lines[startIndex]?.trim() !== '---') return { meta, bodyStart: 0 };
    let endIndex = -1;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { endIndex = i; break; }
    }
    if (endIndex === -1) return { meta, bodyStart: 0 };
    for (let i = startIndex + 1; i < endIndex; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      const sep = line.indexOf(':');
      if (sep <= 0) continue;
      const key = normKey(line.slice(0, sep));
      const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
      if (key) meta[key] = val;
    }
    return { meta, bodyStart: endIndex + 1 };
  }

  function applyMetaKey(target, rawKey, rawVal) {
    const key = normKey(rawKey);
    const val = String(rawVal || '').trim();
    if (!val) return false;
    if (['tipo', 'type'].includes(key)) { target.type = normKey(val); return true; }
    if (['nivel', 'level', 'dificultad'].includes(key)) { target.levelRaw = val; return true; }
    if (['etapa', 'section', 'seccion'].includes(key)) { target.section = val; return true; }
    if (['materia', 'topic', 'asignatura'].includes(key)) { target.topic = val; return true; }
    if (['tema', 'theme'].includes(key)) {
      if (val.includes('/')) {
        const parts = val.split('/').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) { target.section = parts[0]; target.topic = parts[1]; if (parts[2]) target.theme = parts[2]; return true; }
      }
      target.theme = val; return true;
    }
    if (['themeid', 'idtema', 'bloque'].includes(key)) { target.themeId = val; return true; }
    if (['codigo', 'code', 'id'].includes(key)) { target.code = val; return true; }
    if (['habilidad', 'skill', 'subtema', 'subtopic'].includes(key)) { target.skill = val; return true; }
    if (['modo', 'mode', 'answermode'].includes(key)) { target.answerMode = normKey(val); return true; }
    if (['respuesta', 'answer', 'correcta', 'correctanswer'].includes(key)) { target.correctAnswer = val; return true; }
    if (['aceptables', 'acceptable', 'acceptableanswers'].includes(key)) {
      target.acceptableAnswers = val.split('|').map(s => s.trim()).filter(Boolean);
      return true;
    }
    if (['explicacion', 'explanation', 'solucion', 'criterio', 'work'].includes(key)) { target.explanation = val; return true; }
    if (['pista', 'hint'].includes(key)) { target.hint = val; return true; }
    return false;
  }

  function parseHeading(headingText, index) {
    const parts = headingText.split('|').map(s => s.trim()).filter(Boolean);
    const info = { code: '', type: '', skill: '', levelRaw: '', section: '', topic: '', theme: '', themeId: '', answerMode: '' };
    const positional = [];
    for (const part of parts) {
      const colon = part.indexOf(':');
      if (colon > 0 && applyMetaKey(info, part.slice(0, colon), part.slice(colon + 1))) continue;
      positional.push(part);
    }
    if (positional[0]) info.code = positional[0];
    if (positional[1]) {
      const t = normKey(positional[1]);
      if (['multiple', 'opcionmultiple', 'mcq', 'open', 'abierta', 'table', 'tabla'].includes(t)) info.type = t;
      else info.skill = positional[1];
    }
    if (positional[2] && !info.skill) info.skill = positional[2];
    if (!info.code) info.code = `MD.${String(index + 1).padStart(3, '0')}`;
    return info;
  }

  function normalizeType(rawType) {
    const t = normKey(rawType);
    if (!t) return '';
    if (['multiple', 'opcionmultiple', 'mcq'].includes(t)) return 'multiple';
    if (['open', 'abierta'].includes(t)) return 'open';
    if (['table', 'tabla'].includes(t)) return 'table';
    return 'invalid';
  }

  function parseTable(tableLines, startLine) {
    if (tableLines.length < 3) throw new Error(`Línea ${startLine}: la tabla necesita encabezado, separador y al menos una fila.`);
    const splitRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    const headers = splitRow(tableLines[0]);
    const sep = splitRow(tableLines[1]);
    if (headers.length < 3 || sep.length !== headers.length || !sep.every(c => /^:?-{2,}:?$/.test(c))) {
      throw new Error(`Línea ${startLine}: tabla Markdown inválida (requiere columna de texto + al menos 2 opciones).`);
    }
    const rows = [];
    for (let i = 2; i < tableLines.length; i++) {
      const cells = splitRow(tableLines[i]);
      if (cells.length !== headers.length) throw new Error(`Línea ${startLine + i}: la fila tiene ${cells.length} columnas y se esperaban ${headers.length}.`);
      const text = cells[0];
      if (!text) throw new Error(`Línea ${startLine + i}: falta el texto de la fila.`);
      const marked = [];
      for (let c = 1; c < cells.length; c++) {
        if (/^(?:x|✓|✔|\*|1|si|sí)$/i.test(cells[c])) marked.push(headers[c]);
      }
      if (marked.length !== 1) throw new Error(`Línea ${startLine + i}: marca exactamente una columna correcta con "x" en "${text}".`);
      rows.push({ id: `row_${i - 1}`, text, correct: marked[0] });
    }
    return { headers, rows };
  }

  function parseMarkdownBank(markdownText, options = {}) {
    if (typeof markdownText !== 'string') throw new Error('El contenido Markdown debe ser texto.');
    if (markdownText.length > MAX_INPUT_BYTES) throw new Error('El archivo Markdown excede el límite de 2 MB.');
    const raw = markdownText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const lines = raw.split('\n');
    const { meta: fm, bodyStart } = parseFrontmatter(lines);
    const defaults = {
      title: fm.title || fm.titulo || options.title || 'Banco Markdown',
      section: fm.section || fm.etapa || fm.seccion || 'Personalizado',
      topic: fm.topic || fm.materia || fm.asignatura || 'Práctica Markdown',
      themeId: fm.themeid || fm.idtema || fm.codigo || 'MD01',
      theme: fm.theme || fm.tema || fm.title || fm.titulo || options.title || 'Banco Markdown',
      skill: fm.skill || fm.habilidad || 'Práctica general',
      level: parseLevel(fm.level || fm.nivel || fm.dificultad, 2) || 2
    };

    const blocks = [];
    let current = null;
    for (let i = bodyStart; i < lines.length; i++) {
      const line = lines[i];
      if (/^#\s+/.test(line) && !current && !fm.title && !fm.titulo) {
        const headingTitle = line.replace(/^#\s+/, '').trim();
        if (headingTitle) { defaults.title = headingTitle; if (!fm.theme && !fm.tema) defaults.theme = headingTitle; }
        continue;
      }
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        if (current) blocks.push(current);
        current = { heading: match[1].trim(), startLine: i + 1, lines: [] };
      } else if (current) {
        current.lines.push({ text: line, lineNo: i + 1 });
      }
    }
    if (current) blocks.push(current);
    if (!blocks.length) throw new Error('No se encontraron reactivos. Usa encabezados "## Código | tipo | habilidad" para cada pregunta.');
    if (blocks.length > MAX_QUESTIONS) throw new Error(`El banco supera el máximo permitido de ${MAX_QUESTIONS} reactivos.`);

    const parseScalar = getParseScalar();
    const questions = [];
    const warnings = [];
    const seenCodes = new Set();
    const version = 'md-' + hash32(raw);

    for (let idx = 0; idx < blocks.length; idx++) {
      const block = blocks[idx];
      const info = parseHeading(block.heading, idx);
      const stimulusLines = [];
      const promptLines = [];
      const optionItems = [];
      const tableLines = [];
      let tableStartLine = 0;
      let figure = '';
      let figureAlt = '';
      let figureCaption = '';

      for (const entry of block.lines) {
        const trimmed = entry.text.trim();
        if (!trimmed) {
          if (promptLines.length && promptLines[promptLines.length - 1] !== '') promptLines.push('');
          continue;
        }
        const dirMatch = trimmed.match(/^!([a-záéíóúüñA-Z_-]+)\s*:\s*(.*)$/);
        if (dirMatch) {
          if (!applyMetaKey(info, dirMatch[1], dirMatch[2])) {
            warnings.push(`Línea ${entry.lineNo}: directiva ignorada "!${dirMatch[1]}".`);
          }
          continue;
        }
        const quoteMatch = trimmed.match(/^>\s?(.*)$/);
        if (quoteMatch) { stimulusLines.push(quoteMatch[1]); continue; }

        const optMatch = trimmed.match(/^[-*]\s+\[([ xX✓✔])\]\s+(.+)$/);
        if (optMatch) {
          optionItems.push({ id: `opt_${optionItems.length + 1}`, text: optMatch[2].trim(), isCorrect: optMatch[1] !== ' ' });
          continue;
        }

        const figMatch = trimmed.match(/^!\[([^\]]*)\]\((.+)\)$/);
        if (figMatch) {
          let rawTarget = figMatch[2].trim();
          let caption = '';
          const capMatch = rawTarget.match(/^(.*?)\s+"([^"]*)"$/);
          if (capMatch) { rawTarget = capMatch[1].trim(); caption = capMatch[2].trim(); }
          if (!isSafeFigureUrl(rawTarget)) {
            throw new Error(`Línea ${entry.lineNo}: ruta de figura no permitida (${rawTarget}). Usa ./assets/..., https:// o data:image base64.`);
          }
          figure = rawTarget;
          figureAlt = figMatch[1].trim() || 'Figura de apoyo para el ejercicio';
          figureCaption = caption;
          continue;
        }

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (!tableStartLine) tableStartLine = entry.lineNo;
          tableLines.push(trimmed);
          continue;
        }

        promptLines.push(trimmed);
      }

      const questionText = promptLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      if (!questionText) throw new Error(`Línea ${block.startLine}: el reactivo "${info.code}" no tiene enunciado.`);

      let explicitType = normalizeType(info.type);
      if (explicitType === 'invalid') throw new Error(`Línea ${block.startLine}: tipo no reconocido "${info.type}". Usa multiple, open o table.`);
      const inferredType = optionItems.length ? 'multiple' : tableLines.length ? 'table' : 'open';
      const type = explicitType || inferredType;

      const level = parseLevel(info.levelRaw, defaults.level);
      if (!level) throw new Error(`Línea ${block.startLine}: nivel inválido "${info.levelRaw}" (usa 1–4 o fácil/medio/semidifícil/difícil).`);

      let code = info.code;
      if (seenCodes.has(code)) {
        warnings.push(`Línea ${block.startLine}: código duplicado "${code}", renombrado automáticamente.`);
        code = `${code}_${idx + 1}`;
      }
      seenCodes.add(code);

      const section = info.section || defaults.section;
      const topic = info.topic || defaults.topic;
      const themeId = info.themeId || defaults.themeId;
      const theme = info.theme || defaults.theme;
      const skill = info.skill || defaults.skill;
      const stimulus = stimulusLines.join('\n').trim();
      const explanation = info.explanation || '';
      const hint = info.hint || '';

      for (const [label, value] of [['enunciado', questionText], ['estímulo', stimulus], ['explicación', explanation], ['pista', hint]]) {
        if (value && !hasBalancedMath(value)) warnings.push(`Línea ${block.startLine}: delimitadores "$" desbalanceados en ${label} de "${code}".`);
      }

      const q = {
        id: `md:${version}:${idx + 1}`,
        code,
        section,
        topic,
        themeId,
        theme,
        subtopic: skill,
        skill,
        level,
        question: questionText,
        type,
        explanation
      };
      if (stimulus) q.stimulus = stimulus;
      if (hint) q.hint = hint;
      if (figure) {
        q.figure = figure;
        q.figureAlt = figureAlt;
        if (figureCaption) q.figureCaption = figureCaption;
      }

      if (type === 'multiple') {
        if (optionItems.length < 2) throw new Error(`Línea ${block.startLine}: "${code}" (multiple) necesita al menos 2 opciones "- [ ]".`);
        const correctCount = optionItems.filter(o => o.isCorrect).length;
        if (correctCount !== 1) throw new Error(`Línea ${block.startLine}: "${code}" (multiple) debe marcar exactamente 1 opción correcta con "- [x]".`);
        q.options = optionItems;
        q.answerMode = 'exact';
        q.correctAnswer = optionItems.find(o => o.isCorrect).text;
      } else if (type === 'table') {
        const parsedTable = parseTable(tableLines, tableStartLine || block.startLine);
        q.headers = parsedTable.headers;
        q.rows = parsedTable.rows;
        q.answerMode = 'exact';
      } else {
        const correctAnswer = (info.correctAnswer || '').trim();
        if (!correctAnswer) throw new Error(`Línea ${block.startLine}: "${code}" (open) requiere la directiva "!respuesta: ...".`);
        q.correctAnswer = correctAnswer;
        if (info.acceptableAnswers && info.acceptableAnswers.length) q.acceptableAnswers = info.acceptableAnswers;
        if (info.answerMode === 'exact' || info.answerMode === 'self') {
          q.answerMode = info.answerMode;
        } else {
          const reviewRequired = REVIEW_REQUIRED.test(`${questionText} ${stimulus}`);
          q.answerMode = !reviewRequired && parseScalar && parseScalar(correctAnswer) ? 'exact' : 'self';
        }
      }

      questions.push(q);
    }

    const byType = { multiple: 0, open: 0, table: 0 };
    for (const q of questions) byType[q.type] = (byType[q.type] || 0) + 1;

    return {
      meta: {
        version,
        title: defaults.title,
        questionCount: questions.length,
        byType,
        source: 'markdown'
      },
      questions,
      warnings
    };
  }

  const SAMPLE_MARKDOWN = `---
title: Práctica rápida EXCOBA-MD
section: Bachillerato
topic: Matemáticas para cálculo
themeId: MD01
theme: Repaso mixto Markdown
level: 2
---

## Q1 | multiple | Derivadas básicas | nivel: 2
> Recuerda la regla de la potencia: $\\frac{d}{dx}(x^n) = n x^{n-1}$.

¿Cuál es la derivada de $f(x) = x^3$?

- [ ] $x^2$
- [x] $3x^2$
- [ ] $3x^3$
- [ ] $2x^3$

!pista: Multiplica por el exponente y réstale $1$.
!explicacion: Al aplicar la regla de la potencia sobre $x^3$ se obtiene $3x^2$.

## Q2 | open | Fracciones equivalentes | nivel: 1 | tema: Primaria / Matemáticas
Simplifica la fracción $\\frac{6}{8}$ (escribe fracción o decimal).

!respuesta: 3/4
!aceptables: 0.75
!explicacion: Dividiendo numerador y denominador entre $2$ resulta $\\frac{3}{4} = 0.75$.

## Q3 | open | Razonamiento abierto | nivel: 4 | modo: self
Explica brevemente por qué la suma de dos números pares siempre es par.

!respuesta: Si $a = 2m$ y $b = 2n$, entonces $a + b = 2(m + n)$, que es múltiplo de $2$.
!explicacion: Criterio: expresar ambos números como múltiplos de $2$ y factorizar el $2$ en la suma.

## Q4 | table | Clasificación de polígonos | nivel: 1 | tema: Secundaria / Matemáticas
Selecciona el número de lados de cada polígono.

| Figura | 3 lados | 4 lados | 5 lados |
| --- | --- | --- | --- |
| Triángulo | x | | |
| Cuadrado | | x | |
| Pentágono | | | x |

!explicacion: Triángulo tiene 3 lados, cuadrado 4 y pentágono 5.
`;

  const api = { parseMarkdownBank, isSafeFigureUrl, SAMPLE_MARKDOWN, MAX_INPUT_BYTES, MAX_QUESTIONS };
  root.EXCOBA_MARKDOWN_BANK = api;
  if (typeof module === 'object' && module.exports) module.exports = api;

  if (typeof require === 'function' && typeof module === 'object' && require.main === module) {
    const fs = require('node:fs');
    const path = require('node:path');
    const args = process.argv.slice(2);
    const file = args.find(a => !a.startsWith('-'));
    if (!file) {
      console.error('Uso: node composables/markdownBank.js <banco.md> [--json]');
      process.exit(1);
    }
    try {
      const content = fs.readFileSync(path.resolve(file), 'utf8');
      const parsed = parseMarkdownBank(content, { title: path.basename(file, path.extname(file)) });
      if (args.includes('--json')) console.log(JSON.stringify(parsed, null, 2));
      else console.log(JSON.stringify({ ok: true, meta: parsed.meta, warnings: parsed.warnings }));
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
