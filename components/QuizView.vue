<template>
  <div class="glass-panel" style="padding: 2rem;">
    <!-- Topic and Question -->
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <span style="display: inline-block; padding: 4px 12px; background: rgba(79, 70, 229, 0.1); color: var(--primary); border-radius: 20px; font-weight: 600; font-size: 0.9rem;">
          {{ question.topic }}
        </span>
        <button 
          @click="toggleTTS" 
          class="btn" 
          style="background: transparent; border: 1px solid var(--glass-border); color: var(--primary); padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;"
          :title="isPlayingTTS ? 'Pausar Lectura' : 'Escuchar Pregunta'"
        >
          <span style="font-size: 0.95rem; font-weight: 900; user-select: none;">{{ isPlayingTTS ? '‖' : '▶' }}</span>
          {{ isPlayingTTS ? 'Pausar' : 'Dictar' }}
        </button>
      </div>
      <h2 v-latex="question.question" style="font-size: 1.6rem; margin-bottom: 1rem; line-height: 1.4;"></h2>
    </div>

    <!-- TIPO 1: Opción Múltiple (Standard) -->
    <div v-if="!question.type || question.type === 'multiple'" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
      <div 
        v-for="(option, index) in shuffledOptions" 
        :key="option.id"
        class="option-card"
        :class="{ 
          'selected': selectedOption === option.id,
          'correct': showResult && option.isCorrect,
          'wrong': showResult && selectedOption === option.id && !option.isCorrect
        }"
        @click="selectOption(option.id)"
      >
        <span style="margin-right: 15px; font-weight: bold; color: var(--text-muted);">{{ String.fromCharCode(65 + index) }}</span>
        <span v-latex="option.text" style="flex: 1;"></span>
        
        <!-- Icons for feedback -->
        <span v-if="showResult && option.isCorrect" style="color: var(--secondary); font-size: 1.4rem; font-weight: 900; user-select: none;">✓</span>
        <span v-if="showResult && selectedOption === option.id && !option.isCorrect" style="color: var(--danger); font-size: 1.4rem; font-weight: 900; user-select: none;">✗</span>
      </div>
    </div>

    <!-- TIPO 2: Pregunta Abierta (type: 'open') -->
    <div v-else-if="question.type === 'open'" style="margin-bottom: 2rem;">
      <label style="font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.5rem;">Escribe tu respuesta aquí</label>
      <input 
        type="text" 
        v-model="openAnswer" 
        :disabled="showResult"
        placeholder="Escribe tu respuesta..."
        style="width: 100%; max-width: 400px; padding: 12px 16px; border-radius: 12px; border: 2px solid var(--glass-border); font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text-main); background: var(--calc-tab-bg-active); outline: none; transition: all 0.2s;"
        :class="{ 'correct-border': showResult && isOpenAnswerCorrect, 'wrong-border': showResult && !isOpenAnswerCorrect }"
      />
      <!-- Feedback de la respuesta -->
      <div v-if="showResult" style="margin-top: 1rem; font-size: 0.95rem;">
        <span v-if="isOpenAnswerCorrect" style="color: var(--secondary); font-weight: 700; display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 1.25rem; font-weight: 900; user-select: none;">✓</span>
          ¡Correcto! Tu respuesta: "{{ openAnswer }}"
        </span>
        <span v-else style="color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 1.25rem; font-weight: 900; user-select: none;">✗</span>
          Incorrecto. Tu respuesta: "{{ openAnswer }}". Respuesta correcta: "{{ question.correctAnswer }}"
        </span>
      </div>
    </div>

    <!-- TIPO 3: Pregunta de Tabla / Clasificación (type: 'table') -->
    <div v-else-if="question.type === 'table'" style="margin-bottom: 2rem; overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 450px; background: rgba(255,255,255,0.25); border-radius: 12px; overflow: hidden;" class="custom-matching-table">
        <thead>
          <tr style="border-bottom: 2px solid var(--glass-border); background: rgba(0,0,0,0.03);">
            <th style="padding: 12px 16px; text-align: left; font-weight: 800; color: var(--text-main); font-size: 0.85rem; text-transform: uppercase;">{{ question.headers[0] }}</th>
            <th v-for="h in question.headers.slice(1)" :key="h" style="padding: 12px 16px; text-align: center; font-weight: 800; color: var(--text-main); font-size: 0.85rem; text-transform: uppercase; width: 120px;">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in question.rows" :key="row.id" style="border-bottom: 1px solid rgba(0,0,0,0.06); transition: background 0.15s ease;">
            <td v-latex="row.text" style="padding: 14px 16px; font-size: 0.95rem; color: var(--text-main); line-height: 1.4;"></td>
            <td v-for="h in question.headers.slice(1)" :key="h" style="padding: 14px 16px; text-align: center;">
              <button 
                @click="setTableRowSelection(row.id, h)"
                :disabled="showResult"
                class="table-choice-btn"
                :class="{ 
                  'selected': tableAnswers[row.id] === h,
                  'correct': showResult && row.correct === h,
                  'wrong': showResult && tableAnswers[row.id] === h && row.correct !== h
                }"
                style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--glass-border); cursor: pointer; transition: all 0.2s; background: transparent; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted);"
              >
                {{ h[0] }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions (Hint & Submit & Navigation) -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-border); padding-top: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <!-- Navigation (Anterior / Siguiente) -->
      <div style="display: flex; gap: 0.6rem; align-items: center;">
        <button 
          @click="$emit('prev')" 
          class="btn btn-secondary" 
          :disabled="!hasPrev"
          style="padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.9rem;"
        >
          ← Anterior
        </button>
        <button 
          @click="$emit('next-nav')" 
          class="btn btn-secondary" 
          :disabled="!hasNext"
          style="padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 0.9rem;"
        >
          Siguiente →
        </button>
      </div>

      <!-- Action Panel -->
      <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
        <button 
          v-if="!showHint && !showResult && !hintAlreadyUsed" 
          @click="useHint" 
          class="btn pulse-hint" 
          style="background: transparent; color: var(--warning); border: 2px solid var(--warning); display: flex; align-items: center; gap: 6px;"
        >
          <span style="font-size: 1.15rem; font-weight: 900; user-select: none;">?</span>
          Pista (-3 pts)
        </button>
        <div v-if="showHint || hintAlreadyUsed" class="glass-panel" style="padding: 0.6rem 1.2rem; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); font-size: 0.9rem; border-radius: 12px; max-width: 280px;">
          ✦ <strong>Pista:</strong> {{ question.hint }}
        </div>
        
        <button 
          v-if="showResult"
          @click="$emit('show-feedback')"
          class="btn btn-secondary" 
          style="min-width: 120px;"
        >
          🔍 Ver Explicación
        </button>
        <button 
          v-else
          class="btn btn-primary" 
          :disabled="!isAnswerFilled"
          @click="submitAnswer"
          style="min-width: 120px;"
        >
          Comprobar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, watch, computed, onUnmounted } = Vue;

export default {
  props: {
    question: Object,
    pastAnswer: {
      type: Object,
      default: null
    },
    hintAlreadyUsed: {
      type: Boolean,
      default: false
    },
    hasPrev: {
      type: Boolean,
      default: false
    },
    hasNext: {
      type: Boolean,
      default: false
    }
  },
  emits: ['answer-selected', 'hint-used', 'prev', 'next-nav', 'show-feedback'],
  setup(props, { emit }) {
    const selectedOption = ref(null);
    const openAnswer = ref('');
    const tableAnswers = ref({});
    const showResult = ref(false);
    const showHint = ref(false);
    const hintUsed = ref(false);
    const shuffledOptions = ref([]);

    // Fisher-Yates shuffle
    const shuffleArray = (arr) => {
      if (!arr || arr.length === 0) return [];
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const initQuestionState = () => {
      selectedOption.value = null;
      openAnswer.value = '';
      tableAnswers.value = {};
      showResult.value = false;
      showHint.value = false;
      hintUsed.value = false;

      if (props.pastAnswer) {
        showResult.value = true;
        if (props.question.type === 'open') {
          openAnswer.value = props.pastAnswer.openAnswer || '';
        } else if (props.question.type === 'table') {
          tableAnswers.value = props.pastAnswer.tableAnswers || {};
        } else {
          selectedOption.value = props.pastAnswer.selectedOptionId;
          if (props.pastAnswer.shuffledOptions) {
            shuffledOptions.value = props.pastAnswer.shuffledOptions;
          } else {
            shuffledOptions.value = shuffleArray(props.question.options);
          }
        }
      } else {
        if (!props.question.type || props.question.type === 'multiple') {
          shuffledOptions.value = shuffleArray(props.question.options);
        }
      }
    };

    // Reset state when question changes
    watch(() => props.question, () => {
      // Stop any active TTS when navigating
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      initQuestionState();
    });
    
    // Initialize on load
    initQuestionState();

    const selectOption = (id) => {
      if (!showResult.value) {
        selectedOption.value = id;
      }
    };

    const setTableRowSelection = (rowId, choice) => {
      if (!showResult.value) {
        tableAnswers.value[rowId] = choice;
      }
    };

    const isAnswerFilled = computed(() => {
      if (props.question.type === 'open') {
        return openAnswer.value.trim() !== '';
      } else if (props.question.type === 'table') {
        if (!props.question.rows) return false;
        return props.question.rows.every(row => tableAnswers.value[row.id] !== undefined);
      }
      return selectedOption.value !== null;
    });

    const cleanMathStr = (s) => {
      if (s === null || s === undefined) return '';
      let str = String(s).toLowerCase();

      // Remove outer $ and $$
      str = str.replace(/^\$\$?/, '').replace(/\$\$?$/, '');

      // Strip LaTeX \text{...} wrappers but keep contents
      str = str.replace(/\\text\s*\{([^}]*)\}/g, '$1');

      // Strip LaTeX formatting
      str = str.replace(/\\left/g, '').replace(/\\right/g, '');
      str = str.replace(/\\quad/g, ' ').replace(/\\,/g, ' ');

      // Convert LaTeX fractions \frac{a}{b} (or frac{a}{b}) to standard (a)/(b)
      let prev;
      do {
        prev = str;
        str = str.replace(/\\?frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '($1)/($2)');
      } while (str !== prev);

      // Convert LaTeX square roots \sqrt{a} to sqrt(a)
      do {
        prev = str;
        str = str.replace(/\\?sqrt\s*\{([^}]*)\}/g, 'sqrt($1)');
      } while (str !== prev);

      // Replace multiplication and division symbols
      str = str.replace(/\\cdot/g, '*').replace(/\\times/g, '*').replace(/\\div/g, '/');

      // Normalize variables
      str = str.replace(/\\theta/g, 'theta').replace(/\\pi/g, 'pi');

      // Strip degrees
      str = str.replace(/\^?\\?circ/g, '');
      str = str.replace(/°/g, '');

      // Normalize mixed fractions with spaces to whole(num)/(den) before removing other spaces
      // e.g. "1 7/8" -> "1(7)/(8)"
      str = str.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, '$1($2)/($3)');
      // e.g. "1 (7)/(8)" -> "1(7)/(8)"
      str = str.replace(/\b(\d+)\s+\(([^)]+)\)\/\(([^)]+)\)/g, '$1($2)/($3)');

      // Strip leading single-letter coordinate label, e.g. v(2,1) -> (2,1) or c(3,-5) -> (3,-5)
      str = str.replace(/^[a-z_][a-z0-9_]*\(/, '(');

      // Remove common units/words
      const units = [
        'kilogramos', 'kilogramo', 'kg', 'cajas', 'caja', 'piezas', 'pieza',
        'metros', 'metro', 'cm\\^2', 'cm\\^3', 'cm', 'grados', 'pesos', 'peso',
        'km', 'horas', 'hora', 'hz', 'segundos', 'segundo', 'de la recta', 'recta',
        'asíntota vertical', 'asíntota horizontal', 'asíntota', 'focos', 'foco',
        'eje mayor', 'centro', 'radio', 'amplitud', 'periodo', 'frecuencia'
      ];
      units.forEach(unit => {
        str = str.replace(new RegExp(`\\b${unit}\\b`, 'g'), '');
      });

      // Strip whitespace
      str = str.replace(/\s+/g, '');

      return str;
    };

    const isNumericString = (s) => {
      const clean = s.trim();
      // Match standard numbers/decimals
      if (/^[+-]?\d+(\.\d+)?$/.test(clean)) return true;
      // Match simple fractions like "2/5"
      if (/^[+-]?\d+\/\d+$/.test(clean)) return true;
      // Match mixed fractions like "1(7)/(8)" or "1(7)/8"
      if (/^[+-]?\d+\(\d+\)\/\(\d+\)$/.test(clean)) return true;
      return false;
    };

    const evaluateFraction = (str) => {
      if (!str) return null;
      let s = String(str).trim().replace(/\s+/g, ' ');

      // Match mixed fraction: e.g. "1 7/8"
      const parts = s.split(/\s+/);
      if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracFlat = parts[1].replace(/[()]/g, '');
        const fracMatch = fracFlat.match(/^([+-]?\d+)\/(\d+)$/);
        if (fracMatch) {
          const num = parseFloat(fracMatch[1]);
          const den = parseFloat(fracMatch[2]);
          if (den !== 0) {
            const sign = whole >= 0 ? 1 : -1;
            return whole + sign * (num / den);
          }
        }
      }

      // Also support cases where there is no space but parentheses are there: "1(7)/(8)"
      let mixedMatch = s.match(/^([+-]?\d+)\((\d+)\)\/\((\d+)\)$/);
      if (mixedMatch) {
        const whole = parseFloat(mixedMatch[1]);
        const num = parseFloat(mixedMatch[2]);
        const den = parseFloat(mixedMatch[3]);
        if (den !== 0) {
          const sign = whole >= 0 ? 1 : -1;
          return whole + sign * (num / den);
        }
      }

      // Simple fraction: e.g. "3/4" or "(3)/(4)" or "-1/3"
      let flat = s.replace(/[()\s]/g, '');
      const simpleMatch = flat.match(/^([+-]?\d+)\/(\d+)$/);
      if (simpleMatch) {
        const num = parseFloat(simpleMatch[1]);
        const den = parseFloat(simpleMatch[2]);
        if (den !== 0) return num / den;
      }

      return null;
    };

    const isOpenAnswerCorrect = computed(() => {
      if (props.question.type !== 'open') return false;

      const userAnsRaw = openAnswer.value;
      const correctAnsRaw = props.question.correctAnswer;
      const acceptableAnswers = props.question.acceptableAnswers || [];

      const userClean = cleanMathStr(userAnsRaw);
      const correctClean = cleanMathStr(correctAnsRaw);

      const cleanList = [correctClean, ...acceptableAnswers.map(ans => cleanMathStr(ans))];

      // Try exact cleaned string match first
      for (const target of cleanList) {
        if (userClean === target && userClean !== '') {
          return true;
        }
      }

      // Try parsing variable equation prefixes. E.g. "x = 10" -> "10"
      const stripVarPrefix = (s) => {
        return s.replace(/(^|[,;])\s*[a-z_][a-z0-9_]*\s*=/gi, '$1');
      };

      const userNoVar = stripVarPrefix(userClean);
      const cleanListNoVar = cleanList.map(stripVarPrefix);

      // Try match after stripping variable prefixes
      for (const target of cleanListNoVar) {
        if (userNoVar === target && userNoVar !== '') {
          return true;
        }
      }

      // Try numeric comparison (decimal evaluation) - only if BOTH are numeric strings
      if (isNumericString(userNoVar)) {
        const userVal = evaluateFraction(userNoVar) ?? evaluateFraction(userAnsRaw) ?? parseFloat(userNoVar);
        if (userVal !== null && !isNaN(userVal)) {
          for (const target of cleanListNoVar) {
            if (isNumericString(target)) {
              const targetVal = evaluateFraction(target) ?? parseFloat(target);
              if (targetVal !== null && !isNaN(targetVal) && Math.abs(userVal - targetVal) < 0.001) {
                return true;
              }
            }
          }
        }
      }

      // Handle lists/coordinates component-wise (e.g. "(2, 1)" vs "2, 1" vs "V(2,1)")
      const cleanListOrParen = (s) => s.replace(/[()]/g, '').split(/[,;]/).map(x => x.trim()).filter(Boolean);
      const uComponents = cleanListOrParen(userNoVar);

      for (const target of cleanListNoVar) {
        const tComponents = cleanListOrParen(target);
        if (uComponents.length === tComponents.length && uComponents.length > 0) {
          let allComponentsMatch = true;
          for (let i = 0; i < uComponents.length; i++) {
            const uc = uComponents[i];
            const tc = tComponents[i];
            if (uc === tc) continue;
            if (isNumericString(uc) && isNumericString(tc)) {
              const ucVal = evaluateFraction(uc) ?? parseFloat(uc);
              const tcVal = evaluateFraction(tc) ?? parseFloat(tc);
              if (ucVal !== null && !isNaN(ucVal) && tcVal !== null && !isNaN(tcVal)) {
                if (Math.abs(ucVal - tcVal) < 0.001) {
                  continue;
                }
              }
            }
            allComponentsMatch = false;
            break;
          }
          if (allComponentsMatch) return true;
        }
      }

      return false;
    });

    const useHint = () => {
      showHint.value = true;
      hintUsed.value = true;
      emit('hint-used');
    };

    const submitAnswer = () => {
      let isCorrect = false;
      
      if (props.question.type === 'open') {
        isCorrect = isOpenAnswerCorrect.value;
      } else if (props.question.type === 'table') {
        isCorrect = props.question.rows.every(row => tableAnswers.value[row.id] === row.correct);
      } else {
        const option = shuffledOptions.value.find(o => o.id === selectedOption.value);
        isCorrect = option ? option.isCorrect : false;
      }

      showResult.value = true;
      
      // Wait for feedback animation
      setTimeout(() => {
        emit('answer-selected', {
          isCorrect,
          usedHint: hintUsed.value,
          selectedOptionId: selectedOption.value,
          openAnswer: openAnswer.value,
          tableAnswers: { ...tableAnswers.value },
          shuffledOptions: [...shuffledOptions.value]
        });
      }, 1000);
    };

    // --- Text-To-Speech (Asistente de Voz) ---
    const isPlayingTTS = ref(false);
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    // Setup SpeechSynthesis voice loading with robust fallback
    const loadVoices = () => {
      if (synth && synth.getVoices) {
        synth.getVoices();
      }
    };
    loadVoices();
    if (synth && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const toggleTTS = () => {
      if (isPlayingTTS.value) {
        if (synth) synth.cancel();
        isPlayingTTS.value = false;
        return;
      }
      
      if (!synth) return;

      // Cancelar cualquier lectura activa antes de iniciar una nueva
      synth.cancel();
      
      let cleanText = props.question.question;

      // ===== ESTRATEGIA: Procesar bloques LaTeX ($...$) separados del texto normal =====
      // Esto evita que los guiones bajos de ortografía (actri_) se confundan con subíndices LaTeX (a_n)
      
      // Función auxiliar para limpiar un segmento LaTeX
      const cleanLatexSegment = (latex) => {
        let t = latex;
        // Fracciones
        while (t.includes('\\frac')) {
          t = t.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '$1 entre $2');
        }
        // Raíces
        while (t.includes('\\sqrt')) {
          t = t.replace(/\\sqrt\s*\{([^}]*)\}/g, 'raíz cuadrada de $1');
        }
        // \text{...} → contenido
        t = t.replace(/\\text\{\s*([^}]*)\s*\}/g, ' $1 ');
        // Grados: ^{\circ} o ^\circ → "grados"
        t = t.replace(/\^\s*\{?\s*\\circ\s*\}?/g, ' grados');
        t = t.replace(/\\circ/g, ' grados');
        // Símbolos LaTeX → español
        const latexSymbols = [
          [/\\cdot/g, ' por '], [/\\times/g, ' por '], [/\\div/g, ' entre '],
          [/\\Delta/g, ' delta '], [/\\theta/g, ' teta '], [/\\pi/g, ' pi '],
          [/\\alpha/g, ' alfa '], [/\\beta/g, ' beta '], [/\\gamma/g, ' gama '],
          [/\\lambda/g, ' lambda '], [/\\mu/g, ' miu '], [/\\rho/g, ' ro '],
          [/\\omega/g, ' omega '], [/\\cos/g, ' coseno de '], [/\\sin/g, ' seno de '],
          [/\\tan/g, ' tangente de '], [/\\log_b/g, ' logaritmo base b de '],
          [/\\log/g, ' logaritmo de '], [/\\sum/g, ' sumatoria de '],
          [/\\infty/g, ' infinito '], [/\\approx/g, ' aproximadamente '],
          [/\\neq/g, ' diferente de '], [/\\leq/g, ' menor o igual que '],
          [/\\geq/g, ' mayor o igual que '], [/\\dots/g, ' etcétera '],
          [/\\implies/g, ' entonces '], [/\\pm/g, ' más menos '],
          [/\\left/g, ''], [/\\right/g, ''], [/\\quad/g, ' '],
        ];
        for (const [regex, translation] of latexSymbols) {
          t = t.replace(regex, translation);
        }
        // Eliminar comandos LaTeX restantes
        t = t.replace(/\\([a-zA-Z]+)/g, '');
        // Subíndices: a_{n} → "a sub n", a_n → "a sub n"
        t = t.replace(/([a-zA-Z0-9])\s*_\{([^}]+)\}/g, '$1 sub $2');
        t = t.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, '$1 sub $2');
        // Superíndices: x^{3} → "x elevado a la 3", x^3 → "x elevado a la 3"
        t = t.replace(/([a-zA-Z0-9)])\s*\^\{([^}]+)\}/g, '$1 elevado a la $2');
        t = t.replace(/([a-zA-Z0-9)])\^([a-zA-Z0-9])/g, '$1 elevado a la $2');
        // Limpiar llaves y signos ^ restantes
        t = t.replace(/[{}^]/g, ' ');
        return t;
      };

      // Separar bloques LaTeX ($$...$$ y $...$) del texto normal
      // Primero procesamos $$ (display math), luego $ (inline math)
      cleanText = cleanText.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => cleanLatexSegment(latex));
      cleanText = cleanText.replace(/\$(.*?)\$/g, (_, latex) => cleanLatexSegment(latex));

      // ===== Procesar texto no-LaTeX =====
      // Guiones consecutivos (______ = espacio en blanco en preguntas de completar)
      cleanText = cleanText.replace(/_{2,}/g, ' espacio en blanco ');
      // Guiones individuales en preguntas de ortografía (actri_, de_idió) → quitar silenciosamente
      cleanText = cleanText.replace(/_/g, '');

      // Traducir operaciones matemáticas restantes en texto plano
      cleanText = cleanText.replace(/(\d+)\s*-\s*(\d+)/g, '$1 menos $2');
      cleanText = cleanText.replace(/(^|[\s(])-\s*(\d+)/g, '$1menos $2');

      // Limpiar HTML, markdown y formato residual
      cleanText = cleanText.replace(/<[^>]*>?/gm, ' ');
      cleanText = cleanText.replace(/\*\*/g, '');
      cleanText = cleanText.replace(/\$/g, '');

      // Reemplazar múltiples espacios por uno solo para mejorar la cadencia del habla
      cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
      currentUtterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance.lang = 'es-MX';
      
      // Forzar voz en español usando coincidencia flexible (tags de idioma con guion o guion bajo)
      if (synth && synth.getVoices) {
        let voices = synth.getVoices();
        console.log('=== TTS Debug ===');
        console.log('Total voices available:', voices.length);
        
        const cleanLang = (l) => (l || '').toLowerCase().replace(/_/g, '-');
        
        let spanishVoice = voices.find(v => cleanLang(v.lang) === 'es-mx') ||
                           voices.find(v => cleanLang(v.lang) === 'es-es') ||
                           voices.find(v => cleanLang(v.lang) === 'es-us') ||
                           voices.find(v => cleanLang(v.lang).startsWith('es')) ||
                           voices.find(v => (v.name || '').toLowerCase().includes('spanish')) ||
                           voices.find(v => (v.name || '').toLowerCase().includes('español'));
                            
        if (spanishVoice) {
          console.log('Selected Spanish voice:', spanishVoice.name, `(${spanishVoice.lang})`);
          currentUtterance.voice = spanishVoice;
          currentUtterance.lang = spanishVoice.lang;
        } else {
          console.warn('No Spanish voice found! Available voices were:', voices.map(v => `${v.name} (${v.lang})`));
        }
        console.log('=================');
      }
      
      currentUtterance.onend = () => {
        isPlayingTTS.value = false;
      };
      
      currentUtterance.onerror = () => {
        isPlayingTTS.value = false;
      };
      
      isPlayingTTS.value = true;
      synth.speak(currentUtterance);
    };

    onUnmounted(() => {
      if (synth && synth.speaking) synth.cancel();
    });

    return {
      selectedOption,
      openAnswer,
      tableAnswers,
      showResult,
      showHint,
      hintUsed,
      shuffledOptions,
      selectOption,
      setTableRowSelection,
      isAnswerFilled,
      isOpenAnswerCorrect,
      useHint,
      submitAnswer,
      isPlayingTTS,
      toggleTTS
    };
  }
}
</script>
