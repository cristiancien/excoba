/**
 * useTimer - Composable for managing exam and pause timers.
 * Follows SRP: Only handles time-tracking concerns.
 */
window.useTimer = () => {
  const { ref, computed } = Vue;

  const examTime = ref(0);
  const timerInterval = ref(null);
  const currentPauseTime = ref(0);
  const totalPauseTime = ref(0);
  const pausedTimerInterval = ref(null);

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
