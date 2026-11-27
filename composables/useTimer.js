/**
 * useTimer - Composable for managing exam and pause timers with LocalStorage persistence.
 * Follows SRP: Only handles time-tracking concerns.
 */
window.useTimer = ({ persist = true } = {}) => {
  const { ref, computed, watch } = Vue;

  let storage;
  if (persist) {
    try { storage = window.localStorage; } catch (_) {}
  }
  const read=key=>{try{const n=Number(storage?.getItem(key));return Number.isFinite(n)&&n>=0?Math.floor(n):0;}catch(_){return 0;}};
  const write=(key,value)=>{try{storage?.setItem(key,value);}catch(_){}};
  const examTime = ref(read('excoba_exam_time'));
  const timerInterval = ref(null);
  const currentPauseTime = ref(0);
  const totalPauseTime = ref(read('excoba_total_pause_time'));
  const pausedTimerInterval = ref(null);

  watch(examTime, (newVal) => {
    write('excoba_exam_time', newVal);
  });

  watch(totalPauseTime, (newVal) => {
    write('excoba_total_pause_time', newVal);
  });

  const formatSeconds = (t) => {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const formattedTime = computed(() => formatSeconds(examTime.value));
  const formattedCurrentPauseTime = computed(() => formatSeconds(currentPauseTime.value));
  const formattedTotalPauseTime = computed(() => formatSeconds(totalPauseTime.value));

  const startTimer = () => {
    stopTimer();
    timerInterval.value = setInterval(() => { examTime.value++; }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  const startPausedTimer = () => {
    currentPauseTime.value = 0;
    stopPausedTimer();
    pausedTimerInterval.value = setInterval(() => {
      currentPauseTime.value++;
      totalPauseTime.value++;
    }, 1000);
  };

  const stopPausedTimer = () => {
    if (pausedTimerInterval.value) {
      clearInterval(pausedTimerInterval.value);
      pausedTimerInterval.value = null;
    }
  };

  const resetTimers = () => {
    stopTimer();
    stopPausedTimer();
    examTime.value = 0;
    currentPauseTime.value = 0;
    totalPauseTime.value = 0;
    try{storage?.removeItem('excoba_exam_time');storage?.removeItem('excoba_total_pause_time');}catch(_){}
  };

  return {
    examTime, formattedTime,
    currentPauseTime, totalPauseTime,
    formattedCurrentPauseTime, formattedTotalPauseTime,
    startTimer, stopTimer,
    startPausedTimer, stopPausedTimer,
    resetTimers
  };
};

