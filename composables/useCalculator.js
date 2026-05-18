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

  const DISPLAY_MAP = Object.freeze({ '/': '÷', '*': '×' });
  const EVAL_MAP = Object.freeze({
    '÷': '/', '×': '*',
    'sqrt(': 'Math.sqrt(', 'sin(': 'Math.sin(', 'cos(': 'Math.cos(',
    'tan(': 'Math.tan(', 'log(': 'Math.log10(', '^': '**'
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

        const res = new Function(`return ${expr}`)();
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
