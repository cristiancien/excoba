<template>
  <div class="glass-panel" style="padding: 2rem;">
    <!-- Topic and Question -->
    <div style="margin-bottom: 2rem;">
      <span style="display: inline-block; padding: 4px 12px; background: rgba(79, 70, 229, 0.1); color: var(--primary); border-radius: 20px; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem;">
        {{ question.topic }}
      </span>
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
          class="btn btn-primary" 
          :disabled="!isAnswerFilled || showResult"
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
const { ref, watch, computed } = Vue;

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
  emits: ['answer-selected', 'hint-used', 'prev', 'next-nav'],
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
    watch(() => props.question, initQuestionState);
    
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
      submitAnswer
    };
  }
}
</script>
