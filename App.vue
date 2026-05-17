<template>
  <div class="app-layout" style="max-width: 1250px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1;">
    
    <!-- Header: Puntuación Global -->
    <header class="glass-panel" style="padding: 1rem 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 1.6rem; color: var(--primary); margin: 0; font-weight: 800;">EXCOBA Prep • Especialidad Arquitectura</h1>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Simulador Lúdico Interactivo e Inmersivo</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1rem; font-weight: 600; color: var(--text-muted);">Puntuación:</span>
        <div style="display: flex; align-items: center; gap: 5px; color: var(--warning); font-weight: 800; font-size: 1.4rem;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          {{ score }}
        </div>
      </div>
    </header>

    <!-- Main Dynamic Layout: Sidebar a la izquierda + Contenido Principal -->
    <div style="display: flex; gap: 2rem; align-items: flex-start;" class="responsive-container">
      
      <!-- Menú de la Izquierda: Temarios y Navegación de Preguntas -->
      <aside class="glass-panel sidebar" style="width: 320px; padding: 1.5rem; flex-shrink: 0; display: flex; flex-direction: column; gap: 1.2rem;">
        <h2 style="font-size: 1.15rem; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 800; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.8rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          Temas de Estudio
        </h2>
        
        <div class="sidebar-scroll" style="overflow-y: auto; max-height: 60vh; display: flex; flex-direction: column; gap: 1.2rem; padding-right: 5px;">
          <div v-for="(group, topicName) in groupedQuestions" :key="topicName" class="topic-group">
            <h3 style="font-size: 0.85rem; color: var(--primary); margin-bottom: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; background-color: var(--primary); border-radius: 50%;"></span>
              {{ topicName }}
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <button 
                v-for="q in group" 
                :key="q.id"
                @click="jumpToQuestion(q.originalIndex)"
                class="sidebar-q-btn"
                :class="{ 'active': currentQuestionIndex === q.originalIndex }"
              >
                <span class="q-badge">Q{{ q.id }}</span>
                <span class="q-text">{{ cleanQuestionText(q.question) }}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenido Principal: Breadcrumb, Progreso y Pregunta -->
      <main style="flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0;">
        
        <!-- Breadcrumb & Progreso -->
        <div class="glass-panel" style="padding: 1.2rem 1.8rem; display: flex; flex-direction: column; gap: 0.8rem;">
          <nav class="breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); flex-wrap: wrap;">
            <span style="cursor: pointer; transition: color 0.2s;" @click="resetQuiz">EXCOBA</span>
            <span style="opacity: 0.5;">/</span>
            <span>{{ activeTopicGroup }}</span>
            <span style="opacity: 0.5;">/</span>
            <span style="color: var(--primary); font-weight: 800;">Pregunta {{ currentQuestionIndex + 1 }}</span>
          </nav>
          
          <!-- Barra de Progreso Integrada en el Breadcrumb -->
          <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
            <div class="progress-container" style="flex: 1; height: 10px; background: rgba(0, 0, 0, 0.08);">
              <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span style="font-size: 0.9rem; font-weight: 800; color: var(--primary); min-width: 45px; text-align: right;">
              {{ progressPercentage }}%
            </span>
          </div>
        </div>

        <!-- Quiz View Area -->
        <transition name="fade" mode="out-in">
          <QuizView 
            v-if="!showFeedback && currentQuestion"
            :question="currentQuestion"
            @answer-selected="handleAnswer"
          />
          
          <div v-else-if="!currentQuestion" class="glass-panel" style="padding: 4rem 2rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
            <h2 style="color: var(--secondary); font-size: 2rem; margin-bottom: 1rem; font-weight: 800;">¡Felicidades, Futuro Universitario!</h2>
            <p style="font-size: 1.15rem; max-width: 500px; margin: 0 auto 2rem; color: var(--text-muted);">
              Has recorrido con éxito todo el banco de preguntas oficial del temario EXCOBA. ¡Tu dedicación dará grandes frutos!
            </p>
            <div class="glass-panel" style="display: inline-block; padding: 1rem 2rem; margin-bottom: 2rem; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.2);">
              <span style="font-size: 1.1rem; color: var(--text-muted);">Puntuación Final:</span>
              <h3 style="font-size: 2.2rem; color: var(--secondary); margin: 0.2rem 0 0; font-weight: 800;">{{ score }} Puntos</h3>
            </div>
            <br>
            <button class="btn btn-primary" @click="resetQuiz" style="padding: 14px 32px; font-size: 1.15rem;">Volver a Intentar</button>
          </div>
        </transition>

      </main>

    </div>

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

    const showFeedback = ref(false);
    const lastAnswerCorrect = ref(false);

    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
    const totalQuestions = computed(() => questions.value.length);

    // Calcular el porcentaje de progreso acumulado basado en el índice
    const progressPercentage = computed(() => {
      if (totalQuestions.value === 0) return 0;
      return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100);
    });

    // Agrupar preguntas dinámicamente por la primera sección de su temática ("Matemáticas", "Física", etc)
    const groupedQuestions = computed(() => {
      const groups = {};
      questions.value.forEach((q, idx) => {
        const mainTopic = q.topic.split(' - ')[0] || q.topic;
        if (!groups[mainTopic]) {
          groups[mainTopic] = [];
        }
        groups[mainTopic].push({
          ...q,
          originalIndex: idx
        });
      });
      return groups;
    });

    // Obtener la categoría activa de la pregunta actual para el Breadcrumb
    const activeTopicGroup = computed(() => {
      if (!currentQuestion.value) return 'Finalizado';
      return currentQuestion.value.topic.split(' - ')[0];
    });

    // Limpiar el formato de LaTeX y saltos de línea para mostrar un extracto limpio en el menú
    const cleanQuestionText = (text) => {
      if (!text) return '';
      return text
        .replace(/\$(.*?)\$/g, '$1') // quitar delimitadores LaTeX
        .replace(/\\(.*?)\b/g, '') // limpiar escapes LaTeX comunes
        .replace(/<br>/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\*\*/g, '')
        .trim()
        .substring(0, 32) + '...';
    };

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
    };

    const jumpToQuestion = (idx) => {
      showFeedback.value = false;
      currentQuestionIndex.value = idx;
    };

    const resetQuiz = () => {
      currentQuestionIndex.value = 0;
      score.value = 0;
      showFeedback.value = false;
    };

    return {
      questions,
      currentQuestionIndex,
      currentQuestion,
      totalQuestions,
      progressPercentage,
      groupedQuestions,
      activeTopicGroup,
      cleanQuestionText,
      score,
      showFeedback,
      lastAnswerCorrect,
      handleAnswer,
      nextQuestion,
      jumpToQuestion,
      resetQuiz
    };
  }
}
</script>
