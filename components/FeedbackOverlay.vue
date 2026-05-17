<template>
  <div class="overlay" :class="isCorrect ? 'bg-success' : 'bg-error'">
    <div class="feedback-panel glass-panel" :class="{ 'shake': !isCorrect }">
      
      <!-- Icon/Character Header -->
      <div class="feedback-header">
        <div v-if="isCorrect" class="icon-container success-icon">
          <svg class="svg-character" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#10B981" opacity="0.2"/>
            <path d="M30 50L45 65L70 35" stroke="#10B981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="35" cy="40" r="4" fill="#10B981"/>
            <circle cx="65" cy="40" r="4" fill="#10B981"/>
            <path d="M40 75 Q50 85 60 75" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <h2 style="color: var(--secondary);">¡Excelente Trabajo!</h2>
        </div>
        <div v-else class="icon-container error-icon">
          <svg class="svg-character" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#EF4444" opacity="0.2"/>
            <path d="M35 35L65 65M65 35L35 65" stroke="#EF4444" stroke-width="8" stroke-linecap="round"/>
            <circle cx="35" cy="40" r="4" fill="#EF4444"/>
            <circle cx="65" cy="40" r="4" fill="#EF4444"/>
            <path d="M40 80 Q50 70 60 80" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <h2 style="color: var(--danger);">¡No te preocupes!</h2>
        </div>
      </div>

      <!-- Explanation Content (Learn by example) -->
      <div class="feedback-body" style="margin-top: 1.5rem; text-align: left;">
        <h3 v-if="!isCorrect" style="color: var(--text-main); margin-bottom: 1rem; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.5rem;">
          Aprende paso a paso:
        </h3>
        
        <div class="explanation-content" style="background: rgba(255,255,255,0.5); padding: 1.5rem; border-radius: 12px; font-size: 1.05rem; line-height: 1.6;">
           <span v-latex="explanation"></span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div style="margin-top: 2rem; text-align: center;">
        <button 
          class="btn" 
          :class="isCorrect ? 'btn-secondary' : 'btn-primary'" 
          @click="$emit('continue')"
          style="width: 100%; max-width: 300px; padding: 16px; font-size: 1.2rem;"
        >
          Continuar
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isCorrect: Boolean,
    explanation: String
  },
  emits: ['continue']
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

.bg-success { background-color: rgba(16, 185, 129, 0.1); }
.bg-error { background-color: rgba(239, 68, 68, 0.1); }

.feedback-panel {
  width: 90%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.85);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.explanation-content {
  color: #334155;
}

.explanation-content :deep(p) { margin-bottom: 1rem; }
.explanation-content :deep(.katex-display) { margin: 1.5rem 0; overflow-x: auto; overflow-y: hidden; padding: 0.5rem 0; }
</style>
