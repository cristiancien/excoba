/** Deterministic answers only. Symbolic proofs and prose require an explicit review. */
(function (root) {
  'use strict';
  const normalizeText = value => String(value ?? '').normalize('NFKC').trim()
    .replace(/^\$+|\$+$/g, '').replace(/[−–]/g, '-').replace(/\s+/g, ' ')
    .replace(/[.]$/, '').trim().toLocaleLowerCase('es');
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
  const rational = (n, d = 1n) => {
    if (d === 0n) throw new Error('division');
    if (n.toString().length > 2048 || d.toString().length > 2048) throw new Error('size');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); return { n: n / g, d: d / g };
  };
  const units = {
    'cm': ['length', 1n, 100n], 'm': ['length', 1n, 1n], 'km': ['length', 1000n, 1n], 'mm': ['length', 1n, 1000n],
    'cm2': ['area', 1n, 10000n], 'm2': ['area', 1n, 1n], 'km2': ['area', 1000000n, 1n],
    'cm3': ['volume', 1n, 1000000n], 'm3': ['volume', 1n, 1n], 'l': ['volume', 1n, 1000n], 'ml': ['volume', 1n, 1000000n],
    'kg': ['mass', 1n, 1n], 'g': ['mass', 1n, 1000n], 's': ['time', 1n, 1n], 'min': ['time', 60n, 1n], 'h': ['time', 3600n, 1n],
    '%': ['', 1n, 100n], 'grados': ['angle', 1n, 1n], 'hz': ['frequency', 1n, 1n], 'pesos': ['currency', 1n, 1n]
  };
  const aliases = { metros: 'm', metro: 'm', centimetros: 'cm', centimetro: 'cm', kilogramos: 'kg', kilogramo: 'kg', gramos: 'g', segundos: 's', segundo: 's', minutos: 'min', minuto: 'min', horas: 'h', hora: 'h', litros: 'l', litro: 'l', peso: 'pesos', '°': 'grados' };
  function parseScalar(value) {
    let str = String(value ?? '').normalize('NFKC').trim();
    if (!str || str.length > 256) return null;
    str = str.replace(/\$/g, '').replace(/[−–]/g, '-').replace(/\\(?:left|right)/g, '')
      .replace(/\\(?:,|;|!)/g, '').replace(/\\(?:cdot|times)/g, '*').replace(/\\div/g, '/')
      .replace(/\^?\{?\\circ\}?/g, ' grados').replace(/\\text\{([^{}]*)\}/g, '$1')
      .replace(/\^([23])\b/g, '^$1').replace(/\^\{([23])\}/g, '^$1')
      .replace(/\.$/, '').trim();
    // Scalar equation prefixes are explicit labels, not arbitrary algebra.
    str = str.replace(/^[a-zA-Z]\s*=\s*/, '');
    let unit = '';
    const unitMatch = str.match(/\s*(cm\^?[23]|m\^?[23]|km\^?2|mm|cm|km|kg|ml|hz|metros?|cent[ií]metros?|kilogramos?|gramos?|segundos?|minutos?|horas?|litros?|pesos?|grados|min|m|g|s|h|l|%|°)\s*$/i);
    if (unitMatch) {
      unit = unitMatch[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace('^', '');
      unit = aliases[unit] || unit;
      str = str.slice(0, unitMatch.index).trim();
    }
    // Convert nested numeric LaTeX fractions with a bounded, terminating pass.
    for (let pass = 0; pass < 12; pass++) {
      const next = str.replace(/\\(?:dfrac|tfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))');
      if (next === str) break; str = next;
    }
    const mixed = str.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) str = `${mixed[1]}(${mixed[2]}+${mixed[3]}/${mixed[4]})`;
    if (/^[+-]?\d+,\d+$/.test(str)) str = str.replace(',', '.');
    str = str.replace(/\s/g, '');
    if (!/^[\d.+\-*/^()]+$/.test(str) || str.length > 256) return null;
    const tokens = str.match(/\d+(?:\.\d*)?|\.\d+|[()+\-*/^]/g) || [];
    if (!tokens.length || tokens.join('') !== str || tokens.length > 128) return null;
    let position = 0; let depth = 0;
    const add = (a, b) => rational(a.n * b.d + b.n * a.d, a.d * b.d);
    const mul = (a, b) => rational(a.n * b.n, a.d * b.d);
    const divide = (a, b) => rational(a.n * b.d, a.d * b.n);
    function atom() {
      if (++depth > 20) throw new Error('depth');
      const t = tokens[position++]; let v;
      if (t === '(') { v = expression(); if (tokens[position++] !== ')') throw new Error('parenthesis'); }
      else if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t || '')) {
        const [whole, decimals = ''] = t.split('.');
        if (decimals.length > 24 || (whole || '').length > 30) throw new Error('size');
        v = rational(BigInt((whole || '0') + decimals), 10n ** BigInt(decimals.length));
      } else throw new Error('token');
      depth--; return v;
    }
    function power() {
      let v = atom();
      if (tokens[position] === '^') {
        position++; const exponent = unary();
        if (exponent.d !== 1n || exponent.n < -20n || exponent.n > 20n) throw new Error('exponent');
        if (exponent.n === 0n && v.n === 0n) throw new Error('indeterminate');
        if (Math.max(v.n.toString().length,v.d.toString().length)*Math.abs(Number(exponent.n))>2048) throw new Error('size');
        v = exponent.n < 0n ? rational(v.d ** -exponent.n, v.n ** -exponent.n) : rational(v.n ** exponent.n, v.d ** exponent.n);
      }
      return v;
    }
    function unary() {
      if (tokens[position] === '+') { position++; return unary(); }
      if (tokens[position] === '-') { position++; const v = unary(); return { n: -v.n, d: v.d }; }
      return power();
    }
    function term() {
      let v = unary();
      while (tokens[position] === '*' || tokens[position] === '/') {
        const op = tokens[position++]; const rhs = unary(); v = op === '*' ? mul(v, rhs) : divide(v, rhs);
      }
      return v;
    }
    function expression() {
      let v = term();
      while (tokens[position] === '+' || tokens[position] === '-') {
        const op = tokens[position++]; const rhs = term(); v = add(v, op === '+' ? rhs : { n: -rhs.n, d: rhs.d });
      }
      return v;
    }
    try {
      const result = expression(); if (position !== tokens.length) return null;
      return { ...result, unit };
    } catch (_) { return null; }
  }
  function sameNumeric(student, expected, tolerance = 0) {
    if (!student || !expected) return false;
    const su = student.unit || expected.unit;
    const eu = expected.unit || '';
    const sc = units[su] || ['', 1n, 1n]; const ec = units[eu] || ['', 1n, 1n];
    if (sc[0] !== ec[0] || (su && !units[su]) || (eu && !units[eu])) return false;
    let s,e;try{s=rational(student.n*sc[1],student.d*sc[2]);e=rational(expected.n*ec[1],expected.d*ec[2]);}catch(_){return false;}
    const matches = value => {
      if (value.n * e.d === e.n * value.d) return true;
      return Number.isFinite(tolerance) && tolerance > 0 && tolerance <= 1
        && Math.abs(Number(value.n) / Number(value.d) - Number(e.n) / Number(e.d)) <= tolerance;
    };
    if (matches(s)) return true;
    // Percentages also have an exact dimensionless fractional representation.
    return expected.unit === '%' && !student.unit ? matches(student) : false;
  }
  function gradeExact(question, input) {
    if (question?.answerMode === 'self') return { verdict: 'needs_review', method: 'self' };
    const targets = [question?.correctAnswer, ...(question?.acceptableAnswers || [])].filter(v => v !== undefined && v !== null);
    const normalized = normalizeText(input);
    if (!normalized) return { verdict: 'needs_review', method: 'exact', feedback: 'Escribe una respuesta antes de comprobar.' };
    for (const target of targets) {
      if (normalized === normalizeText(target)) return { verdict: 'correct', method: 'exact' };
      if (sameNumeric(parseScalar(input), parseScalar(target), question.numericTolerance || 0)) return { verdict: 'correct', method: 'exact' };
    }
    return { verdict: targets.length ? 'incorrect' : 'needs_review', method: 'exact' };
  }
  function validateModelVerdict(payload) {
    if (!payload || !['correct', 'incorrect', 'needs_review'].includes(payload.verdict) || typeof payload.feedback !== 'string' || typeof payload.confidence !== 'number' || !Number.isFinite(payload.confidence) || payload.confidence < 0 || payload.confidence > 1) {
      throw new Error('La respuesta de Gemini no tiene el formato esperado. Puedes reintentar o revisar por tu cuenta.');
    }
    return { verdict: payload.confidence < 0.85 ? 'needs_review' : payload.verdict, feedback: payload.feedback.slice(0, 1200), confidence: payload.confidence };
  }
  const api = { normalizeText, parseScalar, sameNumeric, gradeExact, validateModelVerdict };
  root.EXCOBA_ANSWER_VALIDATION = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
