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

  let storage;try{storage=window.localStorage;}catch(_){}
  const read=(key,fallback)=>{try{return JSON.parse(storage?.getItem(key)||'null')??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>{try{storage?.setItem(key,value);}catch(_){}};
  const savedScore=Number(read('excoba_score',0));
  const savedHints=read('excoba_hints_used',{});
  const score = ref(Number.isFinite(savedScore)?savedScore:0);
  const hintsUsedStatus = ref(savedHints&&typeof savedHints==='object'&&!Array.isArray(savedHints)?savedHints:{});

  watch(score, (newVal) => {
    write('excoba_score', newVal);
  });

  watch(hintsUsedStatus, (newVal) => {
    write('excoba_hints_used', JSON.stringify(newVal));
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
    try{storage?.removeItem('excoba_score');storage?.removeItem('excoba_hints_used');}catch(_){}
  };

  return { score, hintsUsedStatus, POINTS, applyHint, applyAnswer, resetScoring };
};

