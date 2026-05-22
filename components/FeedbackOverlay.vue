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

        <h3 style="color: var(--text-main); margin-bottom: 0.8rem; font-size: 1.1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">
          {{ isCorrect ? 'Concepto clave:' : 'Desglose lógico del concepto:' }}
        </h3>
        
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
export default {
  props: {
    isCorrect: Boolean,
    explanation: String,
    correctOptionText: String
  },
  emits: ['continue', 'close']
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
