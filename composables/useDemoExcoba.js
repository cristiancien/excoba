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

  // Construye un examen demostrativo aleatorio de 180 reactivos cubriendo los 126 temas + formatos interactivos
  function buildRandomDemo180(allItems, targetCount = 180) {
    const byTopic = new Map();
    const showcase = [];
    for (const it of allItems) {
      if (it.isOriginal) { showcase.push(it); continue; }
      if (!byTopic.has(it.topicRef)) byTopic.set(it.topicRef, []);
      byTopic.get(it.topicRef).push(it);
    }
    const chosen = [];
    const seen = new Set();
    // 1 reactivo aleatorio de cada uno de los 126 temas del temario (100% cobertura)
    for (const list of byTopic.values()) {
      const pick = list[Math.floor(Math.random() * list.length)];
      if (pick && !seen.has(pick.id)) {
        chosen.push(pick);
        seen.add(pick.id);
      }
    }
    // Completar hasta 180 priorizando la muestra interactiva (todos los formatos EXCOBA) y luego resto del temario
    const extras = [...shuffleArray(showcase), ...shuffleArray(allItems.filter(it => !it.isOriginal && !seen.has(it.id)))];
    for (const cand of extras) {
      if (chosen.length >= targetCount) break;
      if (!seen.has(cand.id)) {
        chosen.push(cand);
        seen.add(cand.id);
      }
    }
    return shuffleArray(chosen);
  }

  function parseNumericAnswer(raw) {
    const clean = String(raw ?? '').trim().replace(',', '.');
    if (!clean) return null;
    const frac = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
    if (frac) {
      const den = Number(frac[2]);
      return den !== 0 ? Number(frac[1]) / den : null;
    }
    const num = Number(clean.replace(/[^\d.+-eE]/g, ''));
    return Number.isFinite(num) ? num : null;
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
            ? Math.abs(u - e) <= Math.max(Number(f.tol) || 0.05, 0.01)
            : raw.toLowerCase() === String(f.expected).trim().toLowerCase();
        });
      }
      return false;
    }

    if (item.tipo === 7) {
      const userNum = parseNumericAnswer(answer.text ?? answer);
      if (userNum === null || !Number.isFinite(Number(item.numericValue))) return false;
      return Math.abs(userNum - Number(item.numericValue)) <= Math.max(Number(item.tolerance) || 0.01, 0.01);
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

    const demo180Items = ref(buildRandomDemo180(allItems, 180));

    // Agrupaciones por materia que exponen el demostrativo aleatorio (180) + los 2,520 reactivos agrupados
    const subjectGroups = SUBJECT_GROUP_ORDER.map(def => {
      if (def.isDemo180) {
        const bySubj = new Map();
        for (const it of demo180Items.value) bySubj.set(it.subject, (bySubj.get(it.subject) || 0) + 1);
        const topics = [...bySubj.entries()].map(([subj, count]) => ({
          ref: subj, title: subj, subject: subj, count, packageStage: 'EXAMEN DEMOSTRATIVO',
        }));
        return { ...def, count: demo180Items.value.length, topics, packages: [] };
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
    const elapsedSeconds = ref(0);
    let intervalId = null;

    const activeSubjectGroup = computed(() => subjectGroups.find(g => g.key === selectedSubjectKey.value) || subjectGroups[0] || null);
    const activePackage = computed(() => packages.find(p => p.id === selectedPackageId.value) || packages[0] || null);

    const availableTopics = computed(() => {
      if (selectionMode.value === 'package') return activePackage.value?.topics || [];
      if (activeSubjectGroup.value?.isDemo180) {
        const bySubj = new Map();
        for (const it of demo180Items.value) bySubj.set(it.subject, (bySubj.get(it.subject) || 0) + 1);
        return [...bySubj.entries()].map(([subj, count]) => ({ ref: subj, title: subj, subject: subj, count, packageStage: 'EXAMEN DEMOSTRATIVO' }));
      }
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

    const sessionItems = computed(() => {
      let pool;
      if (selectionMode.value === 'package') {
        pool = selectedPackageId.value ? allItems.filter(it => it.packageId === selectedPackageId.value) : allItems;
      } else if (activeSubjectGroup.value?.isDemo180) {
        pool = demo180Items.value;
      } else {
        const ids = new Set(activeSubjectGroup.value?.packageIds || []);
        pool = ids.size ? allItems.filter(it => ids.has(it.packageId)) : allItems;
      }
      if (!selectedTopicRef.value) return pool;
      const filterBySubject = selectionMode.value === 'package'
        ? Boolean(activePackage.value?.isOriginal)
        : Boolean(activeSubjectGroup.value?.isOriginal || activeSubjectGroup.value?.isDemo180);
      if (filterBySubject) return pool.filter(it => it.subject === selectedTopicRef.value);
      return pool.filter(it => it.topicRef === selectedTopicRef.value);
    });

    const currentItem = computed(() => sessionItems.value[currentIndex.value] || null);
    const totalCount = computed(() => sessionItems.value.length);
    const answeredCount = computed(() => sessionItems.value.filter(it => isDemoItemAnswered(it, answers.value[it.id])).length);
    const elapsedFormatted = computed(() => formatSeconds(elapsedSeconds.value));
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
      elapsedSeconds.value = 0;
    }
    function regenerateDemo180() {
      demo180Items.value = buildRandomDemo180(allItems, 180);
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
    function finish() { stopClock(); showResults.value = true; }

    const resultsSummary = computed(() => {
      const byGroup = new Map();
      let totalCorrect = 0;
      for (const it of sessionItems.value) {
        const ok = gradeDemoItem(it, answers.value[it.id]);
        if (ok) totalCorrect++;
        const key = it.isOriginal ? it.subject : it.topicRef;
        if (!byGroup.has(key)) {
          byGroup.set(key, { ref: it.isOriginal ? 'ORIG' : it.topicRef, title: it.isOriginal ? it.subject : it.topicTitle, correct: 0, total: 0 });
        }
        const row = byGroup.get(key);
        row.total++;
        if (ok) row.correct++;
      }
      return {
        totalCorrect,
        totalQuestions: sessionItems.value.length,
        percentage: sessionItems.value.length ? Math.round((totalCorrect / sessionItems.value.length) * 100) : 0,
        rows: [...byGroup.values()],
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
      answers, showResults, elapsedSeconds, elapsedFormatted, resultsSummary,
      startClock, stopClock, selectSubjectGroup, regenerateDemo180, selectPackage, selectTopic, setAnswer, goTo,
      prev: () => goTo(currentIndex.value - 1),
      next: () => goTo(currentIndex.value + 1),
      finish, resetSessionState,
      isAnswered: it => isDemoItemAnswered(it, answers.value[it.id]),
      isCorrect: it => gradeDemoItem(it, answers.value[it.id]),
    };
  };

  root.EXCOBA_DEMO_UTILS = { parseNumericAnswer, gradeDemoItem, isDemoItemAnswered, formatSeconds, buildRandomDemo180 };
  if (typeof module === 'object' && module.exports) module.exports = root.EXCOBA_DEMO_UTILS;
})(typeof window !== 'undefined' ? window : globalThis);
