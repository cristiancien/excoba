<template>
  <div class="demo-shell">
    <!-- Barra superior densa estilo EXCOBA -->
    <header class="demo-topbar">
      <div class="demo-brand">
        <span class="demo-badge">EXCOBA</span>
        <button type="button" class="demo-filter-toggle" :class="{ open: showFilters }" @click="showFilters = !showFilters">
          <span>{{ demo.activeTitle }} ({{ demo.totalCount }})</span>
          <span class="demo-caret">{{ showFilters ? '▴' : '▾' }}</span>
        </button>
        <button v-if="demo.activeSubjectGroup?.isDemo180" type="button" class="demo-mbtn demo-cyan-btn demo-compact-btn" @click="onReshuffleDemo" title="Generar nuevo examen aleatorio">
          ↻ Nuevo
        </button>
      </div>

      <div class="demo-toolbar">
        <button type="button" class="demo-mbtn" :class="{ active: activeModal === 'help' }" @click="toggleModal('help')">Cómo responder</button>
        <button type="button" class="demo-mbtn" :class="{ active: activeModal === 'guide' }" @click="toggleModal('guide')">Guía</button>
        <button type="button" class="demo-mbtn" :class="{ active: formOpen }" @click="formOpen = !formOpen">Formulario</button>
        <button type="button" class="demo-mbtn" :class="{ active: calcOpen }" @click="calcOpen = !calcOpen">Calculadora</button>
        <button type="button" class="demo-mbtn demo-finish" @click="demo.finish()">Finalizar</button>
        <button type="button" class="demo-mbtn demo-switch" @click="$emit('switch-classic')">← Menú</button>
      </div>

      <div class="demo-clock" :class="demo.clockStatus" :title="clockTooltip">{{ demo.elapsedFormatted }}</div>
    </header>

    <!-- Área de selección de materia y tema (colapsada por defecto) -->
    <section v-if="showFilters" class="demo-filter-drawer">
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

      <div class="demo-topic-bar">
        <select :value="demo.selectedTopicRef" aria-label="Seleccionar tema" @change="onTopicChange($event.target.value)">
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
      </div>
    </section>

    <!-- Escenario principal + panel escrolleable de reactivos -->
    <main class="demo-workspace">
      <section class="demo-stage">
        <template v-if="demo.showResults">
          <div class="demo-stage-head">
            <h2 class="demo-subject">Calificación · {{ demo.activeTitle }}</h2>
            <span class="demo-meta">{{ demo.elapsedFormatted }}</span>
          </div>
          <div class="demo-score-bar">
            <p class="demo-score-banner">
              Resultado: <strong>{{ demo.resultsSummary.totalCorrect }} / {{ demo.resultsSummary.totalQuestions }}</strong>
              ({{ demo.resultsSummary.percentage }}%)
            </p>
            <span class="demo-wrong-pill" :class="{ clean: demo.resultsSummary.totalWrong === 0 }">
              {{ demo.resultsSummary.totalWrong === 0 ? 'Sin errores' : `${demo.resultsSummary.totalWrong} equivocadas` }}
            </span>
          </div>

          <div class="demo-actions">
            <button v-if="demo.resultsSummary.totalWrong > 0" type="button" class="demo-mbtn demo-warn-btn" @click="reviewWrongOnly">
              Revisar equivocadas ({{ demo.resultsSummary.totalWrong }})
            </button>
            <button type="button" class="demo-mbtn demo-cyan-btn" @click="reviewFullGraded">
              Ver examen calificado
            </button>
            <button type="button" class="demo-mbtn" @click="restartBlock">Reintentar</button>
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
            <div class="demo-title-wrap">
              <h2 class="demo-subject">
                {{ item.subject }}
                <span v-if="demo.hasFinished" class="demo-grade-tag" :class="demo.isCorrect(item) ? 'ok' : 'bad'">
                  {{ demo.isCorrect(item) ? '✓ Correcta' : '✕ Equivocada' }}
                </span>
              </h2>
              <button type="button" class="demo-level-pill" :class="{ open: showMetaDetail }" @click="showMetaDetail = !showMetaDetail" :title="showMetaDetail ? 'Ocultar detalle' : 'Ver reactivo y tema'">
                {{ shortStageLabel }}
                <span v-if="showMetaDetail"> · #{{ demo.currentIndex + 1 }}/{{ demo.totalCount }}<template v-if="!item.isOriginal"> · Tema {{ item.topicRef }}: {{ item.topicTitle }}</template></span>
                <span class="demo-caret">{{ showMetaDetail ? '▴' : '▾' }}</span>
              </button>
            </div>

            <div v-if="demo.hasFinished" class="demo-head-right">
              <button v-if="demo.resultsSummary.totalWrong > 0" type="button" class="demo-mini-btn" :class="{ active: onlyWrongMode }" @click="toggleWrongFilter">
                {{ onlyWrongMode ? 'Todas' : `Equivocadas (${demo.resultsSummary.totalWrong})` }}
              </button>
              <button type="button" class="demo-mini-btn" @click="demo.showResults = true">Resumen</button>
            </div>
          </div>

          <DemoExcobaStage
            :item="item"
            :answer="demo.answers[item.id]"
            :keyboard-disabled="Boolean(activeModal) || calcOpen"
            @answer="val => demo.setAnswer(item.id, val)"
            @check-item="showItemReview = !showItemReview"
          />

          <div class="demo-stage-bottom">
            <div v-if="hasNumericFormatHint" class="demo-format-hint">
              <strong>Formato:</strong> decimales con punto (redondeo automático a 2 decimales, ej. <code>3.1416 → 3.14</code>), fracciones con <code>/</code> (<code>3/4</code>), potencias con <code>^</code> (<code>x^2</code>, <code>2^3</code>, <code>10^-3</code>) y raíces <code>sqrt(x)</code>.
            </div>
            <div class="demo-stage-footer">
              <button type="button" class="demo-mbtn" @click="showItemReview = !showItemReview">
                {{ (showItemReview || demo.hasFinished) ? (showItemReview ? 'Ocultar clave' : 'Ver clave') : 'Comprobar' }}
              </button>
              <div class="demo-inline-nav">
                <button type="button" class="demo-mbtn" :disabled="!canStep(-1)" @click="step(-1)">◄ Anterior</button>
                <button type="button" class="demo-mbtn demo-cyan-btn" :disabled="!canStep(1)" @click="step(1)">Siguiente ►</button>
              </div>
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
            {{ demo.resultsSummary.totalCorrect }} buenas · {{ demo.resultsSummary.totalWrong }} malas
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

const STAGE_SHORT = {
  'EDUCACIÓN PRIMARIA': 'Primaria',
  'EDUCACIÓN SECUNDARIA': 'Secundaria',
  'BACHILLERATO': 'Bachillerato',
  'EXAMEN DEMOSTRATIVO': 'General',
};

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
    const showFilters = ref(false);
    const showMetaDetail = ref(false);
    const showItemReview = ref(false);
    const onlyWrongMode = ref(false);
    const gridRef = ref(null);
    const item = computed(() => demo.currentItem);

    const shortStageLabel = computed(() => {
      const st = String(item.value?.stage || '').trim().toUpperCase();
      return STAGE_SHORT[st] || item.value?.stage || 'General';
    });
    const hasNumericFormatHint = computed(() => {
      const it = item.value;
      if (!it) return false;
      return it.tipo === 7 || (Boolean(it.isOriginal) && [7, 8, 11, 15, 22].includes(it.tipo));
    });
    const clockTooltip = computed(() => {
      const lim = window.EXCOBA_DEMO_UTILS?.formatSeconds?.(demo.timeLimitSeconds) || '03:00:00';
      if (demo.clockStatus === 'over') return `Tiempo excedido (referencia ${lim}) — el reloj continúa`;
      if (demo.clockStatus === 'warn') return `Quedan menos de 15 min (referencia ${lim})`;
      return `Tiempo de referencia: ${lim}`;
    });

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
    const onTopicChange = refCode => { showItemReview.value = false; onlyWrongMode.value = false; demo.selectTopic(refCode); showFilters.value = false; };
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
      demo, item, shortStageLabel, hasNumericFormatHint, clockTooltip,
      activeModal, calcOpen, formOpen, showFilters, showMetaDetail, showItemReview, onlyWrongMode, gridRef, visibleGridItems,
      canStep, toggleModal, onSubjectChange, onReshuffleDemo, onTopicChange, restartBlock, openGradedItem,
      reviewWrongOnly, reviewFullGraded, toggleWrongFilter, step, jump,
    };
  },
};
</script>

<style scoped>
.demo-shell{background:#0b0e13;color:#f3f4f6;border:1.5px solid #374151;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.45);display:flex;flex-direction:column;height:calc(100vh - 1rem);min-height:520px}
.demo-topbar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 10px;background:linear-gradient(180deg,#2a303c,#161a21);border-bottom:2px solid #ffc12b;flex-wrap:wrap}
.demo-brand{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.demo-badge{background:#ffc12b;color:#111;font-weight:800;font-size:11px;padding:3px 7px;border-radius:4px;letter-spacing:.4px}
.demo-filter-toggle{display:inline-flex;align-items:center;gap:5px;background:#1d2431;color:#e5e7eb;border:1px solid #475569;border-radius:4px;padding:4px 8px;font-size:11.5px;font-weight:700;cursor:pointer}
.demo-filter-toggle.open,.demo-filter-toggle:hover{border-color:#2bc1ff;color:#fff}
.demo-caret{font-size:10px;opacity:.8}
.demo-toolbar{display:flex;gap:4px;flex-wrap:wrap}
.demo-mbtn{background:#2a3140;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:4px 8px;font-size:11.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.demo-compact-btn{padding:4px 7px}
.demo-mbtn:hover:not(:disabled),.demo-mbtn.active{border-color:#2bc1ff;color:#2bc1ff;background:#223042}
.demo-mbtn:disabled{opacity:.38;cursor:default}
.demo-finish{background:#7f1d1d;border-color:#b91c1c}.demo-finish:hover{background:#991b1b;color:#fff}
.demo-switch{background:#1e3a5f;border-color:#2bc1ff;color:#e0f2fe}
.demo-cyan-btn{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.demo-clock{font-family:monospace;font-size:13.5px;font-weight:700;color:#00d8b3;background:#000;padding:4px 8px;border:1px solid #374151;border-radius:4px;transition:color .25s,border-color .25s,background .25s}
.demo-clock.warn{color:#ffc12b;border-color:#ffc12b;background:#261d08}
.demo-clock.over{color:#f87171;border-color:#ef4444;background:#2d0e12}
.demo-filter-drawer{background:#12161f;border-bottom:1px solid #2a3140;padding:7px 10px;display:flex;flex-direction:column;gap:6px}
.demo-subjects{display:flex;gap:5px;flex-wrap:wrap}
.demo-subj-pill{background:#1c222e;color:#d1d5db;border:1px solid #364054;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.demo-subj-pill small{background:rgba(255,255,255,.08);color:#9ca3af;padding:0 5px;border-radius:999px;font-size:10px}
.demo-subj-pill:hover{border-color:#2bc1ff;color:#fff}
.demo-subj-pill.active{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.demo-subj-pill.active small{background:#ffc12b;color:#111}
.demo-topic-bar select{width:100%;background:#1f2532;color:#fff;border:1px solid #4b5563;border-radius:4px;padding:5px 8px;font-size:11.5px}
.demo-workspace{display:grid;grid-template-columns:1fr 206px;gap:8px;padding:8px;flex:1;min-height:0}
.demo-stage{background:#000;border:1.5px solid #374151;border-radius:6px;padding:12px 14px;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
.demo-stage-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #262c38;padding-bottom:6px;gap:8px;flex-wrap:wrap}
.demo-title-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.demo-subject{margin:0;color:#ffc12b;font-size:15.5px;font-weight:700}
.demo-level-pill{background:#151b26;color:#9ca3af;border:1px solid #334155;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-align:left}
.demo-level-pill.open,.demo-level-pill:hover{border-color:#2bc1ff;color:#e5e7eb}
.demo-meta{font-size:11.5px;color:#9ca3af;font-weight:700}
.demo-stage-bottom{margin-top:auto;display:flex;flex-direction:column;gap:8px}
.demo-format-hint{background:#0f141e;border:1px solid #263142;border-left:3px solid #ffc12b;border-radius:4px;padding:6px 9px;font-size:11px;line-height:1.45;color:#cbd5e1}
.demo-format-hint strong{color:#ffc12b}
.demo-format-hint code{background:#1e2636;color:#7dd3fc;padding:1px 4px;border-radius:3px;font-family:monospace}
.demo-stage-footer{display:flex;justify-content:space-between;align-items:center;gap:6px;border-top:1px solid #262c38;padding-top:8px;flex-wrap:wrap}
.demo-inline-nav,.demo-actions{display:flex;gap:6px;flex-wrap:wrap}
.demo-review-box{padding:8px 10px;border-radius:5px;font-size:12.5px;line-height:1.45;display:flex;flex-direction:column;gap:3px}
.demo-review-box.ok{background:#0d2d26;border:1px solid #00d8b3;color:#d1fae5}
.demo-review-box.warn{background:#2c220c;border:1px solid #ffc12b;color:#fef3c7}
.demo-review-ans{font-weight:700}.demo-review-exp{color:#e5e7eb}
.demo-sidebar{background:#151921;border:1px solid #374151;border-radius:6px;padding:7px;display:flex;flex-direction:column;gap:6px;min-height:0;height:100%}
.demo-nav-box{display:flex;align-items:center;justify-content:space-between;background:#0d1016;border:1px solid #334155;border-radius:4px;padding:4px;flex-shrink:0}
.demo-nav-btn{background:#2a3140;color:#ffc12b;border:1px solid #4b5563;border-radius:3px;width:30px;height:26px;font-size:14px;font-weight:700;cursor:pointer}
.demo-nav-btn:disabled{opacity:.35;cursor:default}
.demo-nav-num{font-weight:700;font-size:12px;color:#fff}
.demo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;flex:1;min-height:0;overflow-y:auto;align-content:start;padding-right:2px}
.demo-gbtn{background:#262d3a;color:#d1d5db;border:1px solid #414b5e;border-radius:3px;padding:4px 0;font-size:10.5px;font-weight:700;cursor:pointer}
.demo-gbtn.cur{border-color:#ffc12b;color:#ffc12b;box-shadow:inset 0 0 0 1px #ffc12b}
.demo-gbtn.ans,.demo-gbtn.ok{background:#0e4f43;border-color:#00d8b3;color:#fff}
.demo-gbtn.bad{background:#5c161b;border-color:#f87171;color:#fecaca}
.demo-status-line{font-size:10.5px;color:#9ca3af;text-align:center;flex-shrink:0}
.demo-head-right{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.demo-mini-btn{background:#1f2735;color:#cbd5e1;border:1px solid #475569;border-radius:4px;padding:3px 7px;font-size:11px;font-weight:700;cursor:pointer}
.demo-mini-btn.active,.demo-mini-btn:hover{border-color:#ffc12b;color:#ffc12b}
.demo-grade-tag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;font-size:10.5px;vertical-align:middle}
.demo-grade-tag.ok{background:#0d2d26;border:1px solid #00d8b3;color:#6ee7b7}
.demo-grade-tag.bad{background:#4c1419;border:1px solid #f87171;color:#fecaca}
.demo-score-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.demo-score-banner{font-size:15px;color:#00d8b3;margin:0}
.demo-wrong-pill{background:#4c1419;border:1px solid #f87171;color:#fecaca;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:700}
.demo-wrong-pill.clean{background:#0d2d26;border-color:#00d8b3;color:#6ee7b7}
.demo-warn-btn{background:#7c2d12;border-color:#fb923c;color:#ffedd5}
.demo-warn-btn:hover{background:#9a3412;color:#fff}
.demo-perfect-box{background:#0d2d26;border:1px solid #00d8b3;color:#a7f3d0;padding:10px;border-radius:5px;font-weight:700;font-size:13px}
.demo-wrong-groups{display:flex;flex-direction:column;gap:8px}
.demo-wrong-heading{margin:2px 0 0;font-size:12px;color:#cbd5e1;text-transform:uppercase;letter-spacing:.4px}
.demo-wrong-card{background:#11161f;border:1px solid #334155;border-left:3px solid #f87171;border-radius:5px;padding:8px 10px;display:flex;flex-direction:column;gap:6px}
.demo-wrong-card-head{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px;color:#f3f4f6}
.demo-wrong-card-head span{font-size:11px;color:#9ca3af}
.demo-wrong-card-head b{color:#fca5a5}
.demo-wrong-chips{display:flex;flex-wrap:wrap;gap:4px}
.demo-wrong-chip{background:#3b151a;border:1px solid #f87171;color:#fecaca;border-radius:3px;padding:3px 7px;font-size:11px;font-weight:700;cursor:pointer}
.demo-wrong-chip:hover{background:#7f1d1d;color:#fff}

/* Responsivo denso para tablet y móvil */
@media(max-width:860px){
  .demo-shell{height:calc(100vh - .5rem);min-height:0}
  .demo-topbar{padding:5px 8px;gap:5px}
  .demo-toolbar{flex-wrap:nowrap;overflow-x:auto;max-width:100%;padding-bottom:2px}
  .demo-workspace{grid-template-columns:1fr;grid-template-rows:1fr auto;gap:6px;padding:6px}
  .demo-stage{padding:10px 11px;gap:8px}
  .demo-sidebar{height:auto;padding:6px;gap:5px}
  .demo-grid{grid-template-columns:repeat(10,1fr);max-height:92px}
}
@media(max-width:520px){
  .demo-mbtn{padding:4px 6px;font-size:11px}
  .demo-clock{font-size:12px;padding:3px 6px}
  .demo-grid{grid-template-columns:repeat(8,1fr);max-height:82px}
}
</style>
