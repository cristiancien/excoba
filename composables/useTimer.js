/**
 * useTimer - Composable for managing exam and pause timers with LocalStorage persistence.
 * Follows SRP: Only handles time-tracking concerns.
 */
window.useTimer = () => {
  const { ref, computed, watch } = Vue;

  const examTime = ref(Number(localStorage.getItem('excoba_exam_time')) || 0);
  const timerInterval = ref(null);
  const currentPauseTime = ref(0);
  const totalPauseTime = ref(Number(localStorage.getItem('excoba_total_pause_time')) || 0);
  const pausedTimerInterval = ref(null);

  watch(examTime, (newVal) => {
    localStorage.setItem('excoba_exam_time', newVal);
  });

  watch(totalPauseTime, (newVal) => {
    localStorage.setItem('excoba_total_pause_time', newVal);
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
    localStorage.removeItem('excoba_exam_time');
    localStorage.removeItem('excoba_total_pause_time');
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
