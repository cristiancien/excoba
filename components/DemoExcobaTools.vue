<template>
  <!-- Calculadora científica flotante arrastrable con soporte de teclado físico -->
  <aside v-if="calcOpen" class="ex-calc-win" :style="calcStyle" role="dialog" aria-label="Calculadora EXCOBA">
    <div class="ex-win-bar ex-drag-handle" @pointerdown="startDrag">
      <span>Calculadora científica</span>
      <div class="ex-win-right">
        <span v-if="calcMem !== 0" class="ex-mem-tag">M</span>
        <button type="button" class="ex-win-x" @pointerdown.stop @click="$emit('close-calc')" title="Cerrar (Esc)">×</button>
      </div>
    </div>
    <div class="ex-calc-body">
      <div class="ex-calc-hist">{{ calcHist || '\u00a0' }}</div>
      <div class="ex-calc-lcd">{{ calcDisp }}</div>
      <div class="ex-calc-memrow">
        <button v-for="m in ['MC','MR','M+','M-','⌫','C']" :key="m" type="button" class="ex-ck ex-ck-fn" @click="press(m)">{{ m }}</button>
      </div>
      <div class="ex-calc-sci">
        <button v-for="s in ['sin','cos','tan','log','ln','√','x²','1/x','π','±']" :key="s" type="button" class="ex-ck ex-ck-sci" @click="press(s)">{{ s }}</button>
      </div>
      <div class="ex-calc-pad">
        <button v-for="k in ['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','%','+']" :key="k" type="button" class="ex-ck" :class="{ 'ex-ck-op': '÷×−+%'.includes(k) }" @click="press(k)">{{ k }}</button>
        <button type="button" class="ex-ck ex-ck-op" @click="press('(')">(</button>
        <button type="button" class="ex-ck ex-ck-op" @click="press(')')">)</button>
        <button type="button" class="ex-ck ex-ck-eq" @click="press('=')">=</button>
      </div>
      <div class="ex-calc-foot">Modo grados (DEG)</div>
    </div>
  </aside>

  <!-- Formulario oficial flotante y arrastrable (no bloquea el reactivo) -->
  <aside v-if="formOpen" class="ex-form-win" :style="formStyle" role="dialog" aria-label="Formulario oficial">
    <div class="ex-win-bar ex-drag-handle" @pointerdown="startFormDrag">
      <span>Formulario oficial</span>
      <button type="button" class="ex-win-x" @pointerdown.stop @click="$emit('close-form')" title="Cerrar">×</button>
    </div>
    <div class="ex-form-win-body">
      <div class="ex-form-bar">
        <div class="ex-tabs">
          <button v-for="t in formTabs" :key="t.id" type="button" class="ex-tab" :class="{ active: formTab === t.id }" @click="formTab = t.id">
            {{ t.label }}
          </button>
        </div>
        <input
          v-model="formQuery"
          type="search"
          class="ex-form-search"
          placeholder="Buscar fórmula (ej. Pitágoras, Ohm, pH, vértice)..."
          aria-label="Buscar en el formulario"
        />
      </div>

      <div v-if="!filteredFormulas.length" class="ex-empty">
        No se encontraron fórmulas para «{{ formQuery }}». Prueba con otro término o limpia el buscador.
      </div>

      <div v-else class="ex-form-grid">
        <div v-for="card in filteredFormulas" :key="card.title" class="ex-form-card">
          <h4>{{ card.title }}</h4>
          <div v-for="(line, i) in card.lines" :key="i" class="ex-form-line" v-latex="line"></div>
          <div v-if="card.vars" class="ex-form-vars" v-latex="card.vars"></div>
          <div v-if="card.tip" class="ex-form-tip"><strong>Uso:</strong> <span v-latex="card.tip"></span></div>
          <div v-if="card.example" class="ex-form-ex" v-latex="card.example"></div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Ventanas de referencia institucional estilo EXCOBA (Cómo responder / Guía) -->
  <div v-if="modal" class="ex-modal-bg" @click.self="$emit('close-modal')">
    <div class="ex-modal" :class="{ 'ex-modal-wide': modal === 'help' }">
      <header class="ex-modal-head">
        <h3>{{ modalTitle }}</h3>
        <button type="button" class="ex-win-x" @click="$emit('close-modal')" aria-label="Cerrar">×</button>
      </header>

      <div class="ex-modal-body">
        <!-- 1. CÓMO RESPONDER -->
        <template v-if="modal === 'help'">
          <p class="ex-lead">Cada reactivo indica la acción requerida en la parte superior. Estos son los formatos de respuesta del examen:</p>
          <div class="ex-help-grid">
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-mini-tok">selecciona ▾</span></div>
              <h4>Espacios desplegables</h4>
              <p>Haz clic en el espacio subrayado dentro del enunciado para abrir la lista y elegir la opción correcta.</p>
            </div>
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-mini-chip">Tarjeta</span> → <span class="ex-mini-box">Categoría</span></div>
              <h4>Clasificación en recuadros</h4>
              <p>Selecciona una tarjeta azul y haz clic en el recuadro correspondiente. Para devolverla, haz clic sobre ella.</p>
            </div>
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-mini-inp">x^2</span> <span class="ex-mini-inp">3/4</span> <span class="ex-mini-inp">3.14</span></div>
              <h4>Captura numérica y algebraica</h4>
              <p>Potencias con <code>^</code> (ej. <code>x^2</code>, <code>2^3</code>, <code>10^-3</code>), fracciones con <code>/</code> (<code>3/4</code>), raíces con <code>sqrt(x)</code> y decimales con punto (redondeo automático a 2 decimales, ej. <code>3.1416 → 3.14</code>).</p>
            </div>
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-mini-hl">frase clave</span> · <span class="ex-mini-reg">zona</span></div>
              <h4>Selección en texto o figura</h4>
              <p>Haz clic directamente sobre las frases subrayadas del párrafo o sobre las regiones señaladas del diagrama.</p>
            </div>
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-mini-ord">[1] Paso A</span> <span class="ex-mini-ord">[2] Paso B</span></div>
              <h4>Ordenamiento y tablas</h4>
              <p>Haz clic en las oraciones en el orden correcto o elige una respuesta en cada fila de la tabla.</p>
            </div>
            <div class="ex-help-card">
              <div class="ex-help-demo"><span class="ex-dot cur">1</span> <span class="ex-dot ans">2</span> <span class="ex-dot">3</span></div>
              <h4>Panel de navegación</h4>
              <p>Dorado indica el reactivo actual; verde indica contestado y gris indica pendiente por responder.</p>
            </div>
          </div>
        </template>

        <!-- 2. GUÍA DEL SUSTENTANTE -->
        <template v-else-if="modal === 'guide'">
          <div class="ex-guide-block">
            <h4>Estructura del examen y materias</h4>
            <p>Usa la barra superior para presentar el <strong>Examen Demostrativo aleatorio de 180 preguntas</strong> (20 reactivos aleatorios de cada una de las 9 materias siguiendo estrictamente el orden del temario) o recorrer los <strong>2,520 reactivos</strong> agrupados por materia (<strong>Español</strong>, <strong>Matemáticas</strong>, <strong>Ciencias Naturales</strong>, <strong>Ciencias Sociales</strong>, <strong>Física</strong> y <strong>Lenguaje</strong>).</p>
          </div>
          <div class="ex-guide-block">
            <h4>Navegación y guardado</h4>
            <ul>
              <li>Avanza o retrocede libremente entre reactivos, o salta a un número específico con <strong>Ir al reactivo #</strong>.</li>
              <li>Puedes dejar cualquier reactivo pendiente y volver a él antes de finalizar.</li>
              <li>El reloj superior registra el tiempo transcurrido en el bloque actual.</li>
            </ul>
          </div>
          <div class="ex-guide-block">
            <h4>Herramientas de apoyo</h4>
            <ul>
              <li><strong>Formulario:</strong> flotante y arrastrable, con buscador, significado de cada variable, cuándo aplicar cada ecuación y un ejemplo resuelto.</li>
              <li><strong>Calculadora:</strong> flotante y arrastrable para realizar operaciones sin perder de vista el planteamiento.</li>
              <li><strong>Finalizar:</strong> muestra el desglose de aciertos por asignatura o tema y permite revisar cada respuesta.</li>
            </ul>
          </div>
        </template>
      </div>

      <footer class="ex-modal-foot">
        <button type="button" class="ex-close-btn" @click="$emit('close-modal')">Aceptar</button>
      </footer>
    </div>
  </div>
</template>

<script>
const { ref, computed, onMounted, onUnmounted } = Vue;

function evalMathExpr(raw) {
  const s = String(raw || '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, String(Math.PI)).trim();
  if (!s || /[^0-9+\-*/().eE\s]/.test(s)) return null;
  const tokens = s.match(/(\d+(?:\.\d+)?(?:e[+-]?\d+)?|[+\-*/()])/gi);
  if (!tokens) return null;
  let idx = 0;
  const parseExpr = () => {
    let val = parseTerm();
    while (tokens[idx] === '+' || tokens[idx] === '-') {
      const op = tokens[idx++];
      val = op === '+' ? val + parseTerm() : val - parseTerm();
    }
    return val;
  };
  const parseTerm = () => {
    let val = parseUnary();
    while (tokens[idx] === '*' || tokens[idx] === '/') {
      const op = tokens[idx++];
      val = op === '*' ? val * parseUnary() : val / parseUnary();
    }
    return val;
  };
  const parseUnary = () => {
    if (tokens[idx] === '-') { idx++; return -parseUnary(); }
    if (tokens[idx] === '+') { idx++; return parseUnary(); }
    if (tokens[idx] === '(') { idx++; const v = parseExpr(); if (tokens[idx] === ')') idx++; return v; }
    return Number(tokens[idx++]);
  };
  const res = parseExpr();
  return idx === tokens.length && Number.isFinite(res) ? Math.round(res * 1e10) / 1e10 : null;
}

export default {
  props: {
    modal: { type: String, default: '' },
    calcOpen: { type: Boolean, default: false },
    formOpen: { type: Boolean, default: false },
  },
  emits: ['close-modal', 'close-calc', 'close-form'],
  setup(props, { emit }) {
    const catalog = window.EXCOBA_FORMULAS || { tabs: [], sections: {} };
    const formTab = ref(catalog.tabs[0]?.id || 'mat');
    const formQuery = ref('');
    const formTabs = catalog.tabs;

    const filteredFormulas = computed(() => {
      const q = formQuery.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!q) return catalog.sections[formTab.value] || [];
      const allCards = Object.values(catalog.sections).flat();
      return allCards.filter(c => {
        const hay = `${c.title} ${c.tags || ''} ${c.vars || ''} ${c.tip || ''} ${(c.lines || []).join(' ')}`
          .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return hay.includes(q);
      });
    });

    const modalTitle = computed(() => ({
      help: 'Cómo responder el examen',
      guide: 'Guía del sustentante',
    }[props.modal] || ''));

    // Helper DRY para arrastrar ventanas flotantes (Calculadora y Formulario)
    const makeDraggable = () => {
      const pos = ref({ x: 0, y: 0 });
      const style = computed(() => (pos.value.x || pos.value.y) ? { transform: `translate(${pos.value.x}px, ${pos.value.y}px)` } : {});
      let drag = null;
      const move = ev => {
        if (!drag) return;
        pos.value = { x: drag.ox + (ev.clientX - drag.sx), y: drag.oy + (ev.clientY - drag.sy) };
      };
      const end = () => {
        drag = null;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      };
      const start = ev => {
        drag = { sx: ev.clientX, sy: ev.clientY, ox: pos.value.x, oy: pos.value.y };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
      };
      return { style, start, end };
    };
    const calcDrag = makeDraggable();
    const formDrag = makeDraggable();

    const calcExpr = ref('');
    const calcHist = ref('');
    const calcMem = ref(0);
    const calcDisp = computed(() => calcExpr.value || '0');
    const currentVal = () => { const v = evalMathExpr(calcExpr.value); return v === null ? 0 : v; };
    const fmt = v => (Number.isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'Error');

    const press = k => {
      if (k === 'C') { calcExpr.value = ''; calcHist.value = ''; return; }
      if (k === '⌫') { calcExpr.value = calcExpr.value.slice(0, -1); return; }
      if (k === 'MC') { calcMem.value = 0; return; }
      if (k === 'MR') { calcExpr.value = fmt(calcMem.value); return; }
      if (k === 'M+') { calcMem.value += currentVal(); return; }
      if (k === 'M-') { calcMem.value -= currentVal(); return; }
      if (k === '=') {
        const res = evalMathExpr(calcExpr.value);
        calcHist.value = calcExpr.value ? `${calcExpr.value} =` : '';
        calcExpr.value = res === null ? 'Error' : fmt(res);
        return;
      }
      if (['sin','cos','tan','log','ln','√','x²','1/x','%','±'].includes(k)) {
        const v = currentVal();
        calcHist.value = `${k}(${v})`;
        const r = {
          sin: Math.sin(v * Math.PI / 180), cos: Math.cos(v * Math.PI / 180), tan: Math.tan(v * Math.PI / 180),
          log: v > 0 ? Math.log10(v) : NaN, ln: v > 0 ? Math.log(v) : NaN,
          '√': v >= 0 ? Math.sqrt(v) : NaN, 'x²': v * v, '1/x': v !== 0 ? 1 / v : NaN,
          '%': v / 100, '±': -v,
        }[k];
        calcExpr.value = fmt(r);
        return;
      }
      if (calcExpr.value === 'Error') calcExpr.value = '';
      calcExpr.value += k;
    };

    const onKeyDown = ev => {
      if (ev.key === 'Escape') {
        if (props.modal) { ev.preventDefault(); emit('close-modal'); }
        else if (props.formOpen) { ev.preventDefault(); emit('close-form'); }
        else if (props.calcOpen) { ev.preventDefault(); emit('close-calc'); }
        return;
      }
      if (!props.calcOpen || props.modal) return;
      const tag = ev.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (/^[0-9.()]$/.test(ev.key)) { ev.preventDefault(); press(ev.key); }
      else if (ev.key === '+') { ev.preventDefault(); press('+'); }
      else if (ev.key === '-') { ev.preventDefault(); press('−'); }
      else if (ev.key === '*') { ev.preventDefault(); press('×'); }
      else if (ev.key === '/') { ev.preventDefault(); press('÷'); }
      else if (ev.key === 'Enter' || ev.key === '=') { ev.preventDefault(); press('='); }
      else if (ev.key === 'Backspace') { ev.preventDefault(); press('⌫'); }
      else if (ev.key === 'Delete') { ev.preventDefault(); press('C'); }
    };

    onMounted(() => window.addEventListener('keydown', onKeyDown));
    onUnmounted(() => { calcDrag.end(); formDrag.end(); window.removeEventListener('keydown', onKeyDown); });

    return {
      formTab, formTabs, formQuery, filteredFormulas, modalTitle, calcHist, calcDisp, calcMem,
      calcStyle: calcDrag.style, startDrag: calcDrag.start,
      formStyle: formDrag.style, startFormDrag: formDrag.start, press,
    };
  },
};
</script>

<style scoped>
.ex-calc-win{position:fixed;right:22px;bottom:22px;width:296px;background:#161b24;border:2px solid #ffc12b;border-radius:8px;box-shadow:0 18px 42px rgba(0,0,0,.65);z-index:960;overflow:hidden;font-family:Arial,Helvetica,sans-serif}
.ex-form-win{position:fixed;left:24px;top:64px;width:min(760px,calc(100vw - 48px));max-height:calc(100vh - 96px);background:#141922;border:2px solid #ffc12b;border-radius:8px;box-shadow:0 22px 54px rgba(0,0,0,.72);z-index:950;display:flex;flex-direction:column;overflow:hidden;color:#f3f4f6;font-family:Arial,Helvetica,sans-serif}
.ex-form-win-body{padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;font-size:13px;line-height:1.5}
.ex-win-bar{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,#2c3340,#1c212b);padding:8px 10px;border-bottom:1px solid #374151;color:#ffc12b;font-size:12px;font-weight:700}
.ex-drag-handle{cursor:move;user-select:none;touch-action:none}
.ex-win-right{display:flex;align-items:center;gap:6px}
.ex-mem-tag{background:#00d8b3;color:#052e27;font-size:10px;font-weight:800;padding:1px 5px;border-radius:3px}
.ex-win-x{background:transparent;border:0;color:#cbd5e1;font-size:18px;line-height:1;cursor:pointer;padding:0 4px}
.ex-win-x:hover{color:#fff}
.ex-calc-body{padding:10px;display:flex;flex-direction:column;gap:6px}
.ex-calc-hist{font-family:monospace;font-size:11px;color:#9ca3af;text-align:right;min-height:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ex-calc-lcd{background:#05080d;border:1px solid #334155;border-radius:4px;color:#00d8b3;font-family:monospace;font-size:21px;font-weight:700;padding:7px 10px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ex-calc-memrow{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
.ex-calc-sci{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
.ex-calc-pad{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.ex-ck{background:#252c38;color:#f3f4f6;border:1px solid #3f4858;border-radius:4px;padding:7px 0;font-size:13px;font-weight:700;cursor:pointer}
.ex-ck:hover{border-color:#2bc1ff;color:#2bc1ff;background:#2f3848}
.ex-ck-fn{font-size:11px;padding:5px 0;background:#1e2430;color:#cbd5e1}
.ex-ck-sci{font-size:11px;padding:5px 0;background:#1b2838;color:#7dd3fc;border-color:#2b425c}
.ex-ck-op{background:#2b3344;color:#ffc12b}
.ex-ck-eq{grid-column:span 2;background:#0b5c7a;border-color:#2bc1ff;color:#fff}
.ex-ck-eq:hover{background:#0e7490;color:#fff}
.ex-calc-foot{font-size:10px;color:#9ca3af;text-align:center;margin-top:2px}
.ex-modal-bg{position:fixed;inset:0;background:rgba(4,7,12,.76);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
.ex-modal{background:#141922;border:2px solid #ffc12b;border-radius:8px;max-width:640px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.7);color:#f3f4f6;font-family:Arial,Helvetica,sans-serif}
.ex-modal-wide{max-width:860px}
.ex-modal-head{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,#2a313e,#1b2029);padding:12px 16px;border-bottom:1px solid #374151}
.ex-modal-head h3{margin:0;color:#ffc12b;font-size:15px;font-weight:700}
.ex-modal-body{padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;font-size:13px;line-height:1.55}
.ex-lead{margin:0;color:#cbd5e1}
.ex-help-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.ex-help-card{background:#0d1118;border:1px solid #2b3342;border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:6px}
.ex-help-card h4,.ex-kbd-sheet h4{margin:0;color:#ffc12b;font-size:13px}
.ex-help-card p{margin:0;color:#d1d5db;font-size:12px}
.ex-help-demo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-height:28px;margin-bottom:2px}
.ex-mini-tok{background:#1e293b;color:#2bc1ff;border:1px solid #2bc1ff;border-radius:3px;padding:2px 7px;font-size:11px;font-weight:700}
.ex-mini-chip{background:#2bc1ff;color:#05222d;border-radius:3px;padding:2px 7px;font-size:11px;font-weight:700}
.ex-mini-box{background:#232833;border:1px solid #4b5563;color:#cbd5e1;border-radius:3px;padding:2px 7px;font-size:11px}
.ex-mini-inp{background:#2a2a2a;border:1.5px solid #2bc1ff;color:#fff;border-radius:3px;padding:2px 8px;font-size:11px;font-family:monospace}
.ex-mini-u{color:#9ca3af;font-size:11px}
.ex-mini-hl{background:#00d8b3;color:#04241e;border-radius:3px;padding:2px 6px;font-size:11px;font-weight:700}
.ex-mini-reg{background:rgba(43,193,255,.22);border:1.5px solid #2bc1ff;color:#e0f2fe;border-radius:3px;padding:2px 6px;font-size:11px}
.ex-mini-ord{background:#0d2d26;border:1px solid #00d8b3;color:#d1fae5;border-radius:3px;padding:2px 6px;font-size:11px}
.ex-dot{display:inline-flex;align-items:center;justify-content:center;width:22px;height:20px;border-radius:3px;background:#2a303c;border:1px solid #4b5563;font-size:11px;font-weight:700;color:#d1d5db}
.ex-dot.cur{border-color:#ffc12b;color:#ffc12b}
.ex-dot.ans{background:#0e4f43;border-color:#00d8b3;color:#fff}
.ex-kbd-sheet{background:#0d1118;border:1px solid #2b3342;border-left:3px solid #ffc12b;border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:8px}
.ex-kbd-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 14px;font-size:12px;color:#d1d5db}
kbd{background:#232b38;border:1px solid #4b5563;border-bottom-width:2px;border-radius:4px;padding:1px 5px;font-family:monospace;font-size:11px;color:#ffc12b;font-weight:700}
.ex-guide-block{background:#0d1118;border:1px solid #2b3342;border-left:3px solid #2bc1ff;border-radius:5px;padding:12px 14px}
.ex-guide-block h4{margin:0 0 6px;color:#ffc12b;font-size:13px}
.ex-guide-block p,.ex-guide-block ul{margin:0;color:#d1d5db;font-size:13px}
.ex-guide-block ul{padding-left:18px;display:flex;flex-direction:column;gap:4px}
.ex-form-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:1px solid #2d3545;padding-bottom:10px}
.ex-tabs{display:flex;gap:6px;flex-wrap:wrap}
.ex-tab{background:#1d2330;color:#cbd5e1;border:1px solid #374151;border-radius:5px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer}
.ex-tab.active{background:#0b4f6c;border-color:#2bc1ff;color:#fff}
.ex-form-search{flex:1;min-width:200px;background:#0a0e14;color:#fff;border:1px solid #3b4659;border-radius:5px;padding:7px 10px;font-size:12px;outline:none}
.ex-form-search:focus{border-color:#2bc1ff}
.ex-empty{text-align:center;color:#9ca3af;padding:24px 10px}
.ex-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.ex-form-card{background:#0d1118;border:1px solid #2b3342;border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:7px}
.ex-form-card h4{margin:0;color:#2bc1ff;font-size:12px;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #242c3a;padding-bottom:5px}
.ex-form-line{color:#fff;font-size:13px;line-height:1.6}
.ex-form-vars{font-size:11.5px;color:#cbd5e1;background:#131924;padding:6px 8px;border-radius:4px;border-left:2px solid #475569}
.ex-form-tip{font-size:11.5px;color:#fde68a}
.ex-form-ex{font-size:11.5px;color:#6ee7b7;background:#09201c;padding:5px 8px;border-radius:4px;border:1px solid #134e43}
.ex-modal-foot{padding:10px 16px;background:#10141c;border-top:1px solid #2b3342;display:flex;justify-content:flex-end}
.ex-close-btn{background:#0b4f6c;border:1px solid #2bc1ff;color:#fff;border-radius:4px;padding:7px 18px;font-size:12px;font-weight:700;cursor:pointer}
.ex-close-btn:hover{background:#0e678b}
@media(max-width:700px){.ex-help-grid,.ex-form-grid,.ex-kbd-grid{grid-template-columns:1fr}.ex-calc-win{right:10px;bottom:10px;width:calc(100vw - 20px);max-width:300px}}
</style>
