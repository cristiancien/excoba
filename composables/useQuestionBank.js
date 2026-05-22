/**
 * useQuestionBank - Composable for question selection and progress tracking with LocalStorage persistence.
 * Follows SRP: Only handles question data management.
 */
window.useQuestionBank = () => {
  const { ref, computed, watch } = Vue;

  const SUBTEMA_MAP = Object.freeze({
    Primaria: ['Español', 'Matemáticas'],
    Secundaria: ['Español', 'Matemáticas', 'Ciencias Naturales', 'Ciencias Sociales'],
    Bachillerato: ['Matemáticas para cálculo', 'Física', 'Lenguaje']
  });

  const QUESTIONS_PER_TOPIC = 20;

  const allQuestions = window.EXCOBA_QUESTIONS || [];
  const questions = ref(JSON.parse(localStorage.getItem('excoba_questions')) || []);
  const currentQuestionIndex = ref(Number(localStorage.getItem('excoba_current_index')) || 0);
  const answeredStatus = ref(JSON.parse(localStorage.getItem('excoba_answered_status')) || {});

  watch(questions, (newVal) => {
    localStorage.setItem('excoba_questions', JSON.stringify(newVal));
  }, { deep: true });

  watch(currentQuestionIndex, (newVal) => {
    localStorage.setItem('excoba_current_index', newVal);
  });

  watch(answeredStatus, (newVal) => {
    localStorage.setItem('excoba_answered_status', JSON.stringify(newVal));
  }, { deep: true });

  // Fisher-Yates shuffle (proper randomization, avoids sort bias)
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const buildExamBank = () => {
    const bank = [];
    for (const [section, topics] of Object.entries(SUBTEMA_MAP)) {
      for (const topic of topics) {
        const pool = allQuestions.filter(q => q.section === section && q.topic === topic);
        bank.push(...shuffle(pool).slice(0, QUESTIONS_PER_TOPIC));
      }
    }
    questions.value = bank;
  };

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] ?? null);
  const totalQuestions = computed(() => questions.value.length);

  const correctOptionText = computed(() => {
    if (!currentQuestion.value) return '';
    if (currentQuestion.value.type === 'open') return currentQuestion.value.correctAnswer || '';
    if (currentQuestion.value.type === 'table') return ''; // No single correct option
    return currentQuestion.value.options?.find(o => o.isCorrect)?.text ?? '';
  });

  const progressPercentage = computed(() => {
    if (!totalQuestions.value) return 0;
    return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100);
  });

  // Build sections data for the sidebar navigation
  const sectionsData = computed(() => {
    const sections = [
      { name: 'Primaria', topics: SUBTEMA_MAP.Primaria.map(n => ({ name: n, questions: [] })) },
      { name: 'Secundaria', topics: SUBTEMA_MAP.Secundaria.map(n => ({ name: n, questions: [] })) },
      { name: 'Bachillerato', topics: SUBTEMA_MAP.Bachillerato.map(n => ({ name: n, questions: [] })) }
    ];
    let displayId = 1;
    questions.value.forEach((q, idx) => {
      const sec = sections.find(s => s.name.toLowerCase() === q.section.toLowerCase());
      if (!sec) return;
      const top = sec.topics.find(t => t.name.toLowerCase() === q.topic.toLowerCase());
      if (!top) return;
      top.questions.push({ ...q, originalIndex: idx, displayId: displayId++ });
    });
    return sections;
  });

  // Progress helpers
  const countByFilter = (filterFn) => questions.value.filter(filterFn).length;

  const activeSectionTotal = computed(() => {
    if (!currentQuestion.value) return 0;
    const s = currentQuestion.value.section.toLowerCase();
    return countByFilter(q => q.section.toLowerCase() === s);
  });

  const activeSectionSolved = computed(() => {
    if (!currentQuestion.value) return 0;
    const s = currentQuestion.value.section.toLowerCase();
    return countByFilter(q => q.section.toLowerCase() === s && answeredStatus.value[q.id]);
  });

  const activeSectionProgress = computed(() =>
    activeSectionTotal.value ? Math.round((activeSectionSolved.value / activeSectionTotal.value) * 100) : 0
  );

  const activeTopicTotal = computed(() => {
    if (!currentQuestion.value) return 0;
    const { section, topic } = currentQuestion.value;
    return countByFilter(q => q.section.toLowerCase() === section.toLowerCase() && q.topic.toLowerCase() === topic.toLowerCase());
  });

  const activeTopicSolved = computed(() => {
    if (!currentQuestion.value) return 0;
    const { section, topic } = currentQuestion.value;
    return countByFilter(q =>
      q.section.toLowerCase() === section.toLowerCase() &&
      q.topic.toLowerCase() === topic.toLowerCase() &&
      answeredStatus.value[q.id]
    );
  });

  const activeTopicProgress = computed(() =>
    activeTopicTotal.value ? Math.round((activeTopicSolved.value / activeTopicTotal.value) * 100) : 0
  );

  const overallSolvedCount = computed(() =>
    Object.keys(answeredStatus.value).filter(k => answeredStatus.value[k]).length
  );

  const getSectionProgressText = (secName) => {
    const sl = secName.toLowerCase();
    const total = countByFilter(q => q.section.toLowerCase() === sl);
    const solved = countByFilter(q => q.section.toLowerCase() === sl && answeredStatus.value[q.id]);
    return `${solved}/${total}`;
  };

  const getTopicProgressText = (secName, topName) => {
    const sl = secName.toLowerCase(), tl = topName.toLowerCase();
    const total = countByFilter(q => q.section.toLowerCase() === sl && q.topic.toLowerCase() === tl);
    const solved = countByFilter(q => q.section.toLowerCase() === sl && q.topic.toLowerCase() === tl && answeredStatus.value[q.id]);
    return `${solved}/${total}`;
  };

  const recordAnswer = (questionId, result) => {
    answeredStatus.value[questionId] = {
      isCorrect: result.isCorrect,
      selectedOptionId: result.selectedOptionId,
      shuffledOptions: result.shuffledOptions
    };
  };

  const resetBank = () => {
    currentQuestionIndex.value = 0;
    answeredStatus.value = {};
    localStorage.removeItem('excoba_questions');
    localStorage.removeItem('excoba_current_index');
    localStorage.removeItem('excoba_answered_status');
  };

  // Text cleaner for sidebar tooltips (DRY: single source of truth)
  const cleanQuestionText = (text) => {
    if (!text) return '';
    return text
      .replace(/\$(.*?)\$/g, '$1')
      .replace(/\\(.*?)\b/g, '')
      .replace(/<br>/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\*\*/g, '')
      .trim();
  };

  return {
    questions, currentQuestionIndex, currentQuestion, totalQuestions,
    correctOptionText, progressPercentage,
    answeredStatus, recordAnswer, resetBank, buildExamBank,
    sectionsData,
    activeSectionTotal, activeSectionSolved, activeSectionProgress,
    activeTopicTotal, activeTopicSolved, activeTopicProgress,
    overallSolvedCount, getSectionProgressText, getTopicProgressText,
    cleanQuestionText
  };
};
