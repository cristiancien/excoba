/**
 * useScoring - Composable for score and hint management with LocalStorage persistence.
 * Follows SRP: Only handles scoring concerns.
 */
window.useScoring = () => {
  const { ref, watch } = Vue;

  const POINTS = Object.freeze({
    CORRECT: 10,
    INCORRECT: -2,
    HINT: -3
  });

  const score = ref(Number(localStorage.getItem('excoba_score')) || 0);
  const hintsUsedStatus = ref(JSON.parse(localStorage.getItem('excoba_hints_used')) || {});

  watch(score, (newVal) => {
    localStorage.setItem('excoba_score', newVal);
  });

  watch(hintsUsedStatus, (newVal) => {
    localStorage.setItem('excoba_hints_used', JSON.stringify(newVal));
  }, { deep: true });

  const applyHint = (questionId) => {
    if (!hintsUsedStatus.value[questionId]) {
      score.value += POINTS.HINT;
      hintsUsedStatus.value[questionId] = true;
    }
  };

  const applyAnswer = (isCorrect) => {
    score.value += isCorrect ? POINTS.CORRECT : POINTS.INCORRECT;
  };

  const resetScoring = () => {
    score.value = 0;
    hintsUsedStatus.value = {};
    localStorage.removeItem('excoba_score');
    localStorage.removeItem('excoba_hints_used');
  };

  return { score, hintsUsedStatus, POINTS, applyHint, applyAnswer, resetScoring };
};
