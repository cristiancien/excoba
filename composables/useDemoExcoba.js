/** Composable unificado para el entorno EXCOBA (70 muestra + 2,520 temario agrupados por materia). */
(function (root) {
  'use strict';

  const SUBJECT_GROUP_ORDER = [
    { key: 'DEMO180', label: 'Demostrativo', packageIds: [], isDemo180: true, isOriginal: false },
    { key: 'Español', label: 'Español', packageIds: [170, 172], isOriginal: false },
    { key: 'Matemáticas', label: 'Matemáticas', packageIds: [171, 173, 176], isOriginal: false },
    { key: 'Ciencias Naturales', label: 'C. Naturales', packageIds: [174], isOriginal: false },
    { key: 'Ciencias Sociales', label: 'C. Sociales', packageIds: [175], isOriginal: false },
    { key: 'Física', label: 'Física', packageIds: [177], isOriginal: false },
    { key: 'Lenguaje', label: 'Lenguaje', packageIds: [178], isOriginal: false },
    { key: 'ORIG', label: 'Interactivos', packageIds: [1670], isOriginal: true },
    { key: 'ALL', label: 'Todo el temario', packageIds: [170, 171, 172, 173, 174, 175, 176, 177, 178], isOriginal: false },
  ];

  function shuffleArray(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Construye un examen demostrativo aleatorio de 180 reactivos siguiendo
  // estrictamente el orden de Temario.pdf: 20 reactivos aleatorios de cada
  // una de las 9 materias/bloques del temario (9 x 20 = 180).
  function buildRandomDemo180(packages, allItems, perPackage = 20) {
    const temarioPkgs = (packages || []).filter(p => !p.isOriginal);
    const chosen = [];

    for (const pkg of temarioPkgs) {
      const pkgItems = allItems.filter(it => !it.isOriginal && it.packageId === pkg.id);
      const topicOrder = new Map((pkg.topics || []).map((t, idx) => [t.ref, idx]));
      const byTopic = new Map();
      for (const it of pkgItems) {
        if (!byTopic.has(it.topicRef)) byTopic.set(it.topicRef, []);
        byTopic.get(it.topicRef).push(it);
      }

      const orderedRefs = (pkg.topics || []).map(t => t.ref).filter(r => byTopic.has(r));
      const picked = [];
      const seen = new Set();

      if (orderedRefs.length <= perPackage) {
        // 1 reactivo aleatorio de cada subtema + completar aleatoriamente hasta 20 dentro del mismo bloque
        for (const ref of orderedRefs) {
          const pool = byTopic.get(ref);
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick && !seen.has(pick.id)) { picked.push(pick); seen.add(pick.id); }
        }
        const remRefs = shuffleArray(orderedRefs);
        let cursor = 0;
        while (picked.length < perPackage && cursor < remRefs.length * 20) {
          const ref = remRefs[cursor % remRefs.length];
          cursor++;
          const avail = byTopic.get(ref).filter(it => !seen.has(it.id));
          if (!avail.length) continue;
          const pick = avail[Math.floor(Math.random() * avail.length)];
          picked.push(pick);
          seen.add(pick.id);
        }
      } else {
        // Más de 20 subtemas en el bloque: elegir 20 subtemas al azar (1 reactivo aleatorio c/u)
        for (const ref of shuffleArray(orderedRefs).slice(0, perPackage)) {
          const pool = byTopic.get(ref);
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick && !seen.has(pick.id)) { picked.push(pick); seen.add(pick.id); }
        }
      }

      // Mantener estrictamente el orden del temario dentro de los 20 del bloque (subtema -> nivel)
      picked.sort((a, b) => {
        const ta = topicOrder.get(a.topicRef) ?? 9999;
        const tb = topicOrder.get(b.topicRef) ?? 9999;
        return ta !== tb ? ta - tb : (a.level - b.level);
      });
      chosen.push(...picked.slice(0, perPackage));
    }

    return chosen;
  }

  const openEval = root.EXCOBA_OPEN_EVAL || (typeof require === 'function' ? require('./openAnswerEvaluator.js') : null);
  const { roundToTwo, parseNumericAnswer, numbersMatchRounded, matchOpenMathExpression } = openEval;

  function formatAnswerPreview(item, answer) {
    if (!item || answer == null) return 'Sin responder';
    if (item.isOriginal) {
      if (item.tipo === 4 || item.tipo === 23) {
        const vals = (item.tokens || []).map(t => answer.tokens?.[t.id] || '—');
        return vals.some(v => v !== '—') ? vals.join(' | ') : 'Sin responder';
      }
      if (item.tipo === 5) {
        const map = answer.map || {};
        if (!Object.keys(map).length) return 'Sin responder';
        return (item.categories || []).map(c => `${c.title}: ${(item.statements || []).filter(s => map[s.id] === c.id).map(s => s.text).join('; ') || '—'}`).join(' | ');
      }
      if (item.tipo === 6) {
        const seq = Array.isArray(answer.seq) ? answer.seq : [];
        return seq.length ? seq.map((id, i) => `${i + 1}. ${(item.sentences || []).find(s => s.id === id)?.text || id}`).join(' ') : 'Sin responder';
      }
      if (item.tipo === 12) {
        const rows = (item.rows || []).map(r => `${r.prompt} → ${answer.rows?.[r.key] || '—'}`);
        return Object.values(answer.rows || {}).some(Boolean) ? rows.join(' | ') : 'Sin responder';
      }
      if ([3, 16, 18, 19, 24].includes(item.tipo)) {
        const picked = Array.isArray(answer.picked) ? answer.picked : [];
        if (!picked.length) return 'Sin responder';
        if (item.areas) return picked.map(id => item.areas.find(a => a.id === id)?.title || id).join(' | ');
        return `${picked.length} frase(s) seleccionada(s)`;
      }
      if (item.fields) {
        const vals = item.fields.map(f => {
          const v = String(answer.fields?.[f.key] || '').trim();
          return v ? `${v}${f.unit ? ' ' + f.unit : ''}` : '—';
        });
        return vals.some(v => v !== '—') ? vals.join(' | ') : 'Sin responder';
      }
      return 'Sin responder';
    }
    if (item.tipo === 7) {
      const txt = String(answer.text ?? '').trim();
      return txt ? `${txt}${item.unit ? ' ' + item.unit : ''}` : 'Sin responder';
    }
    if (item.tipo === 4) {
      const opt = (item.options || []).find(o => o.id === answer.optionId);
      return opt ? `${opt.id}) ${opt.text}` : 'Sin responder';
    }
    if (item.tipo === 5) {
      const map = answer.map || {};
      if (!Object.keys(map).length) return 'Sin responder';
      return (item.categories || []).map(c => `${c.title}: ${(item.statements || []).filter(s => map[s.id] === c.id).map(s => s.text).join('; ') || '—'}`).join(' | ');
    }
    return 'Sin responder';
  }

  function gradeDemoItem(item, answer) {
    if (!item || answer == null) return false;
    if (item.isOriginal) {
      if (item.tipo === 4 || item.tipo === 23) {
        const map = answer.tokens || {};
        return (item.tokens || []).length > 0 && item.tokens.every(t => {
          const best = t.options.find(o => o.correcta === 1) || t.options[0];
          return best && map[t.id] === best.val;
        });
      }
      if (item.tipo === 5) {
        const map = answer.map || {};
        return (item.statements || []).length > 0 && item.statements.every(s => map[s.id] === s.category);
      }
      if (item.tipo === 6) {
        const seq = Array.isArray(answer.seq) ? answer.seq : [];
        return seq.length === (item.sentences || []).length && seq.every((id, i) => id === item.sentences[i].id);
      }
      if (item.tipo === 12) {
        const map = answer.rows || {};
        return (item.rows || []).length > 0 && item.rows.every(r => String(map[r.key] || '').trim().toLowerCase() === r.expected.trim().toLowerCase());
      }
      if (item.tipo === 16 || item.tipo === 18) {
        const picked = Array.isArray(answer.picked) ? answer.picked : [];
        return picked.length > 0 && (item.correctIds || []).length > 0 && item.correctIds.every(id => picked.includes(id));
      }
      if (item.tipo === 3 || item.tipo === 19 || item.tipo === 24) {
        const want = (item.areas || []).filter(a => a.correcta).map(a => a.id);
        const picked = Array.isArray(answer.picked) ? answer.picked : [];
        if (want.length > 0) return want.length === picked.length && want.every(id => picked.includes(id));
        return picked.length === (item.targetCount || (item.areas || []).length);
      }
      if (item.fields) {
        const map = answer.fields || {};
        return item.fields.every(f => {
          const raw = String(map[f.key] || '').trim();
          if (!raw) return false;
          const u = parseNumericAnswer(raw), e = parseNumericAnswer(f.expected);
          return u !== null && e !== null
            ? numbersMatchRounded(u, e, Number(f.tol) || 0.05)
            : raw.toLowerCase() === String(f.expected).trim().toLowerCase();
        });
      }
      return false;
    }

    if (item.tipo === 7) {
      const rawText = String(answer.text ?? answer ?? '').trim();
      if (!rawText) return false;
      if (item.numericValue !== null && item.numericValue !== undefined && Number.isFinite(Number(item.numericValue))) {
        const userNum = parseNumericAnswer(rawText);
        if (numbersMatchRounded(userNum, Number(item.numericValue), Number(item.tolerance) || 0.01)) return true;
      }
      return matchOpenMathExpression(rawText, item.expectedText || item.correctAnswer);
    }
    if (item.tipo === 4) {
      const chosen = String(answer.optionId || '');
      return Boolean((item.options || []).find(o => o.id === chosen && o.isCorrect));
    }
    if (item.tipo === 5) {
      const map = answer.map || {};
      const stmts = item.statements || [];
      return stmts.length > 0 && stmts.every(s => map[s.id] === s.category);
    }
    return false;
  }

  function isDemoItemAnswered(item, answer) {
    if (!item || answer == null) return false;
    if (item.isOriginal) {
      if (item.tipo === 4 || item.tipo === 23) return Object.values(answer.tokens || {}).some(Boolean);
      if (item.tipo === 5) return (item.statements || []).length > 0 && (item.statements || []).every(s => Boolean(answer.map?.[s.id]));
      if (item.tipo === 6) return Array.isArray(answer.seq) && answer.seq.length > 0;
      if (item.tipo === 12) return Object.values(answer.rows || {}).some(v => String(v || '').trim().length > 0);
      if ([3, 16, 18, 19, 24].includes(item.tipo)) return Array.isArray(answer.picked) && answer.picked.length > 0;
      if (item.fields) return Object.values(answer.fields || {}).some(v => String(v || '').trim().length > 0);
      return false;
    }
    if (item.tipo === 7) return String(answer.text ?? '').trim().length > 0;
    if (item.tipo === 4) return Boolean(answer.optionId);
    if (item.tipo === 5) return (item.statements || []).length > 0 && (item.statements || []).every(s => Boolean(answer.map?.[s.id]));
    return false;
  }

  function formatSeconds(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    const pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  root.useDemoExcoba = (datasetOverride = null) => {
    const { ref, computed } = root.Vue;
    const raw = datasetOverride || root.EXCOBA_DEMO_TEMARIO || {
      version: 'empty', totalTopics: 0, reactivosPerTopic: 20, totalReactivos: 0, originalCount: 0, packages: [], items: [],
    };
    const packages = raw.packages || [];
    const allItems = raw.items || [];

    const demo180Items = ref(buildRandomDemo180(packages, allItems, 20));
    const demo180Topics = () => packages.filter(p => !p.isOriginal).map(p => ({
      ref: String(p.id),
      prefix: p.prefix,
      title: `${p.prefix} · ${p.stage} · ${p.subject}`,
      subject: `${p.prefix} · ${p.stage} · ${p.subject}`,
      count: demo180Items.value.filter(it => it.packageId === p.id).length,
      packageStage: p.stage,
    }));

    // Agrupaciones por materia que exponen el demostrativo aleatorio (180 en orden del temario) + 2,520 por materia
    const subjectGroups = SUBJECT_GROUP_ORDER.map(def => {
      if (def.isDemo180) {
        return { ...def, count: demo180Items.value.length, topics: demo180Topics(), packages: [] };
      }
      const idSet = new Set(def.packageIds);
      const pkgs = packages.filter(p => idSet.has(p.id));
      const topics = pkgs.flatMap(p => (p.topics || []).map(t => ({ ...t, packageStage: p.stage, packageSubject: p.subject })));
      const count = pkgs.reduce((acc, p) => acc + (p.count || 0), 0);
      return { ...def, count, topics, packages: pkgs };
    }).filter(g => g.count > 0);

    const firstPkg = packages[0] || null;
    const selectedSubjectKey = ref(subjectGroups[0]?.key ?? 'DEMO180');
    const selectedPackageId = ref(firstPkg?.id ?? null);
    const selectedTopicRef = ref('');
    const selectionMode = ref('subject'); // 'subject' | 'package'
    const currentIndex = ref(0);
    const answers = ref({});
    const showResults = ref(false);
    const hasFinished = ref(false);
    const elapsedSeconds = ref(0);
    let intervalId = null;

    const activeSubjectGroup = computed(() => subjectGroups.find(g => g.key === selectedSubjectKey.value) || subjectGroups[0] || null);
    const activePackage = computed(() => packages.find(p => p.id === selectedPackageId.value) || packages[0] || null);

    const availableTopics = computed(() => {
      if (selectionMode.value === 'package') return activePackage.value?.topics || [];
      if (activeSubjectGroup.value?.isDemo180) return demo180Topics();
      return activeSubjectGroup.value?.topics || [];
    });

    const topicsByStage = computed(() => {
      const map = new Map();
      for (const t of availableTopics.value) {
        const grp = t.packageStage || t.stage || 'General';
        if (!map.has(grp)) map.set(grp, []);
        map.get(grp).push(t);
      }
      return [...map.entries()].map(([stage, topics]) => ({ stage, topics }));
    });

    // Mapa canónico del orden estricto de Temario.pdf (bloque -> subtema -> posición)
    const temarioOrderRank = new Map();
    let globalTopicRank = 0;
    for (const p of packages) {
      if (p.isOriginal) continue;
      for (const t of (p.topics || [])) {
        temarioOrderRank.set(`${p.id}:${t.ref}`, globalTopicRank++);
      }
    }
    const sortByTemarioOrder = list => [...list].sort((a, b) => {
      const ra = temarioOrderRank.get(`${a.packageId}:${a.topicRef}`) ?? 999999;
      const rb = temarioOrderRank.get(`${b.packageId}:${b.topicRef}`) ?? 999999;
      if (ra !== rb) return ra - rb;
      if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
      return String(a.id).localeCompare(String(b.id));
    });

    const sessionItems = computed(() => {
      let pool;
      if (selectionMode.value === 'package') {
        pool = selectedPackageId.value ? allItems.filter(it => it.packageId === selectedPackageId.value) : allItems;
      } else if (activeSubjectGroup.value?.isDemo180) {
        pool = demo180Items.value;
      } else {
        const ids = new Set(activeSubjectGroup.value?.packageIds || []);
        const rawPool = ids.size ? allItems.filter(it => ids.has(it.packageId)) : allItems;
        pool = activeSubjectGroup.value?.isOriginal ? rawPool : sortByTemarioOrder(rawPool);
      }
      if (!selectedTopicRef.value) return pool;
      if (selectionMode.value === 'subject' && activeSubjectGroup.value?.isDemo180) {
        return pool.filter(it => String(it.packageId) === selectedTopicRef.value);
      }
      const filterBySubject = selectionMode.value === 'package'
        ? Boolean(activePackage.value?.isOriginal)
        : Boolean(activeSubjectGroup.value?.isOriginal);
      if (filterBySubject) return pool.filter(it => it.subject === selectedTopicRef.value);
      return pool.filter(it => it.topicRef === selectedTopicRef.value);
    });

    const currentItem = computed(() => sessionItems.value[currentIndex.value] || null);
    const totalCount = computed(() => sessionItems.value.length);
    const answeredCount = computed(() => sessionItems.value.filter(it => isDemoItemAnswered(it, answers.value[it.id])).length);
    const elapsedFormatted = computed(() => formatSeconds(elapsedSeconds.value));
    // Tiempo oficial de referencia: 1 min por reactivo (mín. 20 min, tope 3 h = 180 min para 180+)
    const timeLimitSeconds = computed(() => Math.min(180, Math.max(20, totalCount.value || 180)) * 60);
    const remainingSeconds = computed(() => timeLimitSeconds.value - elapsedSeconds.value);
    const clockStatus = computed(() => {
      if (remainingSeconds.value <= 0) return 'over';
      if (remainingSeconds.value <= 15 * 60) return 'warn';
      return 'ok';
    });
    const activeTitle = computed(() => {
      if (selectionMode.value === 'package') return activePackage.value?.subject || 'EXCOBA';
      return activeSubjectGroup.value?.label || 'EXCOBA';
    });

    function startClock() {
      if (intervalId) return;
      intervalId = setInterval(() => { elapsedSeconds.value += 1; }, 1000);
    }
    function stopClock() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }
    function resetSessionState() {
      currentIndex.value = 0;
      answers.value = {};
      showResults.value = false;
      hasFinished.value = false;
      elapsedSeconds.value = 0;
    }
    function regenerateDemo180() {
      demo180Items.value = buildRandomDemo180(packages, allItems, 20);
      selectionMode.value = 'subject';
      selectedSubjectKey.value = 'DEMO180';
      selectedTopicRef.value = '';
      resetSessionState();
    }
    function selectSubjectGroup(key, topicRef = '') {
      const grp = subjectGroups.find(g => g.key === key) || subjectGroups[0];
      if (!grp) return;
      selectionMode.value = 'subject';
      selectedSubjectKey.value = grp.key;
      selectedPackageId.value = grp.packageIds[0] ?? null;
      selectedTopicRef.value = String(topicRef || '');
      resetSessionState();
    }
    function selectPackage(pkgId, topicRef = null) {
      const idNum = Number(pkgId);
      selectionMode.value = 'package';
      selectedPackageId.value = idNum;
      const pkg = packages.find(p => p.id === idNum);
      const owner = subjectGroups.find(g => g.key !== 'ALL' && g.packageIds.includes(idNum));
      if (owner) selectedSubjectKey.value = owner.key;
      if (topicRef !== null) selectedTopicRef.value = String(topicRef);
      else selectedTopicRef.value = pkg?.isOriginal ? '' : (pkg?.topics?.[0]?.ref ?? '');
      resetSessionState();
    }
    function selectTopic(topicRef) {
      selectedTopicRef.value = String(topicRef || '');
      resetSessionState();
    }
    function setAnswer(itemId, value) {
      answers.value = { ...answers.value, [itemId]: value };
    }
    function goTo(index) {
      if (index >= 0 && index < sessionItems.value.length) currentIndex.value = index;
    }
    function finish() { stopClock(); hasFinished.value = true; showResults.value = true; }

    function formatStageLabel(stage) {
      const s = String(stage || '').trim();
      const map = {
        'EDUCACIÓN PRIMARIA': 'Primaria',
        'EDUCACIÓN SECUNDARIA': 'Secundaria',
        'BACHILLERATO': 'Bachillerato',
        'EXAMEN DEMOSTRATIVO': 'Examen Demostrativo',
      };
      return map[s.toUpperCase()] || s || 'General';
    }

    const resultsSummary = computed(() => {
      const byGroup = new Map();
      const wrongIndices = [];
      let totalCorrect = 0;
      sessionItems.value.forEach((it, idx) => {
        const ok = gradeDemoItem(it, answers.value[it.id]);
        if (ok) totalCorrect++;
        else wrongIndices.push(idx);
        const groupLabel = `${formatStageLabel(it.stage)} › ${it.subject}`;
        if (!byGroup.has(groupLabel)) {
          byGroup.set(groupLabel, { key: groupLabel, title: groupLabel, correct: 0, wrongCount: 0, total: 0, wrongItems: [] });
        }
        const row = byGroup.get(groupLabel);
        row.total++;
        if (ok) row.correct++;
        else {
          row.wrongCount++;
          row.wrongItems.push({ index: idx, number: idx + 1, id: it.id, topicRef: it.topicRef, topicTitle: it.topicTitle });
        }
      });
      const rows = [...byGroup.values()];
      return {
        totalCorrect,
        totalWrong: wrongIndices.length,
        totalQuestions: sessionItems.value.length,
        percentage: sessionItems.value.length ? Math.round((totalCorrect / sessionItems.value.length) * 100) : 0,
        rows,
        wrongRows: rows.filter(r => r.wrongCount > 0),
        wrongIndices,
      };
    });

    return {
      version: raw.version,
      totalTopics: raw.totalTopics,
      reactivosPerTopic: raw.reactivosPerTopic,
      totalReactivos: raw.totalReactivos,
      originalCount: raw.originalCount || 0,
      packages, subjectGroups, activeSubjectGroup, activePackage, activeTitle,
      availableTopics, topicsByStage,
      selectionMode, selectedSubjectKey, selectedPackageId, selectedTopicRef,
      sessionItems, currentIndex, currentItem, totalCount, answeredCount,
      answers, showResults, hasFinished, elapsedSeconds, elapsedFormatted,
      timeLimitSeconds, remainingSeconds, clockStatus, resultsSummary,
      startClock, stopClock, selectSubjectGroup, regenerateDemo180, selectPackage, selectTopic, setAnswer, goTo,
      prev: () => goTo(currentIndex.value - 1),
      next: () => goTo(currentIndex.value + 1),
      finish, resetSessionState,
      isAnswered: it => isDemoItemAnswered(it, answers.value[it.id]),
      isCorrect: it => gradeDemoItem(it, answers.value[it.id]),
      userAnswerText: it => formatAnswerPreview(it, answers.value[it.id]),
    };
  };

  root.EXCOBA_DEMO_UTILS = { roundToTwo, parseNumericAnswer, numbersMatchRounded, matchOpenMathExpression, formatAnswerPreview, gradeDemoItem, isDemoItemAnswered, formatSeconds, buildRandomDemo180 };
  if (typeof module === 'object' && module.exports) module.exports = root.EXCOBA_DEMO_UTILS;
})(typeof window !== 'undefined' ? window : globalThis);
