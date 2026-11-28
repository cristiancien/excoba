/** Evaluador determinista de respuestas abiertas (limpieza regex, extracción, redondeo a 2 decimales y sonda algebraica segura). */
(function (root) {
  'use strict';

  const MULTI_UNIT_RE = /\b(?:a(?:n|ñ)os?|grados?|deg|rad|cm2|cm\^2|cm|mm|km|m2|m\^2|m\/s2|m\/s\^2|m\/s|km\/h|u2|u\^2|kg|g\/mol|mg|ml|litros?|horas?|min|seg|pesos?|unidades?|libros?|toneladas?|ohms?|hz|mol)\b/gi;
  const SINGLE_UNIT_AFTER_NUM_RE = /(?<=\d|\)|pi)\s*(?:m|s|g|l|u|n|j|w|v|a)\b/gi;

  function roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  // Evaluador aritmético seguro por descenso recursivo (sin eval/Function): soporta +, -, *, /, ^, (), sqrt, sin, cos, tan, pi, variable x
  function evalSafeExpr(expr, xVal = null) {
    let s = String(expr || '').toLowerCase().replace(/\s+/g, '');
    if (!s) return null;
    // Multiplicación implícita segura: 2x -> 2*x, 2( -> 2*(, )x -> )*x, )( -> )*(, 2pi -> 2*pi, x( -> x*(
    s = s
      .replace(/(\d)(pi|sqrt|sin|cos|tan|x|\()/g, '$1*$2')
      .replace(/(pi|x|\))(\d|pi|sqrt|sin|cos|tan|x|\()/g, '$1*$2')
      .replace(/pi/g, String(Math.PI));
    if (xVal !== null) s = s.replace(/\bx\b/g, `(${xVal})`);
    if (/[^0-9+\-*/^().a-z]/.test(s)) return null;

    const toks = s.match(/(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|sqrt|sin|cos|tan|[+\-*/^()])/g);
    if (!toks || toks.join('') !== s) return null;
    let i = 0;

    const parseAdd = () => {
      let v = parseMul();
      while (toks[i] === '+' || toks[i] === '-') {
        const op = toks[i++];
        v = op === '+' ? v + parseMul() : v - parseMul();
      }
      return v;
    };
    const parseMul = () => {
      let v = parseUnary();
      while (toks[i] === '*' || toks[i] === '/') {
        const op = toks[i++];
        const r = parseUnary();
        v = op === '*' ? v * r : (r === 0 ? NaN : v / r);
      }
      return v;
    };
    const parseUnary = () => {
      if (toks[i] === '-') { i++; return -parseUnary(); }
      if (toks[i] === '+') { i++; return parseUnary(); }
      return parsePow();
    };
    const parsePow = () => {
      let base = parsePrimary();
      if (toks[i] === '^') { i++; base = Math.pow(base, parseUnary()); }
      return base;
    };
    const parsePrimary = () => {
      const t = toks[i];
      if (t === 'sqrt' || t === 'sin' || t === 'cos' || t === 'tan') {
        i++;
        const arg = parsePrimary();
        if (t === 'sqrt') return arg >= 0 ? Math.sqrt(arg) : NaN;
        if (t === 'sin') return Math.sin(arg);
        if (t === 'cos') return Math.cos(arg);
        return Math.tan(arg);
      }
      if (t === '(') {
        i++;
        const v = parseAdd();
        if (toks[i] !== ')') return NaN;
        i++;
        return v;
      }
      i++;
      return Number(t);
    };

    const res = parseAdd();
    return i === toks.length && Number.isFinite(res) ? res : null;
  }

  function cleanMathText(raw, stripUnits = true) {
    let s = String(raw ?? '')
      .replace(/\$/g, '')
      .replace(/\\text\{([^{}]+)\}/g, ' $1 ')
      .replace(/\\mathrm\{([^{}]+)\}/g, '$1')
      .replace(/\\mathbb\s*\{?([a-z])\}?/gi, '$1')
      .replace(/\\left|\\right/g, '')
      .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
      .replace(/\\(sin|cos|tan|log|ln|pi|theta|infty)\b/gi, (_, fn) => (fn.toLowerCase() === 'infty' ? 'inf' : fn.toLowerCase()))
      .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/')
      .replace(/\\le/g, '<=').replace(/\\ge/g, '>=').replace(/\\neq/g, '!=')
      .replace(/\\pm/g, '+-')
      .replace(/π/g, 'pi').replace(/∞/g, 'inf').replace(/√/g, 'sqrt')
      .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/\*\*/g, '^')
      .replace(/\^?°/g, ' deg ')
      .replace(/[{}]/g, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\x20-\x7e]/g, ' ')
      .replace(/[.]+$/g, '')
      .trim();

    if (stripUnits) s = s.replace(MULTI_UNIT_RE, ' ').replace(SINGLE_UNIT_AFTER_NUM_RE, ' ');
    // Normaliza signos redundantes y paréntesis atómicos: (17)/(4) -> 17/4, (x-(1)) -> (x-1), +(0) -> ''
    s = s
      .replace(/\s+/g, ' ')
      .replace(/\(\s*([+-]?\d+(?:\.\d+)?|[a-z]|pi)\s*\)/g, '$1')
      .replace(/\+\s*-\s*/g, '-')
      .replace(/-\s*-\s*/g, '+')
      .replace(/\+\s*0(?![.\d])/g, '')
      .replace(/^\s*respuesta\s*:\s*/i, '')
      .trim();
    return s;
  }

  function compactMath(s) {
    return String(s || '').replace(/\s+/g, '');
  }

  function parseNumericAnswer(raw) {
    const cleaned = cleanMathText(raw, true);
    if (!cleaned) return null;
    // Extrae valor tras "x=" o texto si hay un único número/expresión
    const candidate = cleaned.replace(/^[a-z]\s*=\s*/i, '').replace(/%/g, '').trim();
    const direct = evalSafeExpr(candidate);
    if (direct !== null) return direct;
    // Extracción regex de número/fracción/potencia simple si el usuario escribió unidades extra
    const m = candidate.match(/([+-]?\d+(?:\.\d+)?(?:\s*\/\s*[+-]?\d+(?:\.\d+)?|\s*\^\s*[+-]?\d+(?:\.\d+)?)?)/);
    return m ? evalSafeExpr(m[1]) : null;
  }

  function numbersMatchRounded(userNum, expectedNum, tol = 0.01) {
    if (userNum === null || !Number.isFinite(expectedNum)) return false;
    const u2 = roundToTwo(userNum);
    const e2 = roundToTwo(expectedNum);
    return Math.abs(u2 - e2) <= Math.max(Number(tol) || 0.01, 0.01);
  }

  function matchAlgebraicByProbe(uCompact, eCompact) {
    // Soporta expresiones en x o ecuaciones y=f(x)
    const stripEqY = s => s.replace(/^[a-z]\(?x?\)?=/, '');
    const ua = stripEqY(uCompact);
    const ea = stripEqY(eCompact);
    if (!/x/.test(ua) || !/x/.test(ea)) return false;
    if (/[<>=:,;]/.test(ua) || /[<>=:,;]/.test(ea)) return false;
    const probes = [1.7, 2.3, -1.3, 3.1];
    for (const x of probes) {
      const uv = evalSafeExpr(ua, x);
      const ev = evalSafeExpr(ea, x);
      if (uv === null || ev === null) return false;
      if (Math.abs(uv - ev) > Math.max(0.02, Math.abs(ev) * 1e-3)) return false;
    }
    return true;
  }

  function matchOpenMathExpression(userRaw, expectedRaw, tol = 0.01) {
    const uClean = cleanMathText(userRaw, true);
    const eClean = cleanMathText(expectedRaw, true);
    if (!uClean || !eClean) return false;

    const uComp = compactMath(uClean);
    const eComp = compactMath(eClean);
    if (uComp === eComp) return true;

    // Par ordenado (a, b) o intervalo [a, b]
    const pairRe = /^([\[(])?([^,;[\]()]+),([^,;[\]()]+)([\])])?$/;
    const em = eComp.match(pairRe);
    const um = uComp.match(pairRe);
    if (em && um && em[1] && em[4] && !eClean.includes(' y ')) {
      const sameBrackets = (!um[1] && !um[4] && em[1] === '(' && em[4] === ')') || (um[1] === em[1] && um[4] === em[4]);
      if (sameBrackets) {
        const ok1 = matchOpenMathExpression(um[2], em[2], tol);
        const ok2 = matchOpenMathExpression(um[3], em[3], tol);
        if (ok1 && ok2) return true;
      }
    }

    // Listas de soluciones separadas por ';', ',' o conjunción española ' y ' (orden indistinto)
    const splitSol = s => s.split(/\s*(?:;|,|\by\b)\s*/i).map(p => compactMath(p).replace(/^[a-z]=/i, '')).filter(Boolean);
    const eParts = splitSol(eClean);
    const uParts = splitSol(uClean);
    if (eParts.length > 1 && uParts.length === eParts.length) {
      const used = new Set();
      const allMatched = eParts.every(ep => {
        for (let idx = 0; idx < uParts.length; idx++) {
          if (used.has(idx)) continue;
          const up = uParts[idx];
          if (up === ep) { used.add(idx); return true; }
          const un = evalSafeExpr(up), en = evalSafeExpr(ep);
          if (un !== null && en !== null && numbersMatchRounded(un, en, tol)) { used.add(idx); return true; }
        }
        return false;
      });
      if (allMatched) return true;
    }

    // Igualdad sin prefijo "x=" / "m="
    const uNoVar = uComp.replace(/^[a-z]=/i, '');
    const eNoVar = eComp.replace(/^[a-z]=/i, '');
    if (uNoVar === eNoVar) return true;

    // Comparación numérica evaluada (incluye fracciones, potencias ^, pi, sqrt, redondeo a 2 decimales)
    const un = evalSafeExpr(uNoVar);
    const en = evalSafeExpr(eNoVar);
    if (un !== null && en !== null && numbersMatchRounded(un, en, tol)) return true;

    // Equivalencia algebraica por sonda en 4 puntos (ej. 7x + 4x^2 vs 4x^2 + 7x, x/2 - 2 vs 0.5x - 2)
    if (matchAlgebraicByProbe(uComp, eComp)) return true;

    return false;
  }

  root.EXCOBA_OPEN_EVAL = {
    roundToTwo, cleanMathText, evalSafeExpr, parseNumericAnswer, numbersMatchRounded, matchOpenMathExpression,
  };
  if (typeof module === 'object' && module.exports) module.exports = root.EXCOBA_OPEN_EVAL;
})(typeof window !== 'undefined' ? window : globalThis);
