<template>
  <div class="demo-shell">
    <!-- Barra superior estilo EXCOBA -->
    <header class="demo-topbar">
      <div class="demo-brand">
        <span class="demo-badge">EXCOBA</span>
        <span class="demo-sub">Examen de Competencias Básicas</span>
      </div>
      <div class="demo-toolbar">
        <button type="button" class="demo-mbtn" :class="{ active: activeModal === 'help' }" @click="toggleModal('help')">Cómo responder</button>
        <button type="button" class="demo-mbtn" :class="{ active: activeModal === 'guide' }" @click="toggleModal('guide')">Guía</button>
        <button type="button" class="demo-mbtn" :class="{ active: formOpen }" @click="formOpen = !formOpen">Formulario</button>
        <button type="button" class="demo-mbtn" :class="{ active: calcOpen }" @click="calcOpen = !calcOpen">Calculadora</button>
        <button type="button" class="demo-mbtn demo-finish" @click="demo.finish()">Finalizar</button>
        <button type="button" class="demo-mbtn demo-switch" @click="$emit('switch-classic')">← Menú principal</button>
      </div>
      <div class="demo-clock">{{ demo.elapsedFormatted }}</div>
    </header>

    <!-- Barra rápida por materia (acceso directo a los 70 demostrativos + 2,520 del temario) -->
    <nav class="demo-subjects" aria-label="Materias del examen">
      <button
        v-for="grp in demo.subjectGroups"
        :key="grp.key"
        type="button"
        class="demo-subj-pill"
        :class="{ active: demo.selectedSubjectKey === grp.key }"
        @click="onSubjectChange(grp.key)"
      >
        <span>{{ grp.label }}</span>
        <small>{{ grp.count.toLocaleString('es-MX') }}</small>
      </button>
    </nav>

    <!-- Selector de tema agrupado por etapa -->
    <section class="demo-selector">
      <label class="wide">
        <span>{{ demo.activeSubjectGroup?.isDemo180 ? 'Bloque en orden del temario (20 por materia)' : demo.activeSubjectGroup?.isOriginal ? 'Filtrar por asignatura' : 'Tema (agrupado por etapa educativa)' }}</span>
        <select :value="demo.selectedTopicRef" @change="onTopicChange($event.target.value)">
          <option value="">
            {{ demo.activeSubjectGroup?.isDemo180
              ? `Examen completo en orden del temario · 9 materias × 20 (${demo.activeSubjectGroup.count})`
              : demo.activeSubjectGroup?.isOriginal
                ? `Todas las asignaturas (${demo.activeSubjectGroup.count})`
                : `Todos los reactivos de ${demo.activeTitle} (${demo.activeSubjectGroup?.count?.toLocaleString('es-MX') || 0})` }}
          </option>
          <template v-if="demo.activeSubjectGroup?.isOriginal || demo.activeSubjectGroup?.isDemo180">
            <option v-for="t in demo.availableTopics" :key="t.ref" :value="t.ref">
              {{ t.subject }} ({{ t.count }})
            </option>
          </template>
          <template v-else>
            <optgroup v-for="grp in demo.topicsByStage" :key="grp.stage" :label="grp.stage">
              <option v-for="t in grp.topics" :key="t.ref" :value="t.ref">
                {{ t.ref }} · {{ t.title }} ({{ t.count }})
              </option>
            </optgroup>
          </template>
        </select>
      </label>

      <div class="demo-selector-right">
        <button v-if="demo.activeSubjectGroup?.isDemo180" type="button" class="demo-mbtn demo-cyan-btn demo-reshuffle" @click="onReshuffleDemo" title="Generar un nuevo examen aleatorio de 180 reactivos">
          ↻ Nuevo aleatorio
        </button>
        <form class="demo-jump-form" @submit.prevent="jumpByNumber">
          <label>
            <span>Ir al reactivo #</span>
            <div class="demo-jump-row">
              <input v-model="jumpInput" type="number" min="1" :max="demo.totalCount" :placeholder="`1–${demo.totalCount}`" class="demo-jump-inp" />
              <button type="submit" class="demo-mbtn">Ir</button>
            </div>
          </label>
        </form>
      </div>
    </section>

    <!-- Escenario principal + panel de reactivos -->
    <main class="demo-workspace">
      <section class="demo-stage">
        <template v-if="demo.showResults">
          <div class="demo-stage-head">
            <h2 class="demo-subject">Calificación · {{ demo.activeTitle }}</h2>
            <span class="demo-meta">Tiempo: {{ demo.elapsedFormatted }}</span>
          </div>
          <div class="demo-score-bar">
            <p class="demo-score-banner">
              Resultado: <strong>{{ demo.resultsSummary.totalCorrect }} / {{ demo.resultsSummary.totalQuestions }}</strong>
              ({{ demo.resultsSummary.percentage }}%)
            </p>
            <span class="demo-wrong-pill" :class="{ clean: demo.resultsSummary.totalWrong === 0 }">
              {{ demo.resultsSummary.totalWrong === 0 ? 'Sin errores' : `${demo.resultsSummary.totalWrong} equivocadas o sin responder` }}
            </span>
          </div>

          <div class="demo-actions">
            <button v-if="demo.resultsSummary.totalWrong > 0" type="button" class="demo-mbtn demo-warn-btn" @click="reviewWrongOnly">
              Revisar equivocadas ({{ demo.resultsSummary.totalWrong }})
            </button>
            <button type="button" class="demo-mbtn demo-cyan-btn" @click="reviewFullGraded">
              Ver examen calificado
            </button>
            <button type="button" class="demo-mbtn" @click="restartBlock">Reintentar bloque</button>
          </div>

          <div v-if="demo.resultsSummary.totalWrong === 0" class="demo-perfect-box">
            Todas las respuestas fueron correctas en este bloque.
          </div>

          <div v-else class="demo-wrong-groups">
            <h3 class="demo-wrong-heading">Preguntas equivocadas por área</h3>
            <div v-for="row in demo.resultsSummary.wrongRows" :key="row.key" class="demo-wrong-card">
              <div class="demo-wrong-card-head">
                <strong>{{ row.title }}</strong>
                <span>{{ row.correct }}/{{ row.total }} buenas · <b>{{ row.wrongCount }} equivocadas</b></span>
              </div>
              <div class="demo-wrong-chips">
                <button
                  v-for="w in row.wrongItems"
                  :key="w.id"
                  type="button"
                  class="demo-wrong-chip"
                  @click="openGradedItem(w.index, true)"
                >
                  #{{ w.number }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="item">
          <div class="demo-stage-head">
            <h2 class="demo-subject">
              {{ item.subject }}
              <span v-if="demo.hasFinished" class="demo-grade-tag" :class="demo.isCorrect(item) ? 'ok' : 'bad'">
                {{ demo.isCorrect(item) ? '✓ Correcta' : '✕ Equivocada' }}
              </span>
            </h2>
            <div class="demo-head-right">
              <span class="demo-meta">
                Reactivo {{ demo.currentIndex + 1 }} de {{ demo.totalCount }}<template v-if="!item.isOriginal"> · {{ item.stage }} · Tema {{ item.topicRef }}</template>
              </span>
              <template v-if="demo.hasFinished">
                <button v-if="demo.resultsSummary.totalWrong > 0" type="button" class="demo-mini-btn" :class="{ active: onlyWrongMode }" @click="toggleWrongFilter">
                  {{ onlyWrongMode ? 'Ver todas' : `Solo equivocadas (${demo.resultsSummary.totalWrong})` }}
                </button>
                <button type="button" class="demo-mini-btn" @click="demo.showResults = true">Resumen</button>
              </template>
            </div>
          </div>

          <DemoExcobaStage
            :item="item"
            :answer="demo.answers[item.id]"
            :keyboard-disabled="Boolean(activeModal) || calcOpen"
            @answer="val => demo.setAnswer(item.id, val)"
            @check-item="showItemReview = !showItemReview"
          />

          <div class="demo-stage-footer">
            <button type="button" class="demo-mbtn" @click="showItemReview = !showItemReview">
              {{ (showItemReview || demo.hasFinished) ? (showItemReview ? 'Ocultar clave' : 'Ver clave') : 'Comprobar' }}
            </button>
            <div class="demo-inline-nav">
              <button type="button" class="demo-mbtn" :disabled="!canStep(-1)" @click="step(-1)">◄ Anterior</button>
              <button type="button" class="demo-mbtn demo-cyan-btn" :disabled="!canStep(1)" @click="step(1)">Siguiente ►</button>
            </div>
          </div>

          <div v-if="showItemReview || demo.hasFinished" class="demo-review-box" :class="demo.isCorrect(item) ? 'ok' : 'warn'">
            <strong>{{ demo.isCorrect(item) ? '✓ Respuesta correcta' : '✕ Respuesta equivocada o sin responder' }}</strong>
            <div v-if="!demo.isCorrect(item)" class="demo-review-user"><span>Tu respuesta:</span> <span v-latex="demo.userAnswerText(item)"></span></div>
            <div class="demo-review-ans"><span>Respuesta correcta:</span> <span v-latex="item.correctAnswer"></span></div>
            <div v-if="item.explanation" class="demo-review-exp" v-latex="item.explanation"></div>
          </div>
        </template>
      </section>

      <aside class="demo-sidebar">
        <div class="demo-nav-box">
          <button type="button" class="demo-nav-btn" :disabled="!canStep(-1)" @click="step(-1)" title="Anterior">◄</button>
          <span class="demo-nav-num">{{ demo.totalCount ? `${demo.currentIndex + 1} / ${demo.totalCount}` : '- / -' }}</span>
          <button type="button" class="demo-nav-btn" :disabled="!canStep(1)" @click="step(1)" title="Siguiente">►</button>
        </div>

        <div ref="gridRef" class="demo-grid">
          <button
            v-for="entry in visibleGridItems"
            :key="entry.item.id"
            type="button"
            class="demo-gbtn"
            :class="{
              cur: entry.idx === demo.currentIndex,
              ans: !demo.hasFinished && demo.isAnswered(entry.item),
              ok: demo.hasFinished && demo.isCorrect(entry.item),
              bad: demo.hasFinished && !demo.isCorrect(entry.item),
            }"
            @click="jump(entry.idx)"
          >
            {{ entry.idx + 1 }}
          </button>
        </div>
        <div class="demo-status-line">
          <template v-if="demo.hasFinished">
            {{ demo.resultsSummary.totalCorrect }} buenas · {{ demo.resultsSummary.totalWrong }} equivocadas
          </template>
          <template v-else>
            {{ demo.answeredCount }} / {{ demo.totalCount }} contestadas
          </template>
        </div>
      </aside>
    </main>

    <DemoExcobaTools :modal="activeModal" :calc-open="calcOpen" :form-open="formOpen" @close-modal="activeModal = ''" @close-calc="calcOpen = false" @close-form="formOpen = false" />
  </div>
</template>

<script>
const { ref, computed, reactive, watch, nextTick, onMounted, onUnmounted } = Vue;
const { loadModule } = window['vue3-sfc-loader'];
const sfcOpts = window.__SFC_OPTIONS__;

export default {
  components: {
    DemoExcobaStage: Vue.defineAsyncComponent(() => loadModule('./components/DemoExcobaStage.vue', sfcOpts)),
    DemoExcobaTools: Vue.defineAsyncComponent(() => loadModule('./components/DemoExcobaTools.vue', sfcOpts)),
  },
  emits: ['switch-classic'],
  setup() {
    const demo = reactive(window.useDemoExcoba());
    const activeModal = ref('');
    const calcOpen = ref(false);
    const formOpen = ref(false);
    const showItemReview = ref(false);
    const onlyWrongMode = ref(false);
    const jumpInput = ref('');
    const gridRef = ref(null);
    const item = computed(() => demo.currentItem);

    const visibleGridItems = computed(() => {
      const wrongSet = onlyWrongMode.value && demo.hasFinished ? new Set(demo.resultsSummary.wrongIndices) : null;
      const out = [];
      demo.sessionItems.forEach((it, idx) => {
        if (!wrongSet || wrongSet.has(idx)) out.push({ item: it, idx });
      });
      return out;
    });

    const navOrder = computed(() => visibleGridItems.value.map(e => e.idx));
    const canStep = d => {
      const list = navOrder.value;
      const pos = list.indexOf(demo.currentIndex);
      if (pos < 0) return list.length > 0;
      return pos + d >= 0 && pos + d < list.length;
    };

    watch(() => demo.currentIndex, () => {
      nextTick(() => {
        const curBtn = gridRef.value?.querySelector?.('.demo-gbtn.cur');
        curBtn?.scrollIntoView?.({ block: 'nearest' });
      });
    });

    const toggleModal = name => { activeModal.value = activeModal.value === name ? '' : name; };
    const onSubjectChange = key => { showItemReview.value = false; onlyWrongMode.value = false; demo.selectSubjectGroup(key); };
    const onReshuffleDemo = () => { showItemReview.value = false; onlyWrongMode.value = false; demo.regenerateDemo180(); };
    const onTopicChange = refCode => { showItemReview.value = false; onlyWrongMode.value = false; demo.selectTopic(refCode); };
    const restartBlock = () => { showItemReview.value = false; onlyWrongMode.value = false; demo.resetSessionState(); demo.startClock(); };
    const openGradedItem = (idx, wrongOnly = false) => {
      onlyWrongMode.value = wrongOnly;
      demo.showResults = false;
      showItemReview.value = true;
      demo.goTo(idx);
    };
    const reviewWrongOnly = () => {
      const first = demo.resultsSummary.wrongIndices[0];
      if (first !== undefined) openGradedItem(first, true);
    };
    const reviewFullGraded = () => openGradedItem(0, false);
    const toggleWrongFilter = () => {
      onlyWrongMode.value = !onlyWrongMode.value;
      if (onlyWrongMode.value && !demo.resultsSummary.wrongIndices.includes(demo.currentIndex)) {
        const first = demo.resultsSummary.wrongIndices[0];
        if (first !== undefined) demo.goTo(first);
      }
    };
    const step = d => {
      const list = navOrder.value;
      const pos = list.indexOf(demo.currentIndex);
      const nextIdx = pos >= 0 ? list[pos + d] : list[0];
      if (nextIdx !== undefined) { showItemReview.value = demo.hasFinished; demo.goTo(nextIdx); }
    };
    const jump = i => { showItemReview.value = demo.hasFinished; demo.showResults = false; demo.goTo(i); };
    const jumpByNumber = () => {
      const n = Number(jumpInput.value);
      if (Number.isInteger(n) && n >= 1 && n <= demo.totalCount) {
        jump(n - 1);
        jumpInput.value = '';
      }
    };

    const onGlobalKey = ev => {
      if (ev.ctrlKey || ev.metaKey) return;
      const tag = ev.target?.tagName;
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (ev.altKey && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
        ev.preventDefault();
        step(ev.key === 'ArrowRight' ? 1 : -1);
        return;
      }
      if (inField && ev.key === 'Escape') {
        ev.target.blur();
        return;
      }
      if (inField || ev.altKey) return;

      const k = ev.key.toLowerCase();
      if (k === 'f') { ev.preventDefault(); formOpen.value = !formOpen.value; return; }
      if (k === 'k') { ev.preventDefault(); calcOpen.value = !calcOpen.value; return; }
      if (k === 'g') { ev.preventDefault(); toggleModal('guide'); return; }
      if (k === 'h' || ev.key === '?') { ev.preventDefault(); toggleModal('help'); return; }

      if (activeModal.value || calcOpen.value || demo.showResults) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); step(-1); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); step(1); }
      else if (k === 'v') { ev.preventDefault(); showItemReview.value = !showItemReview.value; }
    };

    onMounted(() => { demo.startClock(); window.addEventListener('keydown', onGlobalKey); });
    onUnmounted(() => { demo.stopClock(); window.removeEventListener('keydown', onGlobalKey); });

    return {
      demo, item, activeModal, calcOpen, formOpen, showItemReview, onlyWrongMode, jumpInput, gridRef, visibleGridItems,
      canStep, toggleModal, onSubjectChange, onReshuffleDemo, onTopicChange, restartBlock, openGradedItem,
      reviewWrongOnly, reviewFullGraded, toggleWrongFilter, step, jump, jumpByNumber,
    };
  },
};
</script>

<style scoped>
.demo-shell{background:#0b0e13;color:#f3f4f6;border:2px solid #374151;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.45);display:flex;flex-direction:column;height:calc(100vh - 3rem);min-height:560px}
.demo-topbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:linear-gradient(180deg,#2c323e,#171b22);border-bottom:2px solid #ffc12b;flex-wrap:wrap}
.demo-brand{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.demo-badge{background:#ffc12b;color:#111;font-weight:800;font-size:12px;padding:3px 8px;border-radius:4px;letter-spacing:.4px}
.demo-sub{font-size:12px;color:#d1d5db;font-weight:700}
.demo-toolbar{display:flex;gap:6px;flex-wrap:wrap}
.demo-mbtn{background:#2d3442;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer}
.demo-mbtn:hover:not(:disabled),.demo-mbtn.active{border-color:#2bc1ff;color:#2bc1ff;background:#243245}
.demo-mbtn:disabled{opacity:.38;cursor:default}
.demo-finish{background:#7f1d1d;border-color:#b91c1c}.demo-finish:hover{background:#991b1b;color:#fff}
.demo-switch{background:#1e3a5f;border-color:#2bc1ff;color:#e0f2fe}
.demo-cyan-btn{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.demo-clock{font-family:monospace;font-size:15px;font-weight:700;color:#00d8b3;background:#000;padding:5px 10px;border:1px solid #374151;border-radius:4px}
.demo-subjects{display:flex;gap:6px;padding:9px 14px;background:#11151d;border-bottom:1px solid #262d3b;overflow-x:auto;flex-wrap:wrap}
.demo-subj-pill{background:#1c222e;color:#d1d5db;border:1px solid #364054;border-radius:999px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.demo-subj-pill small{background:rgba(255,255,255,.08);color:#9ca3af;padding:1px 6px;border-radius:999px;font-size:10.5px}
.demo-subj-pill:hover{border-color:#2bc1ff;color:#fff}
.demo-subj-pill.active{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.demo-subj-pill.active small{background:#ffc12b;color:#111}
.demo-selector{display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px 14px;background:#151921;border-bottom:1px solid #2b313e;align-items:end}
.demo-selector-right{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap}
.demo-reshuffle{height:31px;white-space:nowrap}
.demo-jump-form{width:170px}
.demo-selector label{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#9ca3af;font-weight:700}
.demo-selector select,.demo-jump-inp{background:#222834;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:6px 8px;font-size:12px}
.demo-jump-row{display:flex;gap:6px}
.demo-jump-inp{width:100%;min-width:0}
.demo-workspace{display:grid;grid-template-columns:1fr 236px;gap:12px;padding:12px 14px;flex:1;min-height:0}
.demo-stage{background:#000;border:2px solid #374151;border-radius:6px;padding:18px 20px;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px}
.demo-stage-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a303c;padding-bottom:8px;gap:8px;flex-wrap:wrap}
.demo-subject{margin:0;color:#ffc12b;font-size:17px;font-weight:700}
.demo-meta{font-size:12px;color:#9ca3af;font-weight:700}
.demo-stage-footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid #2a303c;padding-top:12px;flex-wrap:wrap}
.demo-inline-nav,.demo-actions{display:flex;gap:8px}
.demo-review-box{padding:10px 12px;border-radius:5px;font-size:13px;line-height:1.5;display:flex;flex-direction:column;gap:4px}
.demo-review-box.ok{background:#0d2d26;border:1px solid #00d8b3;color:#d1fae5}
.demo-review-box.warn{background:#2c220c;border:1px solid #ffc12b;color:#fef3c7}
.demo-review-ans{font-weight:700}.demo-review-exp{color:#e5e7eb}
.demo-sidebar{background:#181c23;border:1px solid #374151;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:0;height:100%}
.demo-nav-box{display:flex;align-items:center;justify-content:space-between;background:#0e1116;border:1px solid #3b4252;border-radius:5px;padding:6px;flex-shrink:0}
.demo-nav-btn{background:#2d3442;color:#ffc12b;border:1px solid #4b5563;border-radius:4px;width:34px;height:32px;font-size:16px;font-weight:700;cursor:pointer}
.demo-nav-btn:disabled{opacity:.35;cursor:default}
.demo-nav-num{font-weight:700;font-size:13px;color:#fff}
.demo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;flex:1;min-height:0;overflow-y:auto;align-content:start;padding-right:2px}
.demo-gbtn{background:#2a303c;color:#d1d5db;border:1px solid #4b5563;border-radius:3px;padding:6px 0;font-size:11px;font-weight:700;cursor:pointer}
.demo-gbtn.cur{border-color:#ffc12b;color:#ffc12b;box-shadow:inset 0 0 0 1px #ffc12b}
.demo-gbtn.ans,.demo-gbtn.ok{background:#0e4f43;border-color:#00d8b3;color:#fff}
.demo-gbtn.bad{background:#5c161b;border-color:#f87171;color:#fecaca}
.demo-status-line{font-size:11px;color:#9ca3af;text-align:center;flex-shrink:0}
.demo-head-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.demo-mini-btn{background:#1f2735;color:#cbd5e1;border:1px solid #475569;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:700;cursor:pointer}
.demo-mini-btn.active,.demo-mini-btn:hover{border-color:#ffc12b;color:#ffc12b}
.demo-grade-tag{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;font-size:11px;vertical-align:middle}
.demo-grade-tag.ok{background:#0d2d26;border:1px solid #00d8b3;color:#6ee7b7}
.demo-grade-tag.bad{background:#4c1419;border:1px solid #f87171;color:#fecaca}
.demo-score-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.demo-score-banner{font-size:16px;color:#00d8b3;margin:0}
.demo-wrong-pill{background:#4c1419;border:1px solid #f87171;color:#fecaca;border-radius:999px;padding:4px 11px;font-size:12px;font-weight:700}
.demo-wrong-pill.clean{background:#0d2d26;border-color:#00d8b3;color:#6ee7b7}
.demo-warn-btn{background:#7c2d12;border-color:#fb923c;color:#ffedd5}
.demo-warn-btn:hover{background:#9a3412;color:#fff}
.demo-perfect-box{background:#0d2d26;border:1px solid #00d8b3;color:#a7f3d0;padding:14px;border-radius:6px;font-weight:700}
.demo-wrong-groups{display:flex;flex-direction:column;gap:10px}
.demo-wrong-heading{margin:4px 0 0;font-size:13px;color:#cbd5e1;text-transform:uppercase;letter-spacing:.4px}
.demo-wrong-card{background:#11161f;border:1px solid #334155;border-left:3px solid #f87171;border-radius:6px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.demo-wrong-card-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:#f3f4f6}
.demo-wrong-card-head span{font-size:12px;color:#9ca3af}
.demo-wrong-card-head b{color:#fca5a5}
.demo-wrong-chips{display:flex;flex-wrap:wrap;gap:6px}
.demo-wrong-chip{background:#3b151a;border:1px solid #f87171;color:#fecaca;border-radius:4px;padding:4px 9px;font-size:12px;font-weight:700;cursor:pointer}
.demo-wrong-chip:hover{background:#7f1d1d;color:#fff}
@media(max-width:860px){.demo-shell{height:auto;min-height:calc(100vh - 2rem)}.demo-workspace,.demo-selector{grid-template-columns:1fr}.demo-grid{max-height:240px}}
</style>
