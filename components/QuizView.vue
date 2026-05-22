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
          <svg v-if="!isPlayingTTS" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
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
        <svg v-if="showResult && option.isCorrect" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--secondary)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <svg v-if="showResult && selectedOption === option.id && !option.isCorrect" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger)"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ¡Correcto! Tu respuesta: "{{ openAnswer }}"
        </span>
        <span v-else style="color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
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
          style="background: transparent; color: var(--warning); border: 2px solid var(--warning);"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Pista (-3 pts)
        </button>
        <div v-if="showHint || hintAlreadyUsed" class="glass-panel" style="padding: 0.6rem 1.2rem; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); font-size: 0.9rem; border-radius: 12px; max-width: 280px;">
          💡 <strong>Pista:</strong> {{ question.hint }}
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

    const isOpenAnswerCorrect = computed(() => {
      if (props.question.type !== 'open') return false;
      const cleanStr = (s) => String(s).toLowerCase().replace(/[\s\\*]/g, '').trim();
      const userAns = cleanStr(openAnswer.value);
      const isMatch = userAns === cleanStr(props.question.correctAnswer) || 
                      (props.question.acceptableAnswers || []).some(ans => userAns === cleanStr(ans));
      return isMatch;
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

      // 1. Reemplazar fracciones LaTeX \frac{A}{B} por "A entre B"
      while (cleanText.includes('\\frac')) {
        cleanText = cleanText.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '$1 entre $2');
      }

      // 2. Reemplazar raíces LaTeX \sqrt{A} por "raíz cuadrada de A"
      while (cleanText.includes('\\sqrt')) {
        cleanText = cleanText.replace(/\\sqrt\s*\{([^}]*)\}/g, 'raíz cuadrada de $1');
      }

      // 3. Traducir subíndices de variables (ej. P_1, v_{0x}, k_e) a formato hablado "sub ..." para evitar lectura literal de guion bajo
      cleanText = cleanText.replace(/_\{([^}]+)\}/g, ' sub $1');
      cleanText = cleanText.replace(/_([a-zA-Z0-9])/g, ' sub $1');

      // 4. Traducir superíndices (potencias ej. x^3, d^2) a formato hablado "elevado a la ..."
      cleanText = cleanText.replace(/\^\{([^}]+)\}/g, ' elevado a la $1');
      cleanText = cleanText.replace(/\^([a-zA-Z0-9])/g, ' elevado a la $1');

      // 5. Traducir símbolos LaTeX matemáticos y griegos comunes a español
      const latexTranslations = {
        '\\\\cdot': ' por ',
        '\\\\Delta': ' delta ',
        '\\\\theta': ' theta ',
        '\\\\pi': ' pi ',
        '\\\\alpha': ' alfa ',
        '\\\\beta': ' beta ',
        '\\\\gamma': ' gama ',
        '\\\\lambda': ' lambda ',
        '\\\\mu': ' miu ',
        '\\\\sum': ' suma de ',
        '\\\\infty': ' infinito ',
        '\\\\approx': ' aproximado a ',
        '\\\\neq': ' no es igual a ',
        '\\\\leq': ' menor o igual que ',
        '\\\\geq': ' mayor o igual que ',
        '\\\\dots': ' y así sucesivamente ',
        '\\\\circ': ' grados '
      };

      for (const [latex, translation] of Object.entries(latexTranslations)) {
        cleanText = cleanText.replace(new RegExp(latex, 'g'), translation);
      }

      // 6. Traducir unidades y términos de física/matemáticas a palabras fluidas
      cleanText = cleanText.replace(/\\text\{\s*m\/s\s*\}/g, ' metros por segundo ');
      cleanText = cleanText.replace(/m\/s/g, ' metros por segundo ');
      cleanText = cleanText.replace(/\\mu\text\{\s*C\s*\}/g, ' micro coulombs ');
      cleanText = cleanText.replace(/\\mu C/g, ' micro coulombs ');
      cleanText = cleanText.replace(/\\text\{\s*metros\s*\}/g, ' metros ');

      // 7. Traducir signos de menos en contextos matemáticos y números negativos
      cleanText = cleanText.replace(/(\d+)\s*-\s*(\d+)/g, '$1 menos $2');
      cleanText = cleanText.replace(/(^|[\s(])-\s*(\d+)/g, '$1menos $2');

      // 8. Reemplazar líneas de guiones bajos consecutivos (como ______ en Español) por "espacio en blanco"
      cleanText = cleanText.replace(/_{2,}/g, ' espacio en blanco ');

      // 9. Remover cualquier guion bajo individual restante (ej. en ortografía: actri_, de_idió) para que se lea la palabra de corrido
      cleanText = cleanText.replace(/_/g, '');

      // Eliminar cualquier comando LaTeX remanente de la lectura
      cleanText = cleanText.replace(/\\([a-zA-Z]+)/g, '');

      // 10. Limpiar signos de dólar de LaTeX
      cleanText = cleanText.replace(/\$/g, '');

      // 11. Eliminar llaves de LaTeX remanentes
      cleanText = cleanText.replace(/[{}]/g, ' ');

      // 12. Eliminar etiquetas HTML
      cleanText = cleanText.replace(/<[^>]*>?/gm, ' ');

      // 13. Eliminar marcas de negrita u otros formatos de markdown
      cleanText = cleanText.replace(/\*\*/g, '');
      
      // 14. Reemplazar múltiples espacios por uno solo para mejorar la cadencia del habla
      cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
      currentUtterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance.lang = 'es-MX';
      
      // Forzar voz en español usando coincidencia flexible (tags de idioma con guion o guion bajo)
      if (synth && synth.getVoices) {
        const voices = synth.getVoices();
        const cleanLang = (l) => l.toLowerCase().replace(/_/g, '-');
        
        let spanishVoice = voices.find(v => cleanLang(v.lang) === 'es-mx') ||
                           voices.find(v => cleanLang(v.lang) === 'es-es') ||
                           voices.find(v => cleanLang(v.lang) === 'es-us') ||
                           voices.find(v => cleanLang(v.lang).startsWith('es')) ||
                           voices.find(v => v.name.toLowerCase().includes('spanish')) ||
                           voices.find(v => v.name.toLowerCase().includes('español'));
                           
        if (spanishVoice) {
          currentUtterance.voice = spanishVoice;
          currentUtterance.lang = spanishVoice.lang;
        }
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
