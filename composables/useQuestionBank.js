/** Canonical question catalogue + bounded sessions. Only IDs and answers are persisted. */
(function (root) {
  'use strict';
  const STORAGE_KEY = 'excoba_session_v2';
  const SUBTEMA_MAP = Object.freeze({ Primaria: ['Español', 'Matemáticas'], Secundaria: ['Español', 'Matemáticas', 'Ciencias Naturales', 'Ciencias Sociales'], Bachillerato: ['Matemáticas para cálculo', 'Física', 'Lenguaje'] });
  const LEVEL_LABELS = Object.freeze({ 1: 'Fácil', 2: 'Medio', 3: 'Semidifícil', 4: 'Difícil' });
  const lower = value => String(value || '').toLocaleLowerCase('es');
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy;
  }
  function safeRead(storage, key, fallback) {
    try { const result = JSON.parse(storage?.getItem(key) || 'null'); return result ?? fallback; } catch (_) { return fallback; }
  }
  function cleanQuestionText(value) {
    return String(value || '').replace(/\$([^$]*)\$/g, '$1').replace(/\\[a-zA-Z]+/g, '').replace(/<[^>]*>/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  }
  function buildCatalogue(all) {
    const map = new Map();
    for (const q of all) {
      const id = q.themeId || `${q.section}:${q.topic}`;
      if (!map.has(id)) map.set(id, { id, title: q.theme || q.topic, section: q.section, topic: q.topic, count: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0 }, skills: new Set() });
      const item = map.get(id); item.count++; if (item.levels[q.level] !== undefined) item.levels[q.level]++; if (q.skill) item.skills.add(q.skill);
    }
    return [...map.values()].map(i => ({ ...i, skills: [...i.skills] })).sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true }));
  }
  function filterQuestions(all, filters = {}) {
    return all.filter(q => (!filters.section || q.section === filters.section) && (!filters.topic || q.topic === filters.topic) && (!filters.themeId || q.themeId === filters.themeId) && (!filters.level || Number(q.level) === Number(filters.level)) && (!filters.skill || q.skill === filters.skill));
  }
  function cleanAnswer(result = {}) {
    if (!result || typeof result !== 'object' || typeof result.isCorrect !== 'boolean') return null;
    const method = ['exact', 'gemini', 'self'].includes(result.gradingMethod) ? result.gradingMethod : 'exact';
    const answer = { isCorrect: result.isCorrect, gradingMethod: method, openAnswer: String(result.openAnswer || '').slice(0, 8000), selectedOptionId: result.selectedOptionId ?? null, tableAnswers: {} };
    for (const [key, value] of Object.entries(result.tableAnswers || {}).slice(0, 100)) answer.tableAnswers[key] = String(value).slice(0, 300);
    if (Array.isArray(result.shuffledOptions)) answer.optionOrder = result.shuffledOptions.slice(0, 50).map(o => typeof o === 'object' ? o.id : o);
    if (Array.isArray(result.optionOrder)) answer.optionOrder = result.optionOrder.slice(0, 50);
    if (method === 'gemini') { answer.confidence = Math.min(1, Math.max(0, Number(result.confidence) || 0)); answer.modelFeedback = String(result.modelFeedback || '').slice(0, 1200); }
    return answer;
  }
  root.useQuestionBank = () => {
    const { ref, computed, watch } = root.Vue;
    let storage; try { storage = root.localStorage; } catch (_) { storage = null; }
    const allQuestions = Array.isArray(root.EXCOBA_QUESTIONS) ? root.EXCOBA_QUESTIONS : [];
    const byId = new Map(allQuestions.map(q => [String(q.id), q]));
    const bankVersion = String(root.EXCOBA_BANK_META?.version || root.EXCOBA_BANK_VERSION || 'progressive-v1');
    const saved = safeRead(storage, STORAGE_KEY, {});
    const savedValid = saved.version === 2 && saved.bankVersion === bankVersion && Array.isArray(saved.ids);
    const restored = savedValid ? saved.ids.slice(0, 500).map(id => byId.get(String(id))).filter(Boolean) : [];
    const deduped = [...new Map(restored.map(q => [String(q.id), q])).values()];
    const questions = ref(deduped);
    const currentQuestionIndex = ref(Math.min(Math.max(0, Number.isInteger(saved.index) ? saved.index : 0), deduped.length));
    const answeredStatus = ref({});
    if (savedValid && saved.answers && typeof saved.answers === 'object') {
      for (const q of deduped) { const answer = cleanAnswer(saved.answers[q.id]); if (answer) answeredStatus.value[q.id] = answer; }
    }
    const sessionMode = ref(savedValid && saved.mode === 'practice' ? 'practice' : 'exam');
    const sessionFilters = ref(savedValid && saved.filters && typeof saved.filters === 'object' ? saved.filters : {});
    const sessionError = ref(''); const persistenceWarning = ref('');
    const catalogue = buildCatalogue(allQuestions);
    const customBank = ref(null);
    let editorialSession = null;
    const activeSourceQuestions = computed(() => customBank.value ? customBank.value.questions : allQuestions);
    const activeCatalogue = computed(() => customBank.value ? buildCatalogue(customBank.value.questions) : catalogue);
    const getPracticePool = filters => filterQuestions(activeSourceQuestions.value, filters);
    const activeBankCount = computed(() => activeSourceQuestions.value.length);
    const activeBankSource = computed(() => customBank.value ? 'markdown' : 'default');
    const activeBankMeta = computed(() => customBank.value ? customBank.value.meta : { version: bankVersion, title: 'Banco editorial EXCOBA', questionCount: allQuestions.length, source: 'default' });
    const activeBankWarnings = computed(() => customBank.value ? customBank.value.warnings : []);
    const persist = () => {
      if (customBank.value) return;
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify({ version: 2, bankVersion, mode: sessionMode.value, filters: sessionFilters.value, ids: questions.value.map(q => q.id), index: currentQuestionIndex.value, answers: answeredStatus.value }));
        if (!storage) persistenceWarning.value = 'El progreso sólo estará disponible mientras esta pestaña permanezca abierta.';
      } catch (_) { persistenceWarning.value = 'No se pudo guardar el progreso local. Puedes seguir en esta pestaña.'; }
    };
    watch([questions, currentQuestionIndex, answeredStatus, sessionMode, sessionFilters], persist, { deep: true });
    function begin(bank, mode, filters = {}) {
      if (!bank.length) { sessionError.value = 'No hay ejercicios para esta selección.'; return false; }
      questions.value = bank; currentQuestionIndex.value = 0; answeredStatus.value = {}; sessionMode.value = mode; sessionFilters.value = filters; sessionError.value = ''; persist(); return true;
    }
    function loadMarkdownBank(text, label = '') {
      return loadMarkdownBanks([{ text, label }]);
    }
    function loadMarkdownBanks(documents) {
      const parser = root.EXCOBA_MARKDOWN_BANK || (typeof require === 'function' ? require('./markdownBank.js') : null);
      if (!parser || typeof parser.parseMarkdownBank !== 'function') {
        const error = 'El lector de bancos Markdown no está disponible.';
        sessionError.value = error;
        return { ok: false, error };
      }
      try {
        if (!documents.length) throw new Error('Selecciona al menos un archivo Markdown.');
        let questionCount = 0;
        const banks = documents.map(({ text, label }) => {
          let bank;
          try {
            bank = parser.parseMarkdownBank(text, label ? { title: label } : {});
          } catch (error) {
            throw new Error(label ? `${label}: ${error.message}` : error.message);
          }
          questionCount += bank.questions.length;
          if (questionCount > parser.MAX_QUESTIONS) {
            throw new Error(`La selección supera el máximo de ${parser.MAX_QUESTIONS} reactivos.`);
          }
          return bank;
        });
        const parsed = banks.length === 1 ? banks[0] : {
          questions: banks.flatMap(({ questions }, index) => questions.map(question => ({
            ...question,
            id: `${index + 1}:${question.id}`,
            themeId: `${index + 1}:${question.themeId}`
          }))),
          warnings: banks.flatMap(({ meta, warnings }) => warnings.map(warning => `${meta.title}: ${warning}`)),
          meta: {
            version: `md-batch:${banks.map(({ meta }) => meta.version).join(',')}`,
            title: `${banks.length} bancos Markdown`,
            titles: banks.map(({ meta }) => meta.title),
            questionCount,
            source: 'markdown',
            byType: { multiple: 0, open: 0, table: 0 }
          }
        };
        if (banks.length > 1) {
          for (const question of parsed.questions) parsed.meta.byType[question.type]++;
        }
        if (!customBank.value) {
          editorialSession = {
            questions: questions.value,
            index: currentQuestionIndex.value,
            answers: answeredStatus.value,
            mode: sessionMode.value,
            filters: sessionFilters.value
          };
        }
        customBank.value = parsed;
        questions.value = []; currentQuestionIndex.value = 0; answeredStatus.value = {}; sessionFilters.value = {}; sessionError.value = '';
        return { ok: true, count: parsed.questions.length, meta: parsed.meta, warnings: parsed.warnings };
      } catch (error) {
        const message = error && error.message ? error.message : 'No se pudo leer el archivo Markdown.';
        sessionError.value = message;
        return { ok: false, error: message };
      }
    }
    function clearCustomBank() {
      if (editorialSession) {
        questions.value = editorialSession.questions;
        currentQuestionIndex.value = editorialSession.index;
        answeredStatus.value = editorialSession.answers;
        sessionMode.value = editorialSession.mode;
        sessionFilters.value = editorialSession.filters;
        editorialSession = null;
      }
      customBank.value = null;
      sessionError.value = '';
    }
    function buildExamBank() {
      const bank = []; const selected = new Set();
      for (const [section, topics] of Object.entries(SUBTEMA_MAP)) {
        for (const topic of topics) {
          const pool = allQuestions.filter(q => q.section === section && q.topic === topic && !selected.has(q.id));
          if (pool.length < 20) { sessionError.value = `Faltan ejercicios para ${section} · ${topic}. Usa la práctica por tema.`; return false; }
          const subject = [];
          for (let level = 1; level <= 4; level++) subject.push(...shuffle(pool.filter(q => Number(q.level) === level)).slice(0, 5));
          const used = new Set(subject.map(q => q.id));
          subject.push(...shuffle(pool.filter(q => !used.has(q.id))).slice(0, 20 - subject.length));
          const chosen = shuffle(subject).slice(0, 20); chosen.forEach(q => selected.add(q.id)); bank.push(...chosen);
        }
      }
      clearCustomBank();
      return begin(bank, 'exam');
    }
    function buildPracticeBank(filters = {}) {
      const cleanFilters = { section: String(filters.section || ''), topic: String(filters.topic || ''), themeId: String(filters.themeId || ''), level: filters.level ? Number(filters.level) : '', skill: String(filters.skill || ''), count: Math.min(100, Math.max(1, Number(filters.count) || 25)), ordered: filters.ordered === true };
      const pool = getPracticePool(cleanFilters);
      const selected = cleanFilters.ordered ? [...pool].sort((a, b) => Number(a.level) - Number(b.level) || String(a.code).localeCompare(String(b.code), 'es', { numeric: true })) : shuffle(pool);
      return begin(selected.slice(0, cleanFilters.count), 'practice', cleanFilters);
    }
    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);
    const totalQuestions = computed(() => questions.value.length);
    const overallSolvedCount = computed(() => questions.value.filter(q => answeredStatus.value[q.id]).length);
    const progressPercentage = computed(() => totalQuestions.value ? Math.round(overallSolvedCount.value / totalQuestions.value * 100) : 0);
    const correctOptionText = computed(() => {
      const q = currentQuestion.value; if (!q) return '';
      if (q.type === 'open') return q.correctAnswer || '';
      if (q.type === 'table') return (q.rows || []).map(r => `${r.text}: ${r.correct}`).join('\n');
      return q.options?.find(o => o.isCorrect)?.text || '';
    });
    const sectionsData = computed(() => {
      const sections = [];
      questions.value.forEach((q, index) => {
        let section = sections.find(s => s.name === q.section);
        if (!section) { section = { name: q.section, topics: [] }; sections.push(section); }
        let topic = section.topics.find(t => t.name === q.topic);
        if (!topic) { topic = { name: q.topic, questions: [] }; section.topics.push(topic); }
        topic.questions.push({ ...q, originalIndex: index, displayId: index + 1 });
      }); return sections;
    });
    const count = (filter, solved = false) => questions.value.filter(q => filter(q) && (!solved || answeredStatus.value[q.id])).length;
    const sectionFilter = q => q.section === currentQuestion.value?.section;
    const topicFilter = q => sectionFilter(q) && q.topic === currentQuestion.value?.topic;
    const activeSectionTotal = computed(() => count(sectionFilter)); const activeSectionSolved = computed(() => count(sectionFilter, true));
    const activeTopicTotal = computed(() => count(topicFilter)); const activeTopicSolved = computed(() => count(topicFilter, true));
    const activeSectionProgress = computed(() => activeSectionTotal.value ? Math.round(activeSectionSolved.value / activeSectionTotal.value * 100) : 0);
    const activeTopicProgress = computed(() => activeTopicTotal.value ? Math.round(activeTopicSolved.value / activeTopicTotal.value * 100) : 0);
    const sessionStats = computed(() => {
      const stats = { exact: 0, exactCorrect: 0, gemini: 0, geminiCorrect: 0, self: 0, selfCorrect: 0 };
      for (const q of questions.value) { const r = answeredStatus.value[q.id]; if (!r) continue; const method = r.gradingMethod || 'exact'; stats[method]++; if (r.isCorrect) stats[`${method}Correct`]++; }
      return stats;
    });
    const getSectionProgressText = section => `${count(q => lower(q.section) === lower(section), true)}/${count(q => lower(q.section) === lower(section))}`;
    const getTopicProgressText = (section, topic) => `${count(q => lower(q.section) === lower(section) && lower(q.topic) === lower(topic), true)}/${count(q => lower(q.section) === lower(section) && lower(q.topic) === lower(topic))}`;
    function recordAnswer(id, result) {
      if (!questions.value.some(q => String(q.id) === String(id)) || answeredStatus.value[id]) return false;
      const answer = cleanAnswer(result); if (!answer) return false;
      answeredStatus.value[id] = answer; persist(); return true;
    }
    function resetBank() {
      questions.value = []; currentQuestionIndex.value = 0; answeredStatus.value = {}; sessionFilters.value = {}; sessionError.value = '';
      if (customBank.value) return;
      try { storage?.removeItem(STORAGE_KEY); ['excoba_questions', 'excoba_current_index', 'excoba_answered_status'].forEach(key => storage?.removeItem(key)); } catch (_) { /* Session remains usable without persistence. */ }
    }
    return { questions, currentQuestionIndex, currentQuestion, totalQuestions, answeredStatus, sessionMode, sessionFilters, sessionStats, sessionError, persistenceWarning,
      catalogue, activeCatalogue, bankQuestionCount: allQuestions.length, activeBankCount, activeBankSource, activeBankMeta, activeBankWarnings,
      levelLabels: LEVEL_LABELS, getPracticePool, getPracticeCatalogue: filters => buildCatalogue(getPracticePool(filters)),
      loadMarkdownBank, loadMarkdownBanks, clearCustomBank, buildExamBank, buildPracticeBank, recordAnswer, resetBank, correctOptionText, progressPercentage, sectionsData, overallSolvedCount,
      activeSectionTotal, activeSectionSolved, activeSectionProgress, activeTopicTotal, activeTopicSolved, activeTopicProgress, getSectionProgressText, getTopicProgressText, cleanQuestionText };
  };
  root.EXCOBA_BANK_UTILS = { filterQuestions, buildCatalogue, cleanAnswer, safeRead, SUBTEMA_MAP, STORAGE_KEY };
  if (typeof module === 'object' && module.exports) module.exports = root.EXCOBA_BANK_UTILS;
})(typeof window !== 'undefined' ? window : globalThis);
