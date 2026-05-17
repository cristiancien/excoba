<template>
  <div class="app-container" style="max-width: 800px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1;">
    
    <!-- Header: Progreso y Vidas -->
    <header class="glass-panel" style="padding: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 1.5rem; color: var(--primary); margin: 0;">EXCOBA Prep</h1>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Nivel {{ currentLevel }} • Pregunta {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div style="display: flex; align-items: center; gap: 5px; color: var(--warning); font-weight: bold; font-size: 1.2rem;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          {{ score }}
        </div>
      </div>
    </header>

    <!-- Quiz View -->
    <transition name="fade" mode="out-in">
      <QuizView 
        v-if="!showFeedback && currentQuestion"
        :question="currentQuestion"
        @answer-selected="handleAnswer"
      />
      <div v-else-if="!currentQuestion" class="glass-panel" style="padding: 3rem; text-align: center;">
        <h2 style="color: var(--secondary); margin-bottom: 1rem;">¡Felicidades!</h2>
        <p>Has completado el banco de preguntas actual.</p>
        <p>Tu puntuación final: <strong>{{ score }}</strong> puntos.</p>
        <button class="btn btn-primary" @click="resetQuiz" style="margin-top: 1.5rem;">Volver a jugar</button>
      </div>
    </transition>

    <!-- Feedback Overlay -->
    <transition name="slide-up">
      <FeedbackOverlay 
        v-if="showFeedback"
        :is-correct="lastAnswerCorrect"
        :explanation="currentQuestion.explanation"
        @continue="nextQuestion"
      />
    </transition>

  </div>
</template>

<script>
const { ref, computed } = Vue;

// SFC Loader supports importing other Vue components if configured or we can load via window function, 
// but since we are using getFile, we can just use defineAsyncComponent
const { loadModule } = window['vue3-sfc-loader'];
const options = {
    moduleCache: { vue: Vue },
    async getFile(url) {
        const res = await fetch(url);
        return { getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text() }
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent });
        document.head.appendChild(style);
    }
};

export default {
  components: {
    QuizView: Vue.defineAsyncComponent(() => loadModule('./components/QuizView.vue', options)),
    FeedbackOverlay: Vue.defineAsyncComponent(() => loadModule('./components/FeedbackOverlay.vue', options))
  },
  setup() {
    const questions = ref(window.EXCOBA_QUESTIONS || []);
    const currentQuestionIndex = ref(0);
    const score = ref(0);
    const currentLevel = ref(1);
    
    const showFeedback = ref(false);
    const lastAnswerCorrect = ref(false);

    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
    const totalQuestions = computed(() => questions.value.length);

    const handleAnswer = (result) => {
      lastAnswerCorrect.value = result.isCorrect;
      if (result.isCorrect) {
        score.value += result.usedHint ? 5 : 10;
      }
      showFeedback.value = true;
    };

    const nextQuestion = () => {
      showFeedback.value = false;
      currentQuestionIndex.value++;
      // Avanzar nivel cada vez que completamos una pregunta por simplicidad en esta demo
      if (currentQuestionIndex.value % 2 === 0) currentLevel.value++;
    };

    const resetQuiz = () => {
      currentQuestionIndex.value = 0;
      score.value = 0;
      currentLevel.value = 1;
    };

    return {
      questions,
      currentQuestionIndex,
      currentQuestion,
      totalQuestions,
      score,
      currentLevel,
      showFeedback,
      lastAnswerCorrect,
      handleAnswer,
      nextQuestion,
      resetQuiz
    };
  }
}
</script>
