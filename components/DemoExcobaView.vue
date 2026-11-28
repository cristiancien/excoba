<template>
  <div class="demo-shell">
    <!-- Barra horizontal estilo DemoExcoba.exe -->
    <header class="demo-topbar">
      <div class="demo-brand">
        <span class="demo-badge">DEMO EXCOBA</span>
        <span class="demo-sub">
          Réplica fiel · {{ demo.originalCount }} interactivos (SVG/Canvas/LaTeX) + {{ demo.totalTopics }} temas × {{ demo.reactivosPerTopic }} = {{ demo.totalReactivos.toLocaleString('es-MX') }} del temario
        </span>
      </div>
      <div class="demo-toolbar">
        <button type="button" class="demo-mbtn" @click="activeModal = 'help'">Cómo responder</button>
        <button type="button" class="demo-mbtn" @click="activeModal = 'guide'">Guía</button>
        <button type="button" class="demo-mbtn" @click="activeModal = 'form'">Formulario</button>
        <button type="button" class="demo-mbtn" @click="activeModal = 'calc'">Calculadora</button>
        <button type="button" class="demo-mbtn demo-finish" @click="demo.finish()">Finalizar</button>
        <button type="button" class="demo-mbtn demo-switch" @click="$emit('switch-classic')">⇄ Interfaz actual</button>
      </div>
      <div class="demo-clock">{{ demo.elapsedFormatted }}</div>
    </header>

    <!-- Selector directo: 70 originales recuperados + 9 materias / 126 temas (20 c/u) -->
    <section class="demo-selector">
      <label>
        <span>Paquete ({{ demo.packages.length }})</span>
        <select :value="demo.selectedPackageId" @change="onPackageChange($event.target.value)">
          <option v-for="pkg in demo.packages" :key="pkg.id" :value="pkg.id">
            {{ pkg.stage }} · {{ pkg.subject }} ({{ pkg.count }})
          </option>
        </select>
      </label>
      <label class="wide">
        <span>{{ demo.activePackage?.isOriginal ? 'Asignatura (Muestra interactiva SVG/Canvas/LaTeX)' : 'Tema de Temario.pdf (20 reactivos por tema)' }}</span>
        <select :value="demo.selectedTopicRef" @change="onTopicChange($event.target.value)">
          <option value="">
            {{ demo.activePackage?.isOriginal ? `Todas las asignaturas (${demo.activePackage.count})` : `Todos los temas del paquete (${demo.activePackage?.count || 0})` }}
          </option>
          <option v-for="t in demo.availableTopics" :key="t.ref" :value="t.ref">
            {{ demo.activePackage?.isOriginal ? `${t.subject} (${t.count})` : `${t.ref} · ${t.title} (${t.count})` }}
          </option>
        </select>
      </label>
    </section>

    <!-- Escenario principal + rejilla derecha -->
    <main class="demo-workspace">
      <section class="demo-stage">
        <template v-if="demo.showResults">
          <div class="demo-stage-head">
            <h2 class="demo-subject">Calificación · {{ demo.activePackage?.subject }}</h2>
            <span class="demo-meta">Tiempo: {{ demo.elapsedFormatted }}</span>
          </div>
          <p class="demo-score-banner">
            Resultado: <strong>{{ demo.resultsSummary.totalCorrect }} / {{ demo.resultsSummary.totalQuestions }}</strong>
            ({{ demo.resultsSummary.percentage }}%)
          </p>
          <table class="demo-score-table">
            <thead><tr><th>Área / Tema</th><th>Calificación (puntos)</th></tr></thead>
            <tbody>
              <tr v-for="row in demo.resultsSummary.rows" :key="row.ref + row.title">
                <td>{{ row.ref === 'ORIG' ? row.title : `${row.ref} · ${row.title}` }}</td>
                <td><strong>{{ row.correct }} / {{ row.total }}</strong></td>
              </tr>
              <tr>
                <td style="text-align:right"><strong>Total</strong></td>
                <td><strong>{{ demo.resultsSummary.totalCorrect }} / {{ demo.resultsSummary.totalQuestions }}</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="demo-actions">
            <button type="button" class="demo-mbtn" @click="demo.showResults = false">Revisar reactivos</button>
            <button type="button" class="demo-mbtn demo-cyan-btn" @click="demo.resetSessionState(); demo.startClock()">Reintentar bloque</button>
          </div>
        </template>

        <template v-else-if="item">
          <div class="demo-stage-head">
            <h2 class="demo-subject">{{ item.subject }} · {{ item.isOriginal ? item.id : `Tema ${item.topicRef}` }}</h2>
            <span class="demo-meta">
              {{ item.id }} · Tipo {{ item.tipo }}{{ item.isOriginal ? ` · ${item.sourcePkg}` : ` · ${levelLabels[item.level]}` }} · Calc: {{ item.calculator ? 'Sí' : 'No' }}
            </span>
          </div>

          <DemoExcobaStage :item="item" :answer="demo.answers[item.id]" @answer="val => demo.setAnswer(item.id, val)" />

          <div class="demo-stage-footer">
            <button type="button" class="demo-mbtn" @click="showItemReview = !showItemReview">
              {{ showItemReview ? 'Ocultar clave' : 'Comprobar reactivo' }}
            </button>
            <div class="demo-inline-nav">
              <button type="button" class="demo-mbtn" :disabled="demo.currentIndex <= 0" @click="step(-1)">◄ Anterior</button>
              <button type="button" class="demo-mbtn demo-cyan-btn" :disabled="demo.currentIndex >= demo.totalCount - 1" @click="step(1)">Siguiente ►</button>
            </div>
          </div>

          <div v-if="showItemReview" class="demo-review-box" :class="demo.isCorrect(item) ? 'ok' : 'warn'">
            <strong>{{ demo.isCorrect(item) ? '✓ Respuesta correcta' : '✕ Respuesta pendiente o distinta a la clave' }}</strong>
            <div class="demo-review-ans"><span>Clave:</span> <span v-latex="item.correctAnswer"></span></div>
            <div v-if="item.explanation" class="demo-review-exp" v-latex="item.explanation"></div>
          </div>
        </template>
      </section>

      <aside class="demo-sidebar">
        <div class="demo-nav-box">
          <button type="button" class="demo-nav-btn" :disabled="demo.currentIndex <= 0" @click="step(-1)" title="Anterior">◄</button>
          <span class="demo-nav-num">{{ demo.totalCount ? `${demo.currentIndex + 1} / ${demo.totalCount}` : '- / -' }}</span>
          <button type="button" class="demo-nav-btn" :disabled="demo.currentIndex >= demo.totalCount - 1" @click="step(1)" title="Siguiente">►</button>
        </div>
        <div class="demo-grid">
          <button v-for="(q, idx) in demo.sessionItems" :key="q.id" type="button" class="demo-gbtn" :class="{ cur: idx === demo.currentIndex, ans: demo.isAnswered(q) }" @click="jump(idx)">
            {{ idx + 1 }}
          </button>
        </div>
        <div class="demo-status-line">{{ demo.answeredCount }} / {{ demo.totalCount }} contestadas</div>
      </aside>
    </main>

    <div v-if="activeModal" class="demo-modal-bg" @click.self="activeModal = ''">
      <div class="demo-modal">
        <template v-if="activeModal === 'help'">
          <h3>Cómo responder en DemoExcoba</h3>
          <p><strong>Tipo 4 / 23:</strong> haz clic en el espacio subrayado para desplegar opciones.<br><strong>Tipo 5:</strong> selecciona una tarjeta cian y haz clic en su categoría.<br><strong>Tipo 6:</strong> haz clic en las oraciones en orden.<br><strong>Tipo 7 / 8 / 11 / 15 / 22:</strong> escribe el resultado numérico.<br><strong>Tipo 3 / 16 / 18 / 19 / 24:</strong> haz clic sobre las frases o regiones sobre la imagen.</p>
        </template>
        <template v-else-if="activeModal === 'guide'">
          <h3>Guía rápida · Réplica DemoExcoba</h3>
          <p>Incluye los <strong>{{ demo.originalCount }} reactivos únicos originales</strong> de DemoExcoba y <strong>20 reactivos por cada uno de los {{ demo.totalTopics }} temas de Temario.pdf ({{ demo.totalReactivos.toLocaleString('es-MX') }})</strong> con el mismo estilo e interacción.</p>
        </template>
        <template v-else-if="activeModal === 'form'">
          <h3>Formulario EXCOBA</h3>
          <p><strong>Matemáticas:</strong> A<sub>△</sub>=bh/2 · A<sub>○</sub>=πr² · c²=a²+b² · x=(-b±√(b²-4ac))/2a · m=(y₂-y₁)/(x₂-x₁)</p>
          <p><strong>Física:</strong> v=d/t · a=Δv/t · F=ma · E<sub>c</sub>=½mv² · E<sub>p</sub>=mgh · P=F/A · V=IR</p>
          <p><strong>Química:</strong> n=m/M · PV=nRT · pH=-log[H⁺]</p>
        </template>
        <template v-else-if="activeModal === 'calc'">
          <h3>Calculadora DemoExcoba</h3>
          <input class="demo-calc-disp" readonly :value="calcExpr || '0'">
          <div class="demo-calc-grid">
            <button v-for="k in calcKeys" :key="k" type="button" class="demo-mbtn" @click="pressCalc(k)">{{ k }}</button>
          </div>
        </template>
        <div style="margin-top:12px;text-align:right">
          <button type="button" class="demo-mbtn" @click="activeModal = ''">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, computed, reactive, onMounted, onUnmounted } = Vue;
const { loadModule } = window['vue3-sfc-loader'];
const sfcOpts = window.__SFC_OPTIONS__;

export default {
  components: {
    DemoExcobaStage: Vue.defineAsyncComponent(() => loadModule('./components/DemoExcobaStage.vue', sfcOpts)),
  },
  emits: ['switch-classic'],
  setup() {
    const demo = reactive(window.useDemoExcoba());
    const levelLabels = { 1: 'Fácil', 2: 'Medio', 3: 'Semidifícil', 4: 'Difícil' };
    const activeModal = ref('');
    const showItemReview = ref(false);
    const calcExpr = ref('');
    const calcKeys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','(',')','√'];
    const item = computed(() => demo.currentItem);

    const onPackageChange = id => { showItemReview.value = false; demo.selectPackage(id); };
    const onTopicChange = refCode => { showItemReview.value = false; demo.selectTopic(refCode); };
    const step = d => { showItemReview.value = false; demo.goTo(demo.currentIndex + d); };
    const jump = i => { showItemReview.value = false; demo.goTo(i); };
    const pressCalc = k => {
      if (k === 'C') { calcExpr.value = ''; return; }
      if (k === '√') { calcExpr.value = String(Math.round(Math.sqrt(Math.max(0, Number(calcExpr.value) || 0)) * 1e6) / 1e6); return; }
      if (k === '=') {
        try { const safe = calcExpr.value.replace(/[^0-9+\-*/().]/g, ''); calcExpr.value = safe ? String(Function(`"use strict";return (${safe})`)()) : '0'; }
        catch (_) { calcExpr.value = 'Error'; }
        return;
      }
      calcExpr.value += k;
    };

    onMounted(() => demo.startClock());
    onUnmounted(() => demo.stopClock());
    return { demo, item, levelLabels, activeModal, showItemReview, calcExpr, calcKeys, onPackageChange, onTopicChange, step, jump, pressCalc };
  },
};
</script>

<style scoped>
.demo-shell{background:#0b0e13;color:#f3f4f6;border:2px solid #374151;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.45)}
.demo-topbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:linear-gradient(180deg,#2c323e,#171b22);border-bottom:2px solid #ffc12b;flex-wrap:wrap}
.demo-brand{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.demo-badge{background:#ffc12b;color:#111;font-weight:800;font-size:12px;padding:3px 8px;border-radius:4px}
.demo-sub{font-size:12px;color:#d1d5db;font-weight:700}
.demo-toolbar{display:flex;gap:6px;flex-wrap:wrap}
.demo-mbtn{background:#2d3442;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer}
.demo-mbtn:hover:not(:disabled){border-color:#2bc1ff;color:#2bc1ff;background:#374151}
.demo-mbtn:disabled{opacity:.38;cursor:default}
.demo-finish{background:#7f1d1d;border-color:#b91c1c}.demo-finish:hover{background:#991b1b;color:#fff}
.demo-switch{background:#1e3a5f;border-color:#2bc1ff;color:#e0f2fe}
.demo-cyan-btn{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.demo-clock{font-family:monospace;font-size:15px;font-weight:700;color:#00d8b3;background:#000;padding:5px 10px;border:1px solid #374151;border-radius:4px}
.demo-selector{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;padding:10px 14px;background:#151921;border-bottom:1px solid #2b313e}
.demo-selector label{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#9ca3af;font-weight:700}
.demo-selector select{background:#222834;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:6px 8px;font-size:12px}
.demo-workspace{display:grid;grid-template-columns:1fr 225px;gap:12px;padding:14px}
.demo-stage{background:#000;border:2px solid #374151;border-radius:6px;padding:18px 20px;min-height:520px;display:flex;flex-direction:column;gap:14px}
.demo-stage-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a303c;padding-bottom:8px;gap:8px;flex-wrap:wrap}
.demo-subject{margin:0;color:#ffc12b;font-size:16px;font-weight:700}
.demo-meta{font-size:12px;color:#9ca3af}
.demo-stage-footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #2a303c;padding-top:12px;flex-wrap:wrap}
.demo-inline-nav,.demo-actions{display:flex;gap:8px}
.demo-review-box{padding:10px 12px;border-radius:5px;font-size:13px;line-height:1.5;display:flex;flex-direction:column;gap:4px}
.demo-review-box.ok{background:#0d2d26;border:1px solid #00d8b3;color:#d1fae5}
.demo-review-box.warn{background:#2c220c;border:1px solid #ffc12b;color:#fef3c7}
.demo-review-ans{font-weight:700}.demo-review-exp{color:#e5e7eb}
.demo-sidebar{background:#181c23;border:1px solid #374151;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:10px}
.demo-nav-box{display:flex;align-items:center;justify-content:space-between;background:#0e1116;border:1px solid #3b4252;border-radius:5px;padding:6px}
.demo-nav-btn{background:#2d3442;color:#ffc12b;border:1px solid #4b5563;border-radius:4px;width:34px;height:32px;font-size:16px;font-weight:700;cursor:pointer}
.demo-nav-btn:disabled{opacity:.35;cursor:default}
.demo-nav-num{font-weight:700;font-size:14px;color:#fff}
.demo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;max-height:380px;overflow-y:auto}
.demo-gbtn{background:#2a303c;color:#d1d5db;border:1px solid #4b5563;border-radius:3px;padding:6px 0;font-size:11px;font-weight:700;cursor:pointer}
.demo-gbtn.cur{border-color:#ffc12b;color:#ffc12b;box-shadow:inset 0 0 0 1px #ffc12b}
.demo-gbtn.ans{background:#0e4f43;border-color:#00d8b3;color:#fff}
.demo-status-line{font-size:11px;color:#9ca3af;text-align:center}
.demo-score-banner{font-size:15px;color:#00d8b3;margin:0}
.demo-score-table{width:100%;border-collapse:collapse;font-size:13px}
.demo-score-table th{background:#f3a140;color:#000;padding:7px;text-align:left}
.demo-score-table td{background:#d2cdbe;color:#000;padding:6px 8px;border-bottom:1px solid #999}
.demo-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:1000;padding:14px}
.demo-modal{background:#1c212b;border:2px solid #ffc12b;border-radius:6px;max-width:560px;width:100%;padding:18px;color:#f3f4f6;font-size:13px;line-height:1.55}
.demo-modal h3{margin:0 0 10px;color:#ffc12b}
.demo-calc-disp{width:100%;max-width:260px;display:block;margin:0 auto 8px;background:#000;color:#00d8b3;font-family:monospace;font-size:20px;padding:8px;text-align:right;border:1px solid #4b5563}
.demo-calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:260px;margin:0 auto}
@media(max-width:860px){.demo-workspace,.demo-selector{grid-template-columns:1fr}}
</style>
