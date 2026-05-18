/**
 * useScoring - Composable for score and hint management.
 * Follows SRP: Only handles scoring concerns.
 * 
 * Scoring Rules:
 *   +10 pts per correct answer
 *   -2  pts per incorrect answer
 *   -3  pts per hint used (only charged once per question)
 *   Score can go negative.
 */
window.useScoring = () => {
  const { ref } = Vue;

  const POINTS = Object.freeze({
    CORRECT: 10,
    INCORRECT: -2,
    HINT: -3
  });

  const score = ref(0);
  const hintsUsedStatus = ref({});

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
  };

  return { score, hintsUsedStatus, POINTS, applyHint, applyAnswer, resetScoring };
};
