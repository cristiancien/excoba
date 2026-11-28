<template>
  <div class="hm-shell" :class="{ dark: isDarkMode }">
    <!-- Barra de navegación superior -->
    <header class="hm-nav">
      <div class="hm-brand">
        <div class="hm-logo-box">
          <img src="favicon.png" alt="EXCOBA Prep" />
        </div>
        <div class="hm-brand-copy">
          <span class="hm-brand-name">EXCOBA Prep</span>
          <span class="hm-brand-tag">Arquitectura &amp; Diseño</span>
        </div>
      </div>

      <div class="hm-nav-actions">
        <button v-if="questionsCount > 0" type="button" class="hm-pill-resume" @click="$emit('resume-exam')">
          <span class="hm-live-dot"></span>
          Continuar sesión · {{ progressPercentage }}%
        </button>
        <button type="button" class="hm-ghost-btn" @click="$emit('open-settings')">
          ⚙ Configuración
        </button>
        <button type="button" class="hm-ghost-btn" @click="$emit('toggle-theme')">
          {{ isDarkMode ? '☼ Claro' : '☾ Oscuro' }}
        </button>
      </div>
    </header>

    <!-- Hero editorial asimétrico -->
    <section class="hm-hero">
      <div class="hm-hero-left">
        <span class="hm-eyebrow">Preparación universitaria · Admisión EXCOBA</span>
        <h1 class="hm-title">
          Prepárate con práctica dirigida y un entorno fiel de examen.
        </h1>
        <p class="hm-subtitle">
          Entrena por etapa, materia y nivel de dificultad sobre el banco progresivo, realiza un simulacro completo de 180 reactivos o practica dentro de la interfaz estilo EXCOBA.
        </p>

        <div class="hm-hero-ctas">
          <button type="button" class="hm-btn hm-btn-primary" @click="$emit('start-exam')">
            {{ questionsCount > 0 ? 'Nuevo simulacro (180)' : 'Iniciar simulacro (180)' }}
          </button>
          <button type="button" class="hm-btn hm-btn-exam" @click="$emit('open-excoba')">
            Abrir entorno EXCOBA →
          </button>
          <button v-if="questionsCount > 0" type="button" class="hm-btn hm-btn-soft" @click="$emit('resume-exam')">
            Retomar sesión
          </button>
        </div>
      </div>

      <!-- Panel oscuro de vista rápida estilo EXCOBA -->
      <aside class="hm-hero-panel">
        <div class="hm-panel-topbar">
          <span class="hm-ex-badge">EXCOBA</span>
          <span class="hm-panel-caption">Resumen del banco y avance</span>
        </div>

        <div v-if="questionsCount > 0 && overallSolvedCount > 0" class="hm-progress-card">
          <div class="hm-progress-head">
            <span>Sesión activa</span>
            <strong>{{ overallSolvedCount }} / {{ totalQuestions }} ({{ progressPercentage }}%)</strong>
          </div>
          <div class="hm-progress-track">
            <div class="hm-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <div class="hm-kpi-grid">
          <div class="hm-kpi">
            <strong>{{ activeBankCount.toLocaleString('es-MX') }}</strong>
            <span>Reactivos activos</span>
          </div>
          <div class="hm-kpi">
            <strong>{{ activeCatalogueCount }}</strong>
            <span>Temas cubiertos</span>
          </div>
          <div class="hm-kpi">
            <strong>2,590</strong>
            <span>Entorno EXCOBA</span>
          </div>
        </div>

        <div class="hm-stages">
          <div class="hm-stage-row">
            <span class="hm-stage-bar s1"></span>
            <span class="hm-stage-name">Educación Primaria</span>
            <span class="hm-stage-sub">Español · Matemáticas</span>
          </div>
          <div class="hm-stage-row">
            <span class="hm-stage-bar s2"></span>
            <span class="hm-stage-name">Educación Secundaria</span>
            <span class="hm-stage-sub">Español · Matemáticas · C. Nat. · C. Soc.</span>
          </div>
          <div class="hm-stage-row">
            <span class="hm-stage-bar s3"></span>
            <span class="hm-stage-name">Bachillerato</span>
            <span class="hm-stage-sub">Cálculo · Física · Lenguaje · Especialidad</span>
          </div>
        </div>

        <button type="button" class="hm-panel-cta" @click="$emit('open-excoba')">
          <span>Entrar al entorno estilo EXCOBA</span>
          <small>Examen demostrativo (70) + 126 temas × 20</small>
        </button>
      </aside>
    </section>

    <!-- Espacio principal de trabajo (Bento de 2 columnas) -->
    <section class="hm-bento">
      <!-- Columna principal: Práctica dirigida por tema -->
      <article class="hm-card hm-practice-card" aria-labelledby="practice-title">
        <div class="hm-card-head">
          <div>
            <span class="hm-kicker">Entrenamiento personalizado</span>
            <h2 id="practice-title">Práctica por tema y nivel</h2>
            <p class="hm-card-desc">
              {{ activeBankCount.toLocaleString('es-MX') }} ejercicios · {{ activeCatalogueCount }} temas ·
              {{ activeBankSource === 'markdown' ? activeBankMeta.title : '4 niveles progresivos' }}
            </p>
          </div>
          <span class="hm-avail-pill" :class="{ empty: !practiceAvailable }">
            {{ practiceAvailable.toLocaleString('es-MX') }} disponibles
          </span>
        </div>

        <div class="hm-form-grid">
          <label class="hm-field">
            <span>Etapa</span>
            <select :value="practiceSection" @change="$emit('update:practiceSection', $event.target.value)">
              <option value="">Todas las etapas</option>
              <option v-for="sec in practiceSections" :key="sec" :value="sec">{{ sec }}</option>
            </select>
          </label>

          <label class="hm-field">
            <span>Materia</span>
            <select :value="practiceTopic" @change="$emit('update:practiceTopic', $event.target.value)">
              <option value="">Todas las materias</option>
              <option v-for="topic in practiceTopics" :key="topic" :value="topic">{{ topic }}</option>
            </select>
          </label>

          <label class="hm-field hm-wide">
            <span>Tema</span>
            <select :value="practiceThemeId" @change="$emit('update:practiceThemeId', $event.target.value)">
              <option value="">Todos los temas de la selección</option>
              <option v-for="item in practiceThemes" :key="item.id" :value="item.id">
                {{ item.id }} · {{ item.title }} ({{ item.count }})
              </option>
            </select>
          </label>

          <label class="hm-field">
            <span>Nivel de dificultad</span>
            <select :value="practiceLevel" @change="$emit('update:practiceLevel', $event.target.value)">
              <option value="">Todos los niveles</option>
              <option v-for="(label, number) in levelLabels" :key="number" :value="number">{{ label }}</option>
            </select>
          </label>

          <div class="hm-field">
            <span>Cantidad de ejercicios</span>
            <div class="hm-count-pills" role="group" aria-label="Cantidad de ejercicios">
              <button
                v-for="n in [10, 25, 50, 100]"
                :key="n"
                type="button"
                class="hm-count-btn"
                :class="{ active: practiceCount === n }"
                @click="$emit('update:practiceCount', n)"
              >
                {{ n }}
              </button>
            </div>
          </div>

          <label class="hm-field hm-wide">
            <span>Habilidad específica</span>
            <select :value="practiceSkill" :disabled="!practiceThemeId" @change="$emit('update:practiceSkill', $event.target.value)">
              <option value="">Todas las habilidades del tema</option>
              <option v-for="skill in practiceSkills" :key="skill" :value="skill">{{ skill }}</option>
            </select>
          </label>
        </div>

        <div class="hm-practice-foot">
          <label class="hm-check">
            <input type="checkbox" :checked="practiceOrdered" @change="$emit('update:practiceOrdered', $event.target.checked)" />
            <span>Orden progresivo (de básico a avanzado)</span>
          </label>
          <button type="button" class="hm-btn hm-btn-primary" :disabled="!practiceAvailable" @click="$emit('start-practice')">
            Comenzar práctica
          </button>
        </div>
        <p class="hm-footnote">Iniciar una nueva sesión reemplaza la sesión en curso; el banco completo permanece disponible.</p>
        <p v-if="sessionError" class="hm-error" role="alert">{{ sessionError }}</p>
      </article>

      <!-- Columna derecha: Simulacro + Banco propio .md -->
      <div class="hm-side-col">
        <article class="hm-card hm-sim-card">
          <div class="hm-card-head compact">
            <div>
              <span class="hm-kicker">Evaluación diagnóstica</span>
              <h2>Simulacro completo · 180 reactivos</h2>
            </div>
            <span class="hm-sim-badge">9 materias</span>
          </div>
          <p class="hm-card-desc">
            Recorre las 3 etapas y las 9 asignaturas con 20 reactivos balanceados por materia, cronómetro, calculadora y formulario de apoyo.
          </p>
          <div class="hm-btn-row">
            <button v-if="questionsCount > 0" type="button" class="hm-btn hm-btn-soft" @click="$emit('resume-exam')">
              Continuar
            </button>
            <button type="button" class="hm-btn hm-btn-primary" @click="$emit('start-exam')">
              {{ questionsCount > 0 ? 'Nuevo simulacro' : 'Comenzar simulacro' }}
            </button>
          </div>
        </article>

        <article class="hm-card hm-md-card" aria-labelledby="md-bank-title">
          <div class="hm-card-head compact">
            <div>
              <span class="hm-kicker">Contenido propio</span>
              <h2 id="md-bank-title">Banco Markdown (.md)</h2>
            </div>
            <span class="hm-md-tag">EXCOBA-MD</span>
          </div>
          <p class="hm-card-desc">
            Importa tus propios reactivos (opción múltiple, respuesta abierta, tablas y fórmulas) o prueba la plantilla editable.
          </p>

          <div class="hm-md-actions">
            <label class="hm-btn hm-btn-soft hm-file-lbl">
              Cargar archivos .md
              <input type="file" accept=".md,.markdown,.txt" multiple hidden @change="$emit('markdown-file', $event)" />
            </label>
            <button type="button" class="hm-btn hm-btn-ghost" @click="$emit('update:showMarkdownEditor', !showMarkdownEditor)">
              {{ showMarkdownEditor ? 'Ocultar editor' : 'Pegar texto' }}
            </button>
          </div>
          <div class="hm-md-links">
            <button type="button" class="hm-link-btn" @click="$emit('load-sample-markdown')">Cargar ejemplo</button>
            <span>·</span>
            <a class="hm-link-btn" href="./data/ejemplo-banco.md" download="plantilla-excoba.md">Descargar plantilla</a>
          </div>

          <div v-if="showMarkdownEditor" class="hm-md-editor">
            <textarea
              :value="markdownInput"
              rows="6"
              placeholder="## Q1 | multiple | Álgebra&#10;¿Cuánto es $2+2$?&#10;- [ ] 3&#10;- [x] 4&#10;!explicacion: $2+2=4$."
              @input="$emit('update:markdownInput', $event.target.value)"
            ></textarea>
            <button type="button" class="hm-btn hm-btn-primary" :disabled="!markdownInput.trim()" @click="$emit('apply-markdown')">
              Cargar Markdown
            </button>
          </div>

          <div v-if="activeBankSource === 'markdown'" class="hm-md-active">
            <strong>Activo: {{ activeBankMeta.title }} ({{ activeBankCount }} reactivos)</strong>
            <small>
              Múltiple: {{ activeBankMeta.byType?.multiple || 0 }} ·
              Abiertas: {{ activeBankMeta.byType?.open || 0 }} ·
              Tabla: {{ activeBankMeta.byType?.table || 0 }}
            </small>
            <ul v-if="activeBankWarnings.length" class="hm-md-warn">
              <li v-for="(w, i) in activeBankWarnings" :key="i">{{ w }}</li>
            </ul>
            <div class="hm-btn-row">
              <button type="button" class="hm-btn hm-btn-primary" @click="$emit('start-markdown-practice')">Practicar banco</button>
              <button type="button" class="hm-btn hm-btn-soft" @click="$emit('restore-default-bank')">Volver al banco base</button>
            </div>
          </div>

          <p v-if="markdownError" class="hm-error" role="alert">{{ markdownError }}</p>
        </article>
      </div>
    </section>

    <!-- Barra inferior de utilidades -->
    <footer class="hm-footer">
      <div class="hm-footer-left">
        <span class="hm-ver">EXCOBA Prep · v2.0</span>
        <button type="button" class="hm-link-btn" @click="$emit('open-settings')">
          ✦ Configuración y Gemini opcional
        </button>
      </div>
      <div class="hm-footer-right">
        <button type="button" class="hm-link-btn danger" @click="$emit('update:showResetConfirm', true)">
          Restablecer progreso
        </button>
      </div>
    </footer>

    <div v-if="showResetConfirm" class="hm-reset-bar" role="alert">
      <p>Se borrarán la sesión activa, sus puntos y sus tiempos. La configuración de Gemini se conserva.</p>
      <div class="hm-btn-row">
        <button type="button" class="hm-btn hm-btn-soft" @click="$emit('update:showResetConfirm', false)">Conservar</button>
        <button type="button" class="hm-btn hm-btn-danger" @click="$emit('reset-progress')">Restablecer</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isDarkMode: Boolean,
    questionsCount: Number,
    totalQuestions: Number,
    overallSolvedCount: Number,
    progressPercentage: Number,
    activeBankCount: Number,
    activeCatalogueCount: Number,
    activeBankSource: String,
    activeBankMeta: { type: Object, default: () => ({}) },
    activeBankWarnings: { type: Array, default: () => [] },
    levelLabels: { type: Object, default: () => ({}) },
    practiceSection: String,
    practiceTopic: String,
    practiceThemeId: String,
    practiceLevel: [String, Number],
    practiceCount: Number,
    practiceSkill: String,
    practiceOrdered: Boolean,
    practiceSections: { type: Array, default: () => [] },
    practiceTopics: { type: Array, default: () => [] },
    practiceThemes: { type: Array, default: () => [] },
    practiceSkills: { type: Array, default: () => [] },
    practiceAvailable: Number,
    sessionError: String,
    showMarkdownEditor: Boolean,
    markdownInput: String,
    markdownError: String,
    showResetConfirm: Boolean,
  },
  emits: [
    'toggle-theme', 'open-settings', 'open-excoba', 'start-exam', 'resume-exam', 'start-practice',
    'markdown-file', 'load-sample-markdown', 'apply-markdown', 'start-markdown-practice', 'restore-default-bank', 'reset-progress',
    'update:practiceSection', 'update:practiceTopic', 'update:practiceThemeId', 'update:practiceLevel',
    'update:practiceCount', 'update:practiceSkill', 'update:practiceOrdered',
    'update:showMarkdownEditor', 'update:markdownInput', 'update:showResetConfirm',
  ],
};
</script>

<style scoped>
.hm-shell{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:22px;padding:6px 0 28px}
.hm-nav{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:12px 18px;border-radius:16px;background:rgba(255,255,255,.86);border:1px solid rgba(15,23,42,.08);box-shadow:0 8px 24px rgba(15,23,42,.06);backdrop-filter:blur(12px)}
.hm-brand{display:flex;align-items:center;gap:12px}
.hm-logo-box{width:38px;height:38px;border-radius:11px;overflow:hidden;border:1px solid rgba(79,70,229,.2);box-shadow:0 4px 12px rgba(79,70,229,.18)}
.hm-logo-box img{width:100%;height:100%;object-fit:cover;display:block}
.hm-brand-copy{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.hm-brand-name{font-size:1.1rem;font-weight:800;letter-spacing:-.02em;color:#0f172a}
.hm-brand-tag{font-size:.74rem;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(79,70,229,.1);color:#4338ca}
.hm-nav-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.hm-pill-resume{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;border:1px solid rgba(16,185,129,.35);background:rgba(16,185,129,.12);color:#047857;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer}
.hm-live-dot{width:8px;height:8px;border-radius:50%;background:#10b981}
.hm-ghost-btn{padding:7px 13px;border-radius:10px;border:1px solid rgba(15,23,42,.12);background:rgba(255,255,255,.7);color:#1e293b;font-family:inherit;font-size:.84rem;font-weight:700;cursor:pointer;transition:all .18s}
.hm-ghost-btn:hover{border-color:#4f46e5;color:#4f46e5;background:#fff}

.hm-hero{display:grid;grid-template-columns:1.2fr .95fr;gap:22px;align-items:stretch}
.hm-hero-left{background:rgba(255,255,255,.9);border:1px solid rgba(15,23,42,.08);border-radius:22px;padding:32px 30px;display:flex;flex-direction:column;justify-content:center;gap:16px;box-shadow:0 14px 36px rgba(15,23,42,.07)}
.hm-eyebrow{font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#4f46e5}
.hm-title{margin:0;font-size:clamp(1.75rem,3vw,2.55rem);line-height:1.12;letter-spacing:-.03em;font-weight:800;color:#0f172a}
.hm-subtitle{margin:0;font-size:.98rem;line-height:1.6;color:#475569;max-width:52ch}
.hm-hero-ctas{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}

.hm-hero-panel{background:linear-gradient(160deg,#111827 0%,#0b0f19 100%);color:#f3f4f6;border:1px solid #283347;border-radius:22px;padding:22px;display:flex;flex-direction:column;gap:16px;box-shadow:0 18px 42px rgba(15,23,42,.22)}
.hm-panel-topbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)}
.hm-ex-badge{background:#ffc12b;color:#111;font-weight:800;font-size:.75rem;padding:3px 9px;border-radius:5px;letter-spacing:.04em}
.hm-panel-caption{font-size:.78rem;color:#94a3b8;font-weight:600}
.hm-progress-card{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.hm-progress-head{display:flex;justify-content:space-between;font-size:.8rem;color:#d1fae5}
.hm-progress-track{height:7px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden}
.hm-progress-fill{height:100%;background:linear-gradient(90deg,#10b981,#2bc1ff);border-radius:999px}
.hm-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.hm-kpi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 10px;display:flex;flex-direction:column;gap:2px}
.hm-kpi strong{font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:-.02em}
.hm-kpi span{font-size:.7rem;color:#94a3b8;font-weight:600}
.hm-stages{display:flex;flex-direction:column;gap:8px}
.hm-stage-row{display:grid;grid-template-columns:4px auto 1fr;align-items:center;gap:10px;font-size:.8rem;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.03)}
.hm-stage-bar{width:4px;height:20px;border-radius:4px}
.hm-stage-bar.s1{background:#ffc12b}.hm-stage-bar.s2{background:#2bc1ff}.hm-stage-bar.s3{background:#00d8b3}
.hm-stage-name{font-weight:700;color:#e2e8f0;white-space:nowrap}
.hm-stage-sub{color:#94a3b8;font-size:.74rem;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hm-panel-cta{margin-top:auto;display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(43,193,255,.45);background:linear-gradient(90deg,rgba(11,79,108,.85),rgba(14,116,144,.75));color:#fff;font-family:inherit;cursor:pointer;text-align:left;transition:transform .16s,border-color .16s}
.hm-panel-cta:hover{transform:translateY(-1px);border-color:#2bc1ff}
.hm-panel-cta span{font-weight:800;font-size:.9rem}
.hm-panel-cta small{color:#bae6fd;font-size:.74rem}

.hm-bento{display:grid;grid-template-columns:1.35fr 1fr;gap:22px;align-items:start}
.hm-side-col{display:flex;flex-direction:column;gap:22px}
.hm-card{background:rgba(255,255,255,.9);border:1px solid rgba(15,23,42,.08);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:16px;box-shadow:0 12px 30px rgba(15,23,42,.06)}
.hm-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.hm-card-head h2{margin:2px 0 0;font-size:1.25rem;font-weight:800;color:#0f172a;letter-spacing:-.02em}
.hm-kicker{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#4f46e5}
.hm-card-desc{margin:4px 0 0;font-size:.88rem;line-height:1.5;color:#475569}
.hm-avail-pill{padding:5px 11px;border-radius:999px;background:rgba(16,185,129,.12);color:#047857;font-size:.78rem;font-weight:800;white-space:nowrap}
.hm-avail-pill.empty{background:rgba(239,68,68,.12);color:#b91c1c}
.hm-sim-badge,.hm-md-tag{padding:4px 10px;border-radius:999px;font-size:.74rem;font-weight:800}
.hm-sim-badge{background:rgba(79,70,229,.1);color:#4338ca}
.hm-md-tag{background:rgba(15,23,42,.08);color:#334155}

.hm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.hm-field{display:flex;flex-direction:column;gap:5px}
.hm-field.hm-wide{grid-column:1 / -1}
.hm-field span{font-size:.76rem;font-weight:700;color:#475569}
.hm-field select{width:100%;padding:10px 12px;border-radius:11px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;font-family:inherit;font-size:.88rem;font-weight:600;outline:none}
.hm-field select:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.14)}
.hm-field select:disabled{opacity:.55;cursor:not-allowed}
.hm-count-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.hm-count-btn{padding:9px 0;border-radius:10px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-family:inherit;font-size:.86rem;font-weight:700;cursor:pointer;transition:all .15s}
.hm-count-btn.active{background:#4f46e5;border-color:#4f46e5;color:#fff;box-shadow:0 4px 12px rgba(79,70,229,.28)}
.hm-practice-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:6px;border-top:1px solid rgba(15,23,42,.07)}
.hm-check{display:inline-flex;align-items:center;gap:8px;font-size:.84rem;font-weight:600;color:#334155;cursor:pointer}
.hm-check input{width:16px;height:16px;accent-color:#4f46e5}
.hm-footnote{margin:0;font-size:.76rem;color:#64748b}
.hm-error{margin:0;padding:9px 12px;border-radius:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.28);color:#b91c1c;font-size:.82rem;font-weight:700}

.hm-btn{font-family:inherit;font-weight:700;font-size:.88rem;padding:10px 18px;border-radius:12px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:all .18s}
.hm-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.hm-btn-primary{background:#4f46e5;color:#fff;box-shadow:0 6px 18px rgba(79,70,229,.28)}
.hm-btn-primary:hover:not(:disabled){background:#4338ca;transform:translateY(-1px)}
.hm-btn-exam{background:#0f172a;color:#ffc12b;border-color:#334155;box-shadow:0 6px 18px rgba(15,23,42,.2)}
.hm-btn-exam:hover{background:#1e293b;transform:translateY(-1px)}
.hm-btn-soft{background:rgba(79,70,229,.1);color:#4338ca;border-color:rgba(79,70,229,.2)}
.hm-btn-soft:hover{background:rgba(79,70,229,.16)}
.hm-btn-ghost{background:transparent;color:#334155;border-color:#cbd5e1}
.hm-btn-ghost:hover{border-color:#4f46e5;color:#4f46e5}
.hm-btn-danger{background:#dc2626;color:#fff}
.hm-btn-row,.hm-md-actions{display:flex;gap:8px;flex-wrap:wrap}
.hm-file-lbl{cursor:pointer}
.hm-md-links{display:flex;align-items:center;gap:8px;font-size:.82rem;color:#94a3b8}
.hm-link-btn{background:none;border:0;padding:0;color:#4f46e5;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;text-decoration:none}
.hm-link-btn:hover{text-decoration:underline}
.hm-link-btn.danger{color:#dc2626}
.hm-md-editor{display:flex;flex-direction:column;gap:10px}
.hm-md-editor textarea{width:100%;padding:10px 12px;border-radius:11px;border:1px solid #cbd5e1;font-family:ui-monospace,Consolas,monospace;font-size:.8rem;resize:vertical;color:#0f172a;background:#fff}
.hm-md-active{background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.3);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;font-size:.82rem;color:#065f46}
.hm-md-warn{margin:4px 0 0;padding-left:18px;color:#b45309}

.hm-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 6px 0;border-top:1px solid rgba(15,23,42,.1)}
.hm-footer-left,.hm-footer-right{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.hm-ver{font-size:.8rem;font-weight:700;color:#64748b}
.hm-reset-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 18px;border-radius:14px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.3);font-size:.84rem;color:#991b1b}
.hm-reset-bar p{margin:0;font-weight:600}

/* Modo oscuro nativo */
.hm-shell.dark .hm-nav,.hm-shell.dark .hm-hero-left,.hm-shell.dark .hm-card{background:rgba(15,23,42,.86);border-color:rgba(148,163,184,.2);box-shadow:0 14px 36px rgba(0,0,0,.38)}
.hm-shell.dark .hm-brand-name,.hm-shell.dark .hm-title,.hm-shell.dark .hm-card-head h2{color:#f8fafc}
.hm-shell.dark .hm-subtitle,.hm-shell.dark .hm-card-desc,.hm-shell.dark .hm-field span,.hm-shell.dark .hm-check{color:#cbd5e1}
.hm-shell.dark .hm-eyebrow,.hm-shell.dark .hm-kicker,.hm-shell.dark .hm-link-btn{color:#818cf8}
.hm-shell.dark .hm-brand-tag,.hm-shell.dark .hm-sim-badge{background:rgba(129,140,248,.18);color:#c7d2fe}
.hm-shell.dark .hm-md-tag{background:rgba(148,163,184,.18);color:#e2e8f0}
.hm-shell.dark .hm-ghost-btn,.hm-shell.dark .hm-field select,.hm-shell.dark .hm-count-btn,.hm-shell.dark .hm-md-editor textarea{background:#0f172a;border-color:#334155;color:#f1f5f9}
.hm-shell.dark .hm-count-btn.active{background:#6366f1;border-color:#6366f1;color:#fff}
.hm-shell.dark .hm-btn-soft{background:rgba(129,140,248,.18);color:#c7d2fe;border-color:rgba(129,140,248,.32)}
.hm-shell.dark .hm-btn-ghost{color:#e2e8f0;border-color:#475569}
.hm-shell.dark .hm-btn-exam{background:#1e293b;border-color:#ffc12b}
.hm-shell.dark .hm-practice-foot,.hm-shell.dark .hm-footer{border-top-color:rgba(148,163,184,.2)}
.hm-shell.dark .hm-footnote,.hm-shell.dark .hm-ver{color:#94a3b8}
.hm-shell.dark .hm-md-active{color:#a7f3d0}
.hm-shell.dark .hm-reset-bar{color:#fecaca}

@media(max-width:940px){.hm-hero,.hm-bento{grid-template-columns:1fr}.hm-hero-left{padding:24px 20px}}
@media(max-width:560px){.hm-form-grid,.hm-kpi-grid{grid-template-columns:1fr}.hm-stage-sub{display:none}}
</style>
