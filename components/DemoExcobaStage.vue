<template>
  <div class="stage-body">
    <!-- Instrucciones y enunciado -->
    <div class="demo-instructions">
      <div v-if="item.isOriginal && item.instruccionesHtml" v-latex="item.instruccionesHtml"></div>
      <template v-else>
        <span v-if="item.tipo === 7">Resuelve el problema y escribe el valor numérico exacto en el recuadro.</span>
        <span v-else-if="item.tipo === 4">Lee el planteamiento, haz clic en el espacio subrayado y selecciona la opción correcta.</span>
        <span v-else-if="item.tipo === 5">Selecciona cada tarjeta y haz clic en la categoría correspondiente.</span>
      </template>
    </div>

    <div v-if="item.stimulus" class="demo-stimulus" v-latex="item.stimulus"></div>
    <div v-if="item.isOriginal && item.promptHtml" class="demo-prompt" v-latex="item.promptHtml"></div>
    <div v-else-if="item.question" class="demo-prompt" v-latex="item.question"></div>

    <!-- Figuras vectoriales y gráficas -->
    <DemoExcobaCanvas v-if="item.canvasSpec" :spec="item.canvasSpec" />
    <div v-if="item.figureSvg && ![3, 19, 24].includes(item.tipo)" class="svg-wrap" v-html="item.figureSvg"></div>

    <!-- A. MUESTRA DEMOSTRATIVA (70 reactivos con los 15 formatos nativos) -->
    <template v-if="item.isOriginal">
      <!-- Tipo 4 / 23: espacios desplegables en línea -->
      <div v-if="item.tipo === 4 || item.tipo === 23" class="orig-tokens">
        <div v-if="item.textoRefHtml" class="demo-stimulus" v-latex="item.textoRefHtml"></div>
        <div ref="htmlHost" class="demo-prompt" v-html="renderedTokenHtml" @click="onParrafoTokenClick"></div>
        <div v-if="activeTokenObj" class="demo-token-menu">
          <button v-for="opt in activeTokenObj.options" :key="opt.id" type="button" class="demo-token-opt" :class="{ active: answer?.tokens?.[activeTokenObj.id] === opt.val }" @click="pickOrigToken(activeTokenObj.id, opt.val)">
            <span v-latex="opt.val"></span>
          </button>
        </div>
      </div>

      <!-- Tipo 5: clasificación en categorías -->
      <div v-else-if="item.tipo === 5" class="demo-cat-wrap">
        <div class="demo-cat-pool">
          <button v-for="st in unassignedStatements" :key="st.id" type="button" class="demo-chip" :class="{ active: activeChipId === st.id }" @click="activeChipId = activeChipId === st.id ? null : st.id">
            <span v-latex="st.text"></span>
          </button>
          <span v-if="!unassignedStatements.length" class="demo-pool-empty">Todas las tarjetas clasificadas. Haz clic en una para devolverla.</span>
        </div>
        <div class="demo-cat-grid">
          <div v-for="cat in item.categories" :key="cat.id" class="demo-cat-box" tabindex="0" @click="assignChip(cat.id)" @keydown.enter.prevent="assignChip(cat.id)">
            <h4>{{ cat.title }}</h4>
            <button v-for="st in statementsInCat(cat.id)" :key="st.id" type="button" class="demo-chip placed" @click.stop="unassignChip(st.id)">
              × <span v-latex="st.text"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tipo 6: ordenamiento de oraciones -->
      <div v-else-if="item.tipo === 6" class="order-list">
        <button v-for="s in item.sentences" :key="s.id" type="button" class="order-item" :class="{ picked: seqIndex(s.id) >= 0 }" @click="toggleSeq(s.id)">
          {{ seqIndex(s.id) >= 0 ? `[${seqIndex(s.id) + 1}] ` : '[ ] ' }}<span v-latex="s.text"></span>
        </button>
      </div>

      <!-- Tipo 16 / 18: selección de frases en párrafo -->
      <div v-else-if="item.tipo === 16 || item.tipo === 18" class="phrase-wrap">
        <div class="demo-prompt" v-html="renderedPhraseHtml" @click.prevent="onPhraseClick"></div>
        <div class="picked-info">Seleccionadas: {{ (answer?.picked || []).length }}</div>
      </div>

      <!-- Tipo 3 / 19 / 24: diagrama con regiones interactivas -->
      <div v-else-if="[3, 19, 24].includes(item.tipo)" class="poly-stage">
        <div class="svg-wrap poly-wrap">
          <div v-if="item.figureSvg" v-html="item.figureSvg"></div>
          <svg :viewBox="item.viewBox || '0 0 480 260'" class="poly-svg">
            <polygon v-for="a in item.areas" :key="a.id" :points="formatPoly(a.poly)" class="poly-hit" :class="{ sel: (answer?.picked || []).includes(a.id) }" @click="togglePicked(a.id)">
              <title>{{ a.title }}</title>
            </polygon>
          </svg>
        </div>
        <div class="area-kbd-row">
          <button v-for="a in item.areas" :key="a.id" type="button" class="area-kbd-btn" :class="{ sel: (answer?.picked || []).includes(a.id) }" @click="togglePicked(a.id)">
            {{ a.title }}
          </button>
        </div>
      </div>

      <!-- Tipo 12: tabla desplegable -->
      <div v-else-if="item.tipo === 12" class="rows-wrap">
        <div v-for="r in item.rows" :key="r.key" class="demo-num-box">
          <span style="flex:1" v-latex="r.prompt"></span>
          <select v-if="r.options.length" class="row-sel" :value="answer?.rows?.[r.key] || ''" @change="setRow(r.key, $event.target.value)">
            <option value="">Selecciona…</option>
            <option v-for="o in r.options" :key="o" :value="o">{{ o }}</option>
          </select>
          <input v-else class="demo-num-input" :value="answer?.rows?.[r.key] || ''" @input="setRow(r.key, $event.target.value)">
        </div>
      </div>

      <!-- Tipos numéricos / algebraicos (7, 8, 11, 15, 22) -->
      <div v-else class="rows-wrap">
        <div v-for="(f, idx) in item.fields" :key="f.key" class="demo-num-box">
          <label v-latex="f.label"></label>
          <input :ref="el => { if (idx === 0) primaryInput = el; }" class="demo-num-input" placeholder="Ej. 12.5, 3/4 o 2^3" :value="answer?.fields?.[f.key] || ''" @input="setField(f.key, $event.target.value)" @blur="normalizeField(f.key)" @keydown.enter.prevent="normalizeField(f.key); $emit('check-item')">
          <span v-if="f.unit" class="demo-unit">{{ f.unit }}</span>
        </div>
      </div>
    </template>

    <!-- B. REACTIVOS DEL TEMARIO (2,520 reactivos) -->
    <template v-else>
      <div v-if="item.tipo === 7" class="demo-num-box">
        <label :for="'demo-num-' + item.id">Respuesta:</label>
        <input :ref="el => { primaryInput = el; }" :id="'demo-num-' + item.id" type="text" class="demo-num-input" placeholder="Ej. 42, 3.14, 3/4 o 2^3" :value="answer?.text ?? ''" @input="$emit('answer', { text: $event.target.value })" @blur="normalizeTemarioNum" @keydown.enter.prevent="normalizeTemarioNum(); $emit('check-item')">
        <span v-if="item.unit" class="demo-unit">{{ item.unit }}</span>
      </div>

      <div v-else-if="item.tipo === 4" class="demo-cloze-wrap">
        <p class="demo-cloze-line">
          Respuesta seleccionada:
          <button type="button" class="demo-token-btn" :class="{ filled: Boolean(selectedTemarioOpt) }" @click.stop="tokenMenuOpen = !tokenMenuOpen">
            <span v-if="selectedTemarioOpt" v-latex="selectedTemarioOpt.text"></span>
            <span v-else>__________ (haz clic para elegir)</span>
          </button>
        </p>
        <div v-if="tokenMenuOpen" class="demo-token-menu">
          <button v-for="opt in item.options" :key="opt.id" type="button" class="demo-token-opt" :class="{ active: selectedTemarioOpt?.id === opt.id }" @click="$emit('answer', { optionId: opt.id }); tokenMenuOpen = false">
            <strong>{{ opt.id }})</strong> <span v-latex="opt.text"></span>
          </button>
        </div>
      </div>

      <div v-else-if="item.tipo === 5" class="demo-cat-wrap">
        <div class="demo-cat-pool">
          <button v-for="st in unassignedStatements" :key="st.id" type="button" class="demo-chip" :class="{ active: activeChipId === st.id }" @click="activeChipId = activeChipId === st.id ? null : st.id">
            <span v-latex="st.text"></span>
          </button>
          <span v-if="!unassignedStatements.length" class="demo-pool-empty">Tarjetas clasificadas. Haz clic en una tarjeta para devolverla.</span>
        </div>
        <div class="demo-cat-grid">
          <div v-for="cat in item.categories" :key="cat.id" class="demo-cat-box" tabindex="0" @click="assignChip(cat.id)" @keydown.enter.prevent="assignChip(cat.id)">
            <h4>{{ cat.title }}</h4>
            <button v-for="st in statementsInCat(cat.id)" :key="st.id" type="button" class="demo-chip placed" @click.stop="unassignChip(st.id)">× <span v-latex="st.text"></span></button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
const { loadModule } = window['vue3-sfc-loader'];
const sfcOpts = window.__SFC_OPTIONS__;

export default {
  components: {
    DemoExcobaCanvas: Vue.defineAsyncComponent(() => loadModule('./components/DemoExcobaCanvas.vue', sfcOpts)),
  },
  props: {
    item: { type: Object, required: true },
    answer: { type: Object, default: null },
    keyboardDisabled: { type: Boolean, default: false },
  },
  emits: ['answer', 'check-item'],
  setup(props, { emit }) {
    const tokenMenuOpen = ref(false), openTok = ref(''), activeChipId = ref(null), htmlHost = ref(null), primaryInput = ref(null);
    const renderMathInHost = () => {
      if (htmlHost.value && window.renderMathInElement) {
        window.renderMathInElement(htmlHost.value, {
          delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
          throwOnError: false,
        });
      }
    };
    const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
    const activeTokenObj = computed(() => (props.item.tokens || []).find(t => t.id === openTok.value) || null);
    const renderedTokenHtml = computed(() => {
      const picked = props.answer?.tokens || {};
      return String(props.item.parrafoHtml || '').replace(/<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi, (_, tid) => {
        const tok = (props.item.tokens || []).find(t => t.id === tid);
        const val = picked[tid];
        const cls = ['inline-tok', val ? 'filled' : '', openTok.value === tid ? 'open' : ''].filter(Boolean).join(' ');
        const label = escapeHtml(val || tok?.mostrar || '______');
        return `<a href="${escapeHtml(tid)}" class="${cls}">${label} ▾</a>`;
      });
    });

    const phraseIds = computed(() => {
      const out = [];
      String(props.item.parrafoHtml || '').replace(/<a\b[^>]*href="([^"]+)"[^>]*>/gi, (_, id) => { out.push(id); return _; });
      return out;
    });

    watch(() => props.item.id, () => {
      tokenMenuOpen.value = false;
      openTok.value = '';
      activeChipId.value = null;
      primaryInput.value = null;
      if (document.activeElement?.tagName === 'INPUT') document.activeElement.blur();
    }, { immediate: true });
    watch(() => [props.item.id, renderedTokenHtml.value, htmlHost.value], renderMathInHost, { flush: 'post', immediate: true });

    const selectedTemarioOpt = computed(() => (props.item.options || []).find(o => o.id === props.answer?.optionId) || null);
    const catMap = computed(() => props.answer?.map || {});
    const unassignedStatements = computed(() => (props.item.statements || []).filter(s => !catMap.value[s.id]));
    const statementsInCat = cid => (props.item.statements || []).filter(s => catMap.value[s.id] === cid);

    const assignChip = cid => {
      if (!activeChipId.value) return;
      emit('answer', { map: { ...catMap.value, [activeChipId.value]: cid } });
      activeChipId.value = null;
    };
    const unassignChip = sid => {
      const next = { ...catMap.value }; delete next[sid]; emit('answer', { map: next });
    };
    const pickOrigToken = (tid, val) => {
      emit('answer', { tokens: { ...(props.answer?.tokens || {}), [tid]: val } });
      openTok.value = '';
    };
    const onParrafoTokenClick = ev => {
      const a = ev.target.closest?.('a[href]'); if (!a) return;
      ev.preventDefault();
      const id = a.getAttribute('href');
      openTok.value = openTok.value === id ? '' : id;
    };
    const seqIndex = id => (props.answer?.seq || []).indexOf(id);
    const toggleSeq = id => {
      const cur = Array.isArray(props.answer?.seq) ? props.answer.seq : [];
      emit('answer', { seq: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
    };
    const togglePicked = id => {
      const cur = Array.isArray(props.answer?.picked) ? props.answer.picked : [];
      emit('answer', { picked: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
    };
    const renderedPhraseHtml = computed(() => {
      const picked = new Set(props.answer?.picked || []);
      return String(props.item.parrafoHtml || '').replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>/gi, (m, a, id, b) =>
        picked.has(id) ? `<a${a}href="${id}"${b} class="phrase-sel">` : m
      );
    });
    const onPhraseClick = ev => {
      const a = ev.target.closest?.('a[href]'); if (!a) return;
      togglePicked(a.getAttribute('href'));
    };
    const roundDecimalInput = raw => {
      const s = String(raw ?? '').trim().replace(',', '.');
      if (!/^[+-]?\d+\.\d{3,}$/.test(s)) return raw;
      const n = Number(s);
      return Number.isFinite(n) ? String(Math.round((n + Number.EPSILON) * 100) / 100) : raw;
    };
    const setRow = (k, v) => emit('answer', { rows: { ...(props.answer?.rows || {}), [k]: v } });
    const setField = (k, v) => emit('answer', { fields: { ...(props.answer?.fields || {}), [k]: v } });
    const normalizeField = k => {
      const cur = props.answer?.fields?.[k];
      const next = roundDecimalInput(cur);
      if (next !== cur) setField(k, next);
    };
    const normalizeTemarioNum = () => {
      const cur = props.answer?.text;
      const next = roundDecimalInput(cur);
      if (next !== cur) emit('answer', { text: next });
    };
    const formatPoly = poly => {
      const pts = String(poly || '').split(',').map(Number);
      const out = []; for (let i = 0; i + 1 < pts.length; i += 2) out.push(`${pts[i]},${pts[i + 1]}`);
      return out.join(' ');
    };

    // Atajos de teclado específicos del reactivo activo
    const onKeyDown = ev => {
      if (props.keyboardDisabled || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const tag = ev.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const it = props.item;
      if (!it) return;

      if (ev.key === 'Escape') {
        if (tokenMenuOpen.value || openTok.value) { ev.preventDefault(); tokenMenuOpen.value = false; openTok.value = ''; }
        return;
      }

      // Shift+1 / Shift+2 (o ! / ") asigna la tarjeta activa en Tipo 5
      if (it.tipo === 5 && (ev.shiftKey || ev.key === '!' || ev.key === '@' || ev.key === '"')) {
        const catIdx = (ev.code === 'Digit1' || ev.key === '!') ? 0 : (ev.code === 'Digit2' || ev.key === '@' || ev.key === '"') ? 1 : -1;
        if (catIdx >= 0 && it.categories?.[catIdx]) {
          ev.preventDefault();
          if (!activeChipId.value && unassignedStatements.value.length) activeChipId.value = unassignedStatements.value[0].id;
          assignChip(it.categories[catIdx].id);
          return;
        }
      }

      const num = /^[1-9]$/.test(ev.key) ? Number(ev.key) - 1 : -1;
      const letterIdx = /^[a-dA-D]$/.test(ev.key) ? ev.key.toUpperCase().charCodeAt(0) - 65 : -1;
      const choiceIdx = num >= 0 ? num : letterIdx;

      if (!it.isOriginal && it.tipo === 4) {
        if (ev.key === ' ') { ev.preventDefault(); tokenMenuOpen.value = !tokenMenuOpen.value; return; }
        if (choiceIdx >= 0 && it.options?.[choiceIdx]) {
          ev.preventDefault();
          emit('answer', { optionId: it.options[choiceIdx].id });
          tokenMenuOpen.value = false;
        }
        return;
      }

      if (it.isOriginal && (it.tipo === 4 || it.tipo === 23)) {
        const toks = it.tokens || [];
        if (ev.key === ' ') {
          ev.preventDefault();
          const curIdx = toks.findIndex(t => t.id === openTok.value);
          openTok.value = toks[(curIdx + 1) % Math.max(1, toks.length)]?.id || '';
          return;
        }
        if (choiceIdx >= 0) {
          const target = activeTokenObj.value || toks.find(t => !props.answer?.tokens?.[t.id]) || toks[0];
          if (target?.options?.[choiceIdx]) {
            ev.preventDefault();
            pickOrigToken(target.id, target.options[choiceIdx].val);
          }
        }
        return;
      }

      if (it.tipo === 5 && num >= 0 && unassignedStatements.value[num]) {
        ev.preventDefault();
        const sid = unassignedStatements.value[num].id;
        activeChipId.value = activeChipId.value === sid ? null : sid;
        return;
      }

      if (it.isOriginal && it.tipo === 6 && num >= 0 && it.sentences?.[num]) {
        ev.preventDefault(); toggleSeq(it.sentences[num].id); return;
      }
      if (it.isOriginal && (it.tipo === 16 || it.tipo === 18) && num >= 0 && phraseIds.value[num]) {
        ev.preventDefault(); togglePicked(phraseIds.value[num]); return;
      }
      if (it.isOriginal && [3, 19, 24].includes(it.tipo) && num >= 0 && it.areas?.[num]) {
        ev.preventDefault(); togglePicked(it.areas[num].id); return;
      }

      // Enter enfoca el campo numérico cuando el usuario decide escribir (sin autofocus automático)
      if (ev.key === 'Enter' && primaryInput.value) {
        ev.preventDefault();
        primaryInput.value.focus();
      }
    };

    onMounted(() => window.addEventListener('keydown', onKeyDown));
    onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

    return {
      tokenMenuOpen, openTok, activeChipId, htmlHost, primaryInput, activeTokenObj, renderedTokenHtml, phraseIds,
      selectedTemarioOpt, unassignedStatements, statementsInCat, assignChip, unassignChip, pickOrigToken,
      onParrafoTokenClick, seqIndex, toggleSeq, togglePicked, renderedPhraseHtml, onPhraseClick,
      setRow, setField, normalizeField, normalizeTemarioNum, formatPoly,
    };
  },
};
</script>

<style scoped>
.stage-body{display:flex;flex-direction:column;gap:9px}
.demo-instructions{background:#12161d;border-left:3px solid #2bc1ff;padding:7px 10px;font-size:12.5px;color:#e5e7eb;display:flex;flex-direction:column;gap:3px}
.demo-stimulus{background:#141923;border:1px solid #2d3748;padding:8px 10px;border-radius:4px;font-size:12.5px;line-height:1.45;color:#dbeafe}
.demo-prompt{font-size:14.5px;line-height:1.52;color:#fff}
.demo-prompt :deep(a){color:#2bc1ff;text-decoration:underline;cursor:pointer;padding:1px 5px;border-radius:3px}
.demo-prompt :deep(a.inline-tok){background:#1a2538;border:1px solid #2bc1ff;text-decoration:none;font-weight:700;display:inline-block;margin:0 2px}
.demo-prompt :deep(a.inline-tok.filled){background:#0d2d26;border-color:#00d8b3;color:#00d8b3}
.demo-prompt :deep(a.inline-tok.open){outline:2px solid #ffc12b}
.demo-prompt :deep(a.phrase-sel){background:#00d8b3;color:#000;font-weight:700}
.svg-wrap{position:relative;display:inline-block;max-width:100%;margin:0 auto;border:1px solid #374151;border-radius:5px;overflow:hidden;background:#0a0e14}
.poly-svg{position:absolute;inset:0;width:100%;height:100%}
.poly-hit{fill:rgba(43,193,255,.12);stroke:#2bc1ff;stroke-width:2;cursor:pointer}
.poly-hit:hover{fill:rgba(43,193,255,.28)}
.poly-hit.sel{fill:rgba(0,216,179,.42);stroke:#00d8b3;stroke-width:3}
.area-kbd-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.area-kbd-btn{background:#1d2330;color:#e5e7eb;border:1px solid #4b5563;border-radius:4px;padding:5px 9px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.area-kbd-btn.sel{background:#0d2d26;border-color:#00d8b3;color:#a7f3d0;font-weight:700}
.key-pill{background:#1f2937;color:#ffc12b;border:1px solid #475569;border-radius:3px;padding:1px 5px;font-family:monospace;font-size:10px;font-weight:700;margin-right:4px}
.key-pill.dark{background:#072430;color:#7dd3fc;border-color:#0e7490}
.demo-num-box{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#141821;padding:12px;border-radius:5px;border:1px solid #334155}
.demo-num-input{background:#2a2a2a;color:#fff;border:2px solid #2bc1ff;border-radius:4px;padding:8px 12px;font-size:15px;width:210px}
.demo-num-input:focus{outline:none;border-color:#00d8b3}
.demo-format-hint{background:#101520;border:1px solid #263142;border-left:3px solid #ffc12b;border-radius:4px;padding:7px 10px;font-size:11.5px;line-height:1.5;color:#cbd5e1}
.demo-format-hint strong{color:#ffc12b}
.demo-format-hint code{background:#1e2636;color:#7dd3fc;padding:1px 4px;border-radius:3px;font-family:monospace}
.demo-unit,.picked-info{color:#9ca3af;font-size:12px}
.row-sel{background:#222834;color:#fff;border:1px solid #2bc1ff;border-radius:4px;padding:6px 10px;font-size:13px}
.demo-cloze-line{font-size:14px;color:#e5e7eb;line-height:1.8}
.demo-token-btn{background:#1e293b;color:#2bc1ff;border:1px solid #2bc1ff;border-radius:4px;padding:4px 10px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:underline}
.demo-token-btn.filled{color:#00d8b3;border-color:#00d8b3;background:#0c2b25}
.demo-token-menu{margin-top:6px;background:#2f343d;border:2px solid #2bc1ff;border-radius:6px;padding:6px;display:flex;flex-direction:column;gap:4px;max-width:560px}
.demo-token-opt{text-align:left;background:transparent;color:#fff;border:0;padding:8px 10px;border-radius:4px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px}
.demo-token-opt:hover,.demo-token-opt.active{background:#2bc1ff;color:#000;font-weight:700}
.rows-wrap,.order-list{display:flex;flex-direction:column;gap:8px}
.order-item{background:#222630;border:1px solid #4b5563;color:#fff;padding:8px 10px;border-radius:4px;text-align:left;cursor:pointer;font-size:13px}
.order-item.picked{border-color:#00d8b3;background:#0d2d26}
.demo-cat-pool{display:flex;flex-wrap:wrap;gap:8px;padding:10px;background:#11161f;border:1px dashed #4b5563;border-radius:5px;min-height:50px}
.demo-pool-empty{font-size:12px;color:#9ca3af}
.demo-chip{background:#2bc1ff;color:#072430;border:0;border-radius:4px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left;display:inline-flex;align-items:center;gap:4px}
.demo-chip.active{background:#00d8b3;outline:2px solid #fff}
.demo-chip.placed{display:block;width:100%;margin-bottom:6px;background:#00d8b3;color:#03221c}
.demo-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.demo-cat-box{background:#232833;border:1px solid #4b5563;border-radius:5px;padding:10px;min-height:120px;cursor:pointer}
.demo-cat-box:focus{outline:2px solid #ffc12b}
.demo-cat-box h4{margin:0 0 8px;color:#2bc1ff;font-size:13px;text-align:center;border-bottom:1px solid #3b4252;padding-bottom:6px}
@media(max-width:720px){.demo-cat-grid{grid-template-columns:1fr}}
</style>
