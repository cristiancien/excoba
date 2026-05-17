<template>
  <div class="app-layout" style="max-width: 1300px; margin: 0 auto; padding: 1.5rem; position: relative; z-index: 1;">
    
    <!-- Header: Puntuación Global -->
    <header class="glass-panel" style="padding: 1rem 2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <h1 style="font-size: 1.6rem; color: var(--primary); margin: 0; font-weight: 800;">EXCOBA Prep • Especialidad Arquitectura</h1>
        <span style="font-size: 0.9rem; color: var(--text-muted);">Simulador Premium estilo Brilliant.org con herramientas científicas integradas</span>
      </div>
      
      <!-- Controles del Header: Calculadora, Formulario, Puntos -->
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        
        <!-- Botón del Formulario Científico -->
        <button @click="toggleFormulario" class="btn btn-secondary-outline" style="padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #065f46; cursor: pointer; transition: all 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          {{ showFormulario ? 'Ocultar Formulario' : 'Ver Formulario' }}
        </button>

        <!-- Botón de la Calculadora -->
        <button @click="toggleCalculator" class="btn btn-primary-outline" style="padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); color: var(--primary); cursor: pointer; transition: all 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line><line x1="9" y1="15" x2="9.01" y2="15"></line><line x1="15" y1="15" x2="15.01" y2="15"></line></svg>
          {{ showCalculator ? 'Ocultar Calculadora' : 'Calculadora Científica' }}
        </button>

        <!-- Marcador de Puntos -->
        <div class="glass-panel" style="display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 14px;">
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">Puntos:</span>
          <div style="display: flex; align-items: center; gap: 4px; color: var(--warning); font-weight: 800; font-size: 1.25rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            {{ score }}
          </div>
        </div>

      </div>
    </header>

    <!-- Main Dynamic Layout: Sidebar + Main Workspace -->
    <div style="display: flex; gap: 1.5rem; align-items: flex-start; position: relative;" class="responsive-container">
      
      <!-- Menú de la Izquierda Colapsable -->
      <aside 
        class="glass-panel sidebar" 
        :class="{ 'collapsed': sidebarCollapsed }"
        style="width: 320px; padding: 1.5rem; flex-shrink: 0; display: flex; flex-direction: column; gap: 1.2rem; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.8rem;">
          <h2 style="font-size: 1.15rem; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 800;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Banco de Preguntas
          </h2>
          <!-- Botón interno para colapsar -->
          <button @click="sidebarCollapsed = true" class="collapse-btn" title="Ocultar menú" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.2s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
          </button>
        </div>
        
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

      <!-- Botón flotante para restaurar menú cuando está colapsado -->
      <button 
        v-if="sidebarCollapsed" 
        @click="sidebarCollapsed = false" 
        class="floating-expand-btn glass-panel"
        title="Mostrar menú de preguntas"
        style="position: absolute; left: -10px; top: 15px; z-index: 10; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; border: 1px solid var(--primary); background: white; color: var(--primary); box-shadow: 0 4px 12px rgba(79,70,229,0.2); transition: all 0.2s;"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
      </button>

      <!-- Contenido Principal: Breadcrumb, Progreso y Pregunta -->
      <main style="flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0;">
        
        <!-- Breadcrumb & Progreso -->
        <div class="glass-panel" style="padding: 1.2rem 1.8rem; display: flex; flex-direction: column; gap: 0.8rem; position: relative;">
          
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <nav class="breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); flex-wrap: wrap;">
              <!-- Toggle de Sidebar interno en el breadcrumb si no está expandido -->
              <button 
                v-if="sidebarCollapsed" 
                @click="sidebarCollapsed = false" 
                style="background: none; border: none; cursor: pointer; color: var(--primary); font-weight: 800; padding: 2px 6px; font-size: 1rem;"
                title="Mostrar menú de temas"
              >
                ☰
              </button>
              <span style="cursor: pointer; transition: color 0.2s;" @click="resetQuiz">EXCOBA</span>
              <span style="opacity: 0.5;">/</span>
              <span>{{ activeTopicGroup }}</span>
              <span style="opacity: 0.5;">/</span>
              <span style="color: var(--primary); font-weight: 800;">Pregunta {{ currentQuestionIndex + 1 }}</span>
            </nav>
            
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">
              Pregunta {{ currentQuestionIndex + 1 }} de {{ totalQuestions }}
            </div>
          </div>
          
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

      <!-- Panel Flotante de la CALCULADORA CIENTÍFICA -->
      <transition name="fade">
        <div v-if="showCalculator" class="glass-panel calculator-panel" style="position: absolute; right: 20px; top: 10px; width: 320px; z-index: 100; padding: 1.2rem; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border: 2px solid rgba(79,70,229,0.3); background: rgba(255,255,255,0.92);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem;">
            <h3 style="font-size: 1rem; color: var(--primary); margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              🧮 Calculadora Científica
            </h3>
            <button @click="showCalculator = false" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-muted);">×</button>
          </div>
          
          <!-- Pantalla de la calculadora -->
          <div style="background: #1e293b; color: #38bdf8; border-radius: 12px; padding: 10px 14px; text-align: right; font-family: monospace; font-size: 1.2rem; margin-bottom: 0.8rem; min-height: 52px; word-break: break-all; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 0.85rem; color: #94a3b8; opacity: 0.8; height: 16px;">{{ calcExpression }}</div>
            <div style="font-weight: 700; font-size: 1.3rem;">{{ calcDisplay || '0' }}</div>
          </div>

          <!-- Teclas de la calculadora -->
          <div class="calc-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button @click="pressCalcKey('sin(')" class="calc-btn fn">sin</button>
            <button @click="pressCalcKey('cos(')" class="calc-btn fn">cos</button>
            <button @click="pressCalcKey('tan(')" class="calc-btn fn">tan</button>
            <button @click="pressCalcKey('sqrt(')" class="calc-btn fn">√</button>

            <button @click="pressCalcKey('^')" class="calc-btn fn">xʸ</button>
            <button @click="pressCalcKey('log(')" class="calc-btn fn">log</button>
            <button @click="pressCalcKey('(')" class="calc-btn fn">(</button>
            <button @click="pressCalcKey(')')" class="calc-btn fn">)</button>

            <button @click="pressCalcKey('C')" class="calc-btn clear">C</button>
            <button @click="pressCalcKey('Del')" class="calc-btn clear">⌫</button>
            <button @click="pressCalcKey('/')" class="calc-btn op">÷</button>
            <button @click="pressCalcKey('*')" class="calc-btn op">×</button>

            <button @click="pressCalcKey('7')" class="calc-btn num">7</button>
            <button @click="pressCalcKey('8')" class="calc-btn num">8</button>
            <button @click="pressCalcKey('9')" class="calc-btn num">9</button>
            <button @click="pressCalcKey('-')" class="calc-btn op">-</button>

            <button @click="pressCalcKey('4')" class="calc-btn num">4</button>
            <button @click="pressCalcKey('5')" class="calc-btn num">5</button>
            <button @click="pressCalcKey('6')" class="calc-btn num">6</button>
            <button @click="pressCalcKey('+')" class="calc-btn op">+</button>

            <button @click="pressCalcKey('1')" class="calc-btn num">1</button>
            <button @click="pressCalcKey('2')" class="calc-btn num">2</button>
            <button @click="pressCalcKey('3')" class="calc-btn num">3</button>
            <button @click="pressCalcKey('=')" class="calc-btn eq" style="grid-row: span 2; height: 100%;">=</button>

            <button @click="pressCalcKey('0')" class="calc-btn num" style="grid-column: span 2;">0</button>
            <button @click="pressCalcKey('.')" class="calc-btn num">.</button>
          </div>
        </div>
      </transition>

      <!-- Panel Flotante del FORMULARIO CIENTÍFICO -->
      <transition name="fade">
        <div v-if="showFormulario" class="glass-panel formula-panel" style="position: absolute; right: 20px; top: 10px; width: 360px; z-index: 99; padding: 1.2rem; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border: 2px solid rgba(16, 185, 129, 0.3); background: rgba(255,255,255,0.94); max-height: 80vh; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; flex-shrink: 0;">
            <h3 style="font-size: 1rem; color: #065f46; margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              📖 Formulario de Estudio EXCOBA
            </h3>
            <button @click="showFormulario = false" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-muted);">×</button>
          </div>
          
          <!-- Lista con scroll de Fórmulas formateadas -->
          <div style="overflow-y: auto; flex: 1; padding-right: 5px; display: flex; flex-direction: column; gap: 1rem;" class="sidebar-scroll">
            
            <div class="formula-category">
              <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Álgebra y Funciones</h4>
              <div class="formula-item">
                <span class="formula-title">Fórmula general cuadrática:</span>
                <div v-latex="'$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Binomio al cuadrado:</span>
                <div v-latex="'$$(a \\pm b)^2 = a^2 \\pm 2ab + b^2$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Término general aritmético:</span>
                <div v-latex="'$$a_n = a_1 + (n - 1)d$$'"></div>
              </div>
            </div>

            <div class="formula-category">
              <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Geometría y Trigonometría</h4>
              <div class="formula-item">
                <span class="formula-title">Teorema de Pitágoras:</span>
                <div v-latex="'$$c^2 = a^2 + b^2$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Área del círculo:</span>
                <div v-latex="'$$A = \\pi r^2$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Razones trigonométricas:</span>
                <div v-latex="'$$\\sin(\\theta)=\\frac{C_o}{H}, \\quad \\cos(\\theta)=\\frac{C_a}{H}$$'"></div>
              </div>
            </div>

            <div class="formula-category">
              <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Geometría Analítica</h4>
              <div class="formula-item">
                <span class="formula-title">Pendiente de una recta:</span>
                <div v-latex="'$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Ecuación de la circunferencia:</span>
                <div v-latex="'$$(x - h)^2 + (y - k)^2 = r^2$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Ecuación de la elipse (horizontal):</span>
                <div v-latex="'$$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$$'"></div>
              </div>
            </div>

            <div class="formula-category">
              <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Física Científica</h4>
              <div class="formula-item">
                <span class="formula-title">Segunda Ley de Newton:</span>
                <div v-latex="'$$F = m \\cdot a$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Presión mecánica:</span>
                <div v-latex="'$$P = \\frac{F}{A}$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Calor sensible sensible:</span>
                <div v-latex="'$$Q = m \\cdot c \\cdot \\Delta T$$'"></div>
              </div>
              <div class="formula-item">
                <span class="formula-title">Ley de Coulomb:</span>
                <div v-latex="'$$F = k \\frac{q_1 q_2}{r^2}$$'"></div>
              </div>
            </div>

          </div>
        </div>
      </transition>

    </div>

    <!-- Feedback Overlay -->
    <transition name="slide-up">
      <FeedbackOverlay 
        v-if="showFeedback"
        :is-correct="lastAnswerCorrect"
        :explanation="currentQuestion.explanation"
        :correct-option-text="correctOptionText"
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

    // Controles de interactividad
    const sidebarCollapsed = ref(false);
    const showCalculator = ref(false);
    const showFormulario = ref(false);

    // Estado interno calculadora
    const calcDisplay = ref('');
    const calcExpression = ref('');

    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
    const totalQuestions = computed(() => questions.value.length);

    // Texto de la opción correcta para mostrar al usuario estilo Brilliant
    const correctOptionText = computed(() => {
      if (!currentQuestion.value) return '';
      const correctOpt = currentQuestion.value.options.find(o => o.isCorrect);
      return correctOpt ? correctOpt.text : '';
    });

    // Calcular el porcentaje de progreso acumulado basado en el índice
    const progressPercentage = computed(() => {
      if (totalQuestions.value === 0) return 0;
      return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100);
    });

    // Agrupar preguntas dinámicamente por la primera sección de su temática
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
        .substring(0, 24) + '...';
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

    const toggleCalculator = () => {
      showCalculator.value = !showCalculator.value;
      if (showCalculator.value) showFormulario.value = false; // cerrar el otro panel
    };

    const toggleFormulario = () => {
      showFormulario.value = !showFormulario.value;
      if (showFormulario.value) showCalculator.value = false; // cerrar el otro panel
    };

    // Lógica e interactividad de la Calculadora Científica
    const pressCalcKey = (key) => {
      if (key === 'C') {
        calcDisplay.value = '';
        calcExpression.value = '';
      } else if (key === 'Del') {
        calcDisplay.value = calcDisplay.value.slice(0, -1);
      } else if (key === '=') {
        try {
          let expr = calcDisplay.value
            .replace(/÷/g, '/')
            .replace(/×/g, '*')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/\^/g, '**');

          // Cierre automático de paréntesis para evitar errores
          const openParentheses = (expr.match(/\(/g) || []).length;
          const closeParentheses = (expr.match(/\)/g) || []).length;
          if (openParentheses > closeParentheses) {
            expr += ')'.repeat(openParentheses - closeParentheses);
          }

          const res = new Function(`return ${expr}`)();
          calcExpression.value = calcDisplay.value + ' =';
          calcDisplay.value = Number(res.toFixed(6)).toString();
        } catch (err) {
          calcDisplay.value = 'Error';
        }
      } else {
        let displayChar = key;
        if (key === '/') displayChar = '÷';
        if (key === '*') displayChar = '×';
        calcDisplay.value += displayChar;
      }
    };

    return {
      questions,
      currentQuestionIndex,
      currentQuestion,
      correctOptionText,
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
      resetQuiz,
      
      // Controles
      sidebarCollapsed,
      showCalculator,
      showFormulario,
      toggleCalculator,
      toggleFormulario,
      
      // Calculadora
      calcDisplay,
      calcExpression,
      pressCalcKey
    };
  }
}
</script>
