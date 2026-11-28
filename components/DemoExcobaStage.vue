<template>
  <div class="stage-body">
    <!-- Instrucciones y enunciado -->
    <div class="demo-instructions">
      <div v-if="item.isOriginal && item.instruccionesHtml" v-latex="item.instruccionesHtml"></div>
      <template v-else>
        <span v-if="item.tipo === 7">Resuelve el problema y escribe el valor numérico exacto en el recuadro.</span>
        <span v-else-if="item.tipo === 4">Lee el planteamiento, haz clic en el espacio subrayado y selecciona la opción correcta.</span>
        <span v-else-if="item.tipo === 5">Selecciona cada tarjeta y haz clic en la categoría correspondiente.</span>
        <small class="demo-topic-caption">{{ item.topicTitle }}</small>
      </template>
    </div>

    <div v-if="item.stimulus" class="demo-stimulus" v-latex="item.stimulus"></div>
    <div v-if="item.isOriginal && item.promptHtml" class="demo-prompt" v-latex="item.promptHtml"></div>
    <div v-else-if="item.question" class="demo-prompt" v-latex="item.question"></div>

    <!-- Figuras vectoriales SVG y graficas HTML5 Canvas (cero imagenes externas) -->
    <DemoExcobaCanvas v-if="item.canvasSpec" :spec="item.canvasSpec" />
    <div v-if="item.figureSvg && ![3, 19, 24].includes(item.tipo)" class="svg-wrap" v-html="item.figureSvg"></div>

    <!-- A. MUESTRA INTERACTIVA EXCOBA (70 reactivos: 15 tipos, SVG/Canvas/LaTeX) -->
    <template v-if="item.isOriginal">
      <!-- Tipo 4 / 23: espacios desplegables en línea dentro del enunciado -->
      <div v-if="item.tipo === 4 || item.tipo === 23" class="orig-tokens">
        <div v-if="item.textoRefHtml" class="demo-stimulus" v-latex="item.textoRefHtml"></div>
        <div ref="htmlHost" class="demo-prompt" v-html="renderedTokenHtml" @click="onParrafoTokenClick"></div>
        <div v-if="activeTokenObj" class="demo-token-menu">
          <button v-for="opt in activeTokenObj.options" :key="opt.id" type="button" class="demo-token-opt" :class="{ active: answer?.tokens?.[activeTokenObj.id] === opt.val }" @click="pickOrigToken(activeTokenObj.id, opt.val)">
            <span v-latex="opt.val"></span>
          </button>
        </div>
      </div>

      <!-- Tipo 5: clasificacion en categorias (con soporte LaTeX) -->
      <div v-else-if="item.tipo === 5" class="demo-cat-wrap">
        <div class="demo-cat-pool">
          <button v-for="st in unassignedStatements" :key="st.id" type="button" class="demo-chip" :class="{ active: activeChipId === st.id }" @click="activeChipId = activeChipId === st.id ? null : st.id">
            <span v-latex="st.text"></span>
          </button>
          <span v-if="!unassignedStatements.length" class="demo-pool-empty">Todas las tarjetas clasificadas. Haz clic en una para devolverla.</span>
        </div>
        <div class="demo-cat-grid">
          <div v-for="cat in item.categories" :key="cat.id" class="demo-cat-box" @click="assignChip(cat.id)">
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

      <!-- Tipo 16 / 18: seleccion de frases en parrafo -->
      <div v-else-if="item.tipo === 16 || item.tipo === 18" class="phrase-wrap">
        <div class="demo-prompt" v-html="renderedPhraseHtml" @click.prevent="onPhraseClick"></div>
        <div class="picked-info">Seleccionadas: {{ (answer?.picked || []).length }}</div>
      </div>

      <!-- Tipo 3 / 19 / 24: diagrama SVG con poligonos interactivos -->
      <div v-else-if="[3, 19, 24].includes(item.tipo)" class="poly-stage">
        <div class="svg-wrap poly-wrap">
          <div v-if="item.figureSvg" v-html="item.figureSvg"></div>
          <svg :viewBox="item.viewBox || '0 0 480 260'" class="poly-svg">
            <polygon v-for="a in item.areas" :key="a.id" :points="formatPoly(a.poly)" class="poly-hit" :class="{ sel: (answer?.picked || []).includes(a.id) }" @click="togglePicked(a.id)">
              <title>{{ a.title }}</title>
            </polygon>
          </svg>
        </div>
        <div class="picked-info">
          Regiones seleccionadas: {{ (answer?.picked || []).length }}
          <span v-if="(answer?.picked || []).length"> ({{ pickedAreaLabels }})</span>
        </div>
      </div>

      <!-- Tipo 12: tabla desplegable / inputs -->
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

      <!-- Tipos numericos / algebraicos (7, 8, 11, 15, 22) -->
      <div v-else class="rows-wrap">
        <div v-for="f in item.fields" :key="f.key" class="demo-num-box">
          <label v-latex="f.label"></label>
          <input class="demo-num-input" placeholder="Escribe tu respuesta" :value="answer?.fields?.[f.key] || ''" @input="setField(f.key, $event.target.value)">
          <span v-if="f.unit" class="demo-unit">{{ f.unit }}</span>
        </div>
      </div>
    </template>

    <!-- B. REACTIVOS DEL TEMARIO (20 x 126 = 2,520, estilo DemoExcoba + LaTeX) -->
    <template v-else>
      <div v-if="item.tipo === 7" class="demo-num-box">
        <label :for="'demo-num-' + item.id">Respuesta:</label>
        <input :id="'demo-num-' + item.id" type="text" class="demo-num-input" placeholder="Ej. 42, 3.5 o 1/4" :value="answer?.text ?? ''" @input="$emit('answer', { text: $event.target.value })">
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
          <button v-for="st in unassignedStatements" :key="st.id" type="button" class="demo-chip" :class="{ active: activeChipId === st.id }" @click="activeChipId = activeChipId === st.id ? null : st.id"><span v-latex="st.text"></span></button>
          <span v-if="!unassignedStatements.length" class="demo-pool-empty">Tarjetas clasificadas. Haz clic en una tarjeta para devolverla.</span>
        </div>
        <div class="demo-cat-grid">
          <div v-for="cat in item.categories" :key="cat.id" class="demo-cat-box" @click="assignChip(cat.id)">
            <h4>{{ cat.title }}</h4>
            <button v-for="st in statementsInCat(cat.id)" :key="st.id" type="button" class="demo-chip placed" @click.stop="unassignChip(st.id)">× <span v-latex="st.text"></span></button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const { ref, computed, watch } = Vue;
const { loadModule } = window['vue3-sfc-loader'];
const sfcOpts = window.__SFC_OPTIONS__;

export default {
  components: {
    DemoExcobaCanvas: Vue.defineAsyncComponent(() => loadModule('./components/DemoExcobaCanvas.vue', sfcOpts)),
  },
  props: { item: { type: Object, required: true }, answer: { type: Object, default: null } },
  emits: ['answer'],
  setup(props, { emit }) {
    const tokenMenuOpen = ref(false), openTok = ref(''), activeChipId = ref(null), htmlHost = ref(null);
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

    watch(() => props.item.id, () => { tokenMenuOpen.value = false; openTok.value = ''; activeChipId.value = null; }, { immediate: true });
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
    const pickedAreaLabels = computed(() => {
      const ids = props.answer?.picked || [];
      return ids.map(id => (props.item.areas || []).find(a => a.id === id)?.title || id).join(', ');
    });
    const onPhraseClick = ev => {
      const a = ev.target.closest?.('a[href]'); if (!a) return;
      togglePicked(a.getAttribute('href'));
    };
    const setRow = (k, v) => emit('answer', { rows: { ...(props.answer?.rows || {}), [k]: v } });
    const setField = (k, v) => emit('answer', { fields: { ...(props.answer?.fields || {}), [k]: v } });
    const formatPoly = poly => {
      const pts = String(poly || '').split(',').map(Number);
      const out = []; for (let i = 0; i + 1 < pts.length; i += 2) out.push(`${pts[i]},${pts[i + 1]}`);
      return out.join(' ');
    };

    return {
      tokenMenuOpen, openTok, activeChipId, htmlHost, activeTokenObj, renderedTokenHtml, selectedTemarioOpt, unassignedStatements,
      statementsInCat, assignChip, unassignChip, pickOrigToken, onParrafoTokenClick,
      seqIndex, toggleSeq, togglePicked, renderedPhraseHtml, pickedAreaLabels, onPhraseClick, setRow, setField, formatPoly,
    };
  },
};
</script>

<style scoped>
.stage-body{display:flex;flex-direction:column;gap:12px}
.demo-instructions{background:#12161d;border-left:3px solid #2bc1ff;padding:10px 12px;font-size:13px;color:#e5e7eb;display:flex;flex-direction:column;gap:4px}
.demo-topic-caption{color:#9ca3af;font-size:11px}
.demo-stimulus{background:#141923;border:1px solid #2d3748;padding:10px 12px;border-radius:4px;font-size:13px;line-height:1.5;color:#dbeafe}
.demo-prompt{font-size:15px;line-height:1.6;color:#fff}
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
.demo-num-box{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#141821;padding:12px;border-radius:5px;border:1px solid #334155}
.demo-num-input{background:#2a2a2a;color:#fff;border:2px solid #2bc1ff;border-radius:4px;padding:8px 12px;font-size:15px;width:210px}
.demo-num-input:focus{outline:none;border-color:#00d8b3}
.demo-unit,.picked-info{color:#9ca3af;font-size:12px}
.row-sel{background:#222834;color:#fff;border:1px solid #2bc1ff;border-radius:4px;padding:6px 10px;font-size:13px}
.demo-cloze-line{font-size:14px;color:#e5e7eb;line-height:1.8}
.demo-token-btn{background:#1e293b;color:#2bc1ff;border:1px solid #2bc1ff;border-radius:4px;padding:4px 10px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:underline}
.demo-token-btn.filled{color:#00d8b3;border-color:#00d8b3;background:#0c2b25}
.demo-token-menu{margin-top:6px;background:#2f343d;border:2px solid #2bc1ff;border-radius:6px;padding:6px;display:flex;flex-direction:column;gap:4px;max-width:520px}
.demo-token-opt{text-align:left;background:transparent;color:#fff;border:0;padding:8px 10px;border-radius:4px;cursor:pointer;font-size:13px}
.demo-token-opt:hover,.demo-token-opt.active{background:#2bc1ff;color:#000;font-weight:700}
.token-pills,.rows-wrap,.order-list{display:flex;flex-direction:column;gap:8px}
.order-item{background:#222630;border:1px solid #4b5563;color:#fff;padding:8px 10px;border-radius:4px;text-align:left;cursor:pointer;font-size:13px}
.order-item.picked{border-color:#00d8b3;background:#0d2d26}
.demo-cat-pool{display:flex;flex-wrap:wrap;gap:8px;padding:10px;background:#11161f;border:1px dashed #4b5563;border-radius:5px;min-height:50px}
.demo-pool-empty{font-size:12px;color:#9ca3af}
.demo-chip{background:#2bc1ff;color:#072430;border:0;border-radius:4px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left}
.demo-chip.active{background:#00d8b3;outline:2px solid #fff}
.demo-chip.placed{display:block;width:100%;margin-bottom:6px;background:#00d8b3;color:#03221c}
.demo-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.demo-cat-box{background:#232833;border:1px solid #4b5563;border-radius:5px;padding:10px;min-height:120px;cursor:pointer}
.demo-cat-box h4{margin:0 0 8px;color:#2bc1ff;font-size:13px;text-align:center;border-bottom:1px solid #3b4252;padding-bottom:6px}
@media(max-width:720px){.demo-cat-grid{grid-template-columns:1fr}}
</style>
