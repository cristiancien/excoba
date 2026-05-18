/**
 * useCalculator - Composable for scientific calculator and unit comparison converter state and logic.
 * Follows SRP: Only handles calculator and unit conversion concerns.
 */
window.useCalculator = () => {
  const { ref, computed, watch } = Vue;

  const calcDisplay = ref('');
  const calcExpression = ref('');
  const showCalculator = ref(false);
  const showFormulario = ref(false);

  // Unit Converter State
  const activeTab = ref('calc'); // 'calc' or 'converter'
  const convertCategory = ref('longitud'); // 'longitud', 'angulos', 'velocidad'
  const convertValue = ref(1);
  const convertFrom = ref('m');

  const CATEGORY_UNITS = Object.freeze({
    longitud: [
      { id: 'm', name: 'Metros (m)', factor: 1 },
      { id: 'cm', name: 'Centímetros (cm)', factor: 0.01 },
      { id: 'in', name: 'Pulgadas (in)', factor: 0.0254 },
      { id: 'ft', name: 'Pies (ft)', factor: 0.3048 },
      { id: 'mi', name: 'Millas (mi)', factor: 1609.344 }
    ],
    angulos: [
      { id: 'rad', name: 'Radianes (rad)', factor: 180 / Math.PI }, // base unit is degrees
      { id: 'deg', name: 'Grados (°)', factor: 1 }
    ],
    velocidad: [
      { id: 'm/s', name: 'Metros/segundo (m/s)', factor: 1 },
      { id: 'km/h', name: 'Kilómetros/hora (km/h)', factor: 1 / 3.6 },
      { id: 'mph', name: 'Millas/hora (mph)', factor: 0.44704 }
    ]
  });

  watch(convertCategory, (newCat) => {
    const list = CATEGORY_UNITS[newCat] || [];
    if (list.length > 0) {
      convertFrom.value = list[0].id;
    }
  });

  const comparisonResults = computed(() => {
    const list = CATEGORY_UNITS[convertCategory.value] || [];
    const sourceUnit = list.find(u => u.id === convertFrom.value);
    if (!sourceUnit) return [];

    const val = Number(convertValue.value) || 0;
    const baseValue = val * sourceUnit.factor;

    return list.map(unit => {
      const converted = baseValue / unit.factor;
      // Truncate to maximum 6 decimals, but strip trailing zeroes
      let displayVal = parseFloat(converted.toFixed(6));
      return {
        id: unit.id,
        name: unit.name,
        value: displayVal
      };
    });
  });

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
    pressCalcKey, toggleCalculator, toggleFormulario,

    // Converter exports
    activeTab, convertCategory, convertValue, convertFrom, CATEGORY_UNITS, comparisonResults
  };
};
