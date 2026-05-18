<template>
  <div class="glass-panel" style="padding: 2rem;">
    <!-- Topic and Question -->
    <div style="margin-bottom: 2rem;">
      <span style="display: inline-block; padding: 4px 12px; background: rgba(79, 70, 229, 0.1); color: var(--primary); border-radius: 20px; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem;">
        {{ question.topic }}
      </span>
      <h2 v-latex="question.question" style="font-size: 1.6rem; margin-bottom: 1rem; line-height: 1.4;"></h2>
    </div>

    <!-- Options (shuffled) -->
    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
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
          :disabled="!selectedOption || showResult"
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
const { ref, watch } = Vue;

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
    const showResult = ref(false);
    const showHint = ref(false);
    const hintUsed = ref(false);
    const shuffledOptions = ref([]);

    // Fisher-Yates shuffle
    const shuffleArray = (arr) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const initQuestionState = () => {
      if (props.pastAnswer) {
        selectedOption.value = props.pastAnswer.selectedOptionId;
        showResult.value = true;
        showHint.value = false;
        hintUsed.value = false;
        // Use the saved shuffled order for answered questions so the review matches
        if (props.pastAnswer.shuffledOptions) {
          shuffledOptions.value = props.pastAnswer.shuffledOptions;
        } else {
          shuffledOptions.value = shuffleArray(props.question.options);
        }
      } else {
        selectedOption.value = null;
        showResult.value = false;
        showHint.value = false;
        hintUsed.value = false;
        shuffledOptions.value = shuffleArray(props.question.options);
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

    const useHint = () => {
      showHint.value = true;
      hintUsed.value = true;
      emit('hint-used');
    };

    const submitAnswer = () => {
      if (!selectedOption.value) return;
      showResult.value = true;
      
      const option = shuffledOptions.value.find(o => o.id === selectedOption.value);
      
      // Wait for feedback animation
      setTimeout(() => {
        emit('answer-selected', {
          isCorrect: option.isCorrect,
          usedHint: hintUsed.value,
          selectedOptionId: selectedOption.value,
          shuffledOptions: [...shuffledOptions.value]
        });
      }, 1000);
    };

    return {
      selectedOption,
      showResult,
      showHint,
      hintUsed,
      shuffledOptions,
      selectOption,
      useHint,
      submitAnswer
    };
  }
}
</script>
