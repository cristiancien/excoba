/**
 * useCalculator - Composable for scientific calculator state and logic.
 * Follows SRP: Only handles calculator concerns.
 */
window.useCalculator = () => {
  const { ref } = Vue;

  const calcDisplay = ref('');
  const calcExpression = ref('');
  const showCalculator = ref(false);
  const showFormulario = ref(false);

  const DISPLAY_MAP = Object.freeze({
    '/': '÷',
    '*': '×',
    'pi': 'π',
    'fact(': 'fact('
  });

  const EVAL_MAP = Object.freeze({
    '÷': '/',
    '×': '*',
    'π': 'Math.PI',
    'e': 'Math.E',
    'sqrt(': 'Math.sqrt(',
    'sin(': 'Math.sin(',
    'cos(': 'Math.cos(',
    'tan(': 'Math.tan(',
    'asin(': 'Math.asin(',
    'acos(': 'Math.acos(',
    'atan(': 'Math.atan(',
    'ln(': 'Math.log(',
    'log(': 'Math.log10(',
    'abs(': 'abs(',
    'fact(': 'fact(',
    '^': '**'
  });

  const pressCalcKey = (key) => {
    if (key === 'C') {
      calcDisplay.value = '';
      calcExpression.value = '';
      return;
    }
    if (key === 'Del') {
      calcDisplay.value = calcDisplay.value.slice(0, -1);
      return;
    }
    if (key === '=') {
      try {
        let expr = calcDisplay.value;
        for (const [from, to] of Object.entries(EVAL_MAP)) {
          expr = expr.replaceAll(from, to);
        }
        
        // Auto-close unclosed parentheses
        const open = (expr.match(/\(/g) || []).length;
        const close = (expr.match(/\)/g) || []).length;
        if (open > close) expr += ')'.repeat(open - close);

        // Advanced math scope inject
        const helpers = {
          fact: (n) => {
            if (n < 0 || !Number.isInteger(n)) return NaN;
            let r = 1;
            for (let i = 2; i <= n; i++) r *= i;
            return r;
          },
          abs: Math.abs,
          exp: Math.exp
        };
        const keys = Object.keys(helpers);
        const vals = Object.values(helpers);
        const runner = new Function(...keys, `return ${expr}`);
        const res = runner(...vals);

        calcExpression.value = `${calcDisplay.value} =`;
        calcDisplay.value = Number(res.toFixed(6)).toString();
      } catch {
        calcDisplay.value = 'Error';
      }
      return;
    }
    calcDisplay.value += (DISPLAY_MAP[key] ?? key);
  };

  const toggleCalculator = () => {
    showCalculator.value = !showCalculator.value;
    if (showCalculator.value) showFormulario.value = false;
  };

  const toggleFormulario = () => {
    showFormulario.value = !showFormulario.value;
    if (showFormulario.value) showCalculator.value = false;
  };

  return {
    calcDisplay, calcExpression, showCalculator, showFormulario,
    pressCalcKey, toggleCalculator, toggleFormulario
  };
};
