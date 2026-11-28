<template>
  <div class="canvas-wrap">
    <canvas ref="canvasEl" width="480" height="250" class="demo-canvas"></canvas>
  </div>
</template>

<script>
const { ref, onMounted, watch } = Vue;

function drawSpec(canvas, spec) {
  if (!canvas || !spec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { l: 52, r: 24, t: 32, b: 42 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, W, H);

  // Titulo
  ctx.fillStyle = '#ffc12b';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(spec.title || '', W / 2, 20);

  if (spec.kind === 'bar-chart') {
    const bars = spec.bars || [];
    const maxVal = Math.max(10, ...bars.map(b => b.value)) * 1.15;
    // Grid y eje Y
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ph - (ph * i / 4);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = '#9ca3af'; ctx.font = '11px Arial'; ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal * i / 4)), pad.l - 8, y + 4);
    }
    const slot = pw / Math.max(1, bars.length);
    bars.forEach((b, i) => {
      const bw = Math.min(54, slot * 0.56);
      const x = pad.l + i * slot + (slot - bw) / 2;
      const bh = (b.value / maxVal) * ph;
      const y = pad.t + ph - bh;
      ctx.fillStyle = i % 2 === 0 ? '#2bc1ff' : '#00d8b3';
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.fillText(String(b.value), x + bw / 2, y - 6);
      ctx.fillStyle = '#d1d5db'; ctx.font = '11px Arial';
      ctx.fillText(b.label, x + bw / 2, H - 18);
    });
    return;
  }

  const [xMin, xMax] = spec.xRange || [0, 10];
  const [yMin, yMax] = spec.yRange || [0, 10];
  const sx = x => pad.l + ((x - xMin) / (xMax - xMin)) * pw;
  const sy = y => pad.t + ph - ((y - yMin) / (yMax - yMin)) * ph;

  // Cuadricula
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  const xSteps = Math.min(10, Math.max(4, Math.round(xMax - xMin)));
  for (let i = 0; i <= xSteps; i++) {
    const xv = xMin + (xMax - xMin) * i / xSteps;
    const x = sx(xv);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
    ctx.fillStyle = '#9ca3af'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(String(Math.round(xv * 10) / 10), x, pad.t + ph + 15);
  }
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const yv = yMin + (yMax - yMin) * i / ySteps;
    const y = sy(yv);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
    ctx.fillStyle = '#9ca3af'; ctx.font = '10px Arial'; ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(yv * 10) / 10), pad.l - 7, y + 4);
  }

  // Ejes X/Y
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.8;
  const zeroY = (yMin <= 0 && yMax >= 0) ? sy(0) : pad.t + ph;
  const zeroX = (xMin <= 0 && xMax >= 0) ? sx(0) : pad.l;
  ctx.beginPath(); ctx.moveTo(pad.l, zeroY); ctx.lineTo(pad.l + pw, zeroY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(zeroX, pad.t); ctx.lineTo(zeroX, pad.t + ph); ctx.stroke();

  if (spec.xLabel) {
    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
    ctx.fillText(spec.xLabel, pad.l + pw / 2, H - 6);
  }
  if (spec.yLabel) {
    ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
    ctx.fillText(spec.yLabel, 0, 0); ctx.restore();
  }

  // Curva / puntos
  ctx.strokeStyle = '#2bc1ff'; ctx.lineWidth = 3;
  ctx.beginPath();
  if (spec.kind === 'parabola-plot') {
    const { a = 1, h = 0, k = 0 } = spec;
    let started = false;
    for (let i = 0; i <= 80; i++) {
      const xv = xMin + (xMax - xMin) * i / 80;
      const yv = a * (xv - h) * (xv - h) + k;
      if (yv < yMin - 1 || yv > yMax + 1) continue;
      if (!started) { ctx.moveTo(sx(xv), sy(yv)); started = true; } else ctx.lineTo(sx(xv), sy(yv));
    }
    ctx.stroke();
    ctx.fillStyle = '#ffc12b';
    ctx.beginPath(); ctx.arc(sx(h), sy(k), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 12px Arial'; ctx.textAlign = 'left';
    ctx.fillText(`Vértice (${h}, ${k})`, sx(h) + 8, sy(k) + 4);
  } else {
    const pts = spec.points || [];
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(sx(x), sy(y)); else ctx.lineTo(sx(x), sy(y));
    });
    ctx.stroke();
    pts.forEach(([x, y]) => {
      ctx.fillStyle = '#00d8b3';
      ctx.beginPath(); ctx.arc(sx(x), sy(y), 4.5, 0, Math.PI * 2); ctx.fill();
    });
    (spec.highlight || []).forEach(([x, y, lbl]) => {
      ctx.fillStyle = '#ffc12b';
      ctx.beginPath(); ctx.arc(sx(x), sy(y), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 12px Arial'; ctx.textAlign = 'left';
      ctx.fillText(lbl, sx(x) + 8, sy(y) - 6);
    });
  }
}

export default {
  props: { spec: { type: Object, required: true } },
  setup(props) {
    const canvasEl = ref(null);
    const render = () => drawSpec(canvasEl.value, props.spec);
    onMounted(render);
    watch(() => props.spec, render, { deep: true });
    return { canvasEl };
  },
};
</script>

<style scoped>
.canvas-wrap{display:inline-block;max-width:100%;margin:0 auto;border:1px solid #374151;border-radius:5px;overflow:hidden;background:#0a0e14}
.demo-canvas{display:block;max-width:100%;height:auto}
</style>
