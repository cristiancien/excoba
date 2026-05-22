<template>
  <div class="overlay" :class="isCorrect ? 'bg-success' : 'bg-error'">
    <div class="feedback-panel glass-panel" :class="{ 'shake': !isCorrect }" style="position: relative;">
      
      <!-- Botón de Cerrar (Dismiss Review) -->
      <button 
        @click="$emit('close')" 
        class="close-btn" 
        style="position: absolute; top: 1.2rem; right: 1.2rem; background: transparent; border: none; font-size: 1.6rem; cursor: pointer; color: var(--text-muted); transition: all 0.2s; font-weight: bold; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10;"
        title="Cerrar"
        onmouseover="this.style.background='rgba(0,0,0,0.06)'; this.style.color='var(--text-main)'"
        onmouseout="this.style.background='transparent'; this.style.color='var(--text-muted)'"
      >
        &times;
      </button>
      
      <!-- Icon/Character Header (Brilliant style) -->
      <div class="feedback-header">
        <div v-if="isCorrect" class="icon-container success-icon">
          <svg class="svg-character" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="var(--secondary)" opacity="0.15"/>
            <path d="M30 50L45 65L70 35" stroke="var(--secondary)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="35" cy="40" r="4" fill="var(--secondary)"/>
            <circle cx="65" cy="40" r="4" fill="var(--secondary)"/>
            <path d="M40 75 Q50 85 60 75" stroke="var(--secondary)" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <h2 style="color: var(--secondary); font-weight: 900; font-size: 1.8rem; margin: 0;">¡Excelente deducción! 🎯</h2>
          <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">Tu razonamiento ha sido impecable.</span>
        </div>
        
        <div v-else class="icon-container error-icon">
          <svg class="svg-character" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="var(--warning)" opacity="0.15"/>
            <path d="M50 25C40 25 35 32 35 40C35 48 42 50 45 55V62H55V55C58 50 65 48 65 40C65 32 60 25 50 25Z" fill="var(--warning)" opacity="0.4"/>
            <rect x="46" y="64" width="8" height="4" rx="2" fill="var(--warning)"/>
            <rect x="48" y="70" width="4" height="4" rx="2" fill="var(--warning)"/>
            <circle cx="38" cy="40" r="3" fill="var(--warning)"/>
            <circle cx="62" cy="40" r="3" fill="var(--warning)"/>
            <path d="M45 48 Q50 52 55 48" stroke="var(--warning)" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <h2 style="color: var(--warning); font-weight: 900; font-size: 1.8rem; margin: 0;">💡 ¡Momento de Aprendizaje!</h2>
          <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">Resolver errores es el camino más rápido para dominar el concepto.</span>
        </div>
      </div>

      <!-- Explanation Content -->
      <div class="feedback-body" style="margin-top: 1.5rem; text-align: left;">
        
        <!-- Bloque de Respuesta Correcta si el usuario falló -->
        <div v-if="!isCorrect" class="correct-answer-box glass-panel" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.2rem; margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.8px;">Respuesta Correcta:</span>
          <div v-latex="correctOptionText" style="font-size: 1.15rem; color: var(--text-main); font-weight: 700;"></div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 10px;">
          <h3 style="color: var(--text-main); margin: 0; font-size: 1.1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">
            {{ isCorrect ? 'Concepto clave:' : 'Desglose lógico del concepto:' }}
          </h3>
          <button 
            @click="toggleTTS" 
            class="btn" 
            style="background: transparent; border: 1px solid var(--glass-border); color: var(--primary); padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; cursor: pointer; height: auto;"
            :title="isPlayingTTS ? 'Pausar Lectura' : 'Escuchar Explicación'"
          >
            <svg v-if="!isPlayingTTS" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            {{ isPlayingTTS ? 'Pausar' : 'Dictar' }}
          </button>
        </div>
        
        <div class="explanation-content glass-panel" style="padding: 1.6rem; border-radius: 18px; font-size: 1.05rem; line-height: 1.6; color: var(--text-main);">
           <span v-latex="explanation"></span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div style="margin-top: 2rem; text-align: center;">
        <button 
          class="btn" 
          :class="isCorrect ? 'btn-secondary' : 'btn-primary'" 
          @click="$emit('continue')"
          style="width: 100%; max-width: 320px; padding: 15px; font-size: 1.15rem; border-radius: 16px;"
        >
          Entendido, Continuar
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
const { ref, onUnmounted } = Vue;

export default {
  props: {
    isCorrect: Boolean,
    explanation: String,
    correctOptionText: String
  },
  emits: ['continue', 'close'],
  setup(props) {
    const isPlayingTTS = ref(false);
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    const loadVoices = () => {
      if (synth && synth.getVoices) {
        synth.getVoices();
      }
    };
    loadVoices();
    if (synth && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

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

    const cleanTextForSpeech = (rawText) => {
      if (!rawText) return '';
      let cleanText = rawText;
      cleanText = cleanText.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => cleanLatexSegment(latex));
      cleanText = cleanText.replace(/\$(.*?)\$/g, (_, latex) => cleanLatexSegment(latex));
      cleanText = cleanText.replace(/_{2,}/g, ' espacio en blanco ');
      cleanText = cleanText.replace(/_/g, '');
      cleanText = cleanText.replace(/(\d+)\s*-\s*(\d+)/g, '$1 menos $2');
      cleanText = cleanText.replace(/(^|[\s(])-\s*(\d+)/g, '$1menos $2');
      cleanText = cleanText.replace(/<[^>]*>?/gm, ' ');
      cleanText = cleanText.replace(/\*\*/g, '');
      cleanText = cleanText.replace(/\$/g, '');
      cleanText = cleanText.replace(/\s+/g, ' ').trim();
      return cleanText;
    };

    const toggleTTS = () => {
      if (isPlayingTTS.value) {
        if (synth) synth.cancel();
        isPlayingTTS.value = false;
        return;
      }
      
      if (!synth) return;

      synth.cancel();
      
      let fullText = '';
      if (!props.isCorrect && props.correctOptionText) {
        fullText += 'Respuesta correcta: ' + cleanTextForSpeech(props.correctOptionText) + '. ';
      }
      
      fullText += (props.isCorrect ? 'Concepto clave: ' : 'Desglose lógico del concepto: ') + cleanTextForSpeech(props.explanation);
      
      currentUtterance = new SpeechSynthesisUtterance(fullText);
      currentUtterance.lang = 'es-MX';
      
      if (synth && synth.getVoices) {
        let voices = synth.getVoices();
        const cleanLang = (l) => (l || '').toLowerCase().replace(/_/g, '-');
        let spanishVoice = voices.find(v => cleanLang(v.lang) === 'es-mx') ||
                           voices.find(v => cleanLang(v.lang) === 'es-es') ||
                           voices.find(v => cleanLang(v.lang) === 'es-us') ||
                           voices.find(v => cleanLang(v.lang).startsWith('es')) ||
                           voices.find(v => (v.name || '').toLowerCase().includes('spanish')) ||
                           voices.find(v => (v.name || '').toLowerCase().includes('español'));
                            
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
      isPlayingTTS,
      toggleTTS
    };
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background-color 0.4s ease;
}

.bg-success { background-color: rgba(16, 185, 129, 0.12); }
.bg-error { background-color: rgba(245, 158, 11, 0.12); }

.feedback-panel {
  width: 92%;
  max-width: 620px;
  padding: 2.5rem;
  border-radius: 28px;
  text-align: center;
  max-height: 88vh;
  overflow-y: auto;
}

/* Ensure the panel has an appropriate theme background */
.dark-theme .feedback-panel {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.5);
}

.feedback-panel:not(.dark-theme .feedback-panel) {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.15);
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.svg-character {
  width: 100px;
  height: 100px;
}

.explanation-content :deep(p) { margin-bottom: 1rem; }
.explanation-content :deep(.katex-display) { margin: 1.5rem 0; overflow-x: auto; overflow-y: hidden; padding: 0.5rem 0; }
</style>
