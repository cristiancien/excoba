/** Composable unificado para la interfaz replica DemoExcoba.exe (70 originales + 20 x 126 temas = 2,520). */
(function (root) {
  'use strict';

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

    const firstPkg = packages[0] || null;
    const selectedPackageId = ref(firstPkg?.id ?? null);
    const selectedTopicRef = ref(firstPkg?.isOriginal ? '' : (firstPkg?.topics?.[0]?.ref ?? ''));
    const currentIndex = ref(0);
    const answers = ref({});
    const showResults = ref(false);
    const elapsedSeconds = ref(0);
    let intervalId = null;

    const activePackage = computed(() => packages.find(p => p.id === selectedPackageId.value) || packages[0] || null);
    const availableTopics = computed(() => activePackage.value?.topics || []);

    const sessionItems = computed(() => {
      if (!selectedPackageId.value) return allItems;
      const inPkg = allItems.filter(it => it.packageId === selectedPackageId.value);
      if (!selectedTopicRef.value) return inPkg;
      if (activePackage.value?.isOriginal) return inPkg.filter(it => it.subject === selectedTopicRef.value);
      return inPkg.filter(it => it.topicRef === selectedTopicRef.value);
    });

    const currentItem = computed(() => sessionItems.value[currentIndex.value] || null);
    const totalCount = computed(() => sessionItems.value.length);
    const answeredCount = computed(() => sessionItems.value.filter(it => isDemoItemAnswered(it, answers.value[it.id])).length);
    const elapsedFormatted = computed(() => formatSeconds(elapsedSeconds.value));

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
    function selectPackage(pkgId, topicRef = null) {
      const idNum = Number(pkgId);
      selectedPackageId.value = idNum;
      const pkg = packages.find(p => p.id === idNum);
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
      packages, activePackage, availableTopics,
      selectedPackageId, selectedTopicRef,
      sessionItems, currentIndex, currentItem, totalCount, answeredCount,
      answers, showResults, elapsedSeconds, elapsedFormatted, resultsSummary,
      startClock, stopClock, selectPackage, selectTopic, setAnswer, goTo,
      prev: () => goTo(currentIndex.value - 1),
      next: () => goTo(currentIndex.value + 1),
      finish, resetSessionState,
      isAnswered: it => isDemoItemAnswered(it, answers.value[it.id]),
      isCorrect: it => gradeDemoItem(it, answers.value[it.id]),
    };
  };

  root.EXCOBA_DEMO_UTILS = { parseNumericAnswer, gradeDemoItem, isDemoItemAnswered, formatSeconds };
  if (typeof module === 'object' && module.exports) module.exports = root.EXCOBA_DEMO_UTILS;
})(typeof window !== 'undefined' ? window : globalThis);
