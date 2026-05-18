/**
 * useTheme - Composable for dark/light theme toggling.
 * Follows SRP: Only handles theming concerns.
 */
window.useTheme = () => {
  const { ref } = Vue;

  const isDarkMode = ref(false);

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle('dark-theme', isDarkMode.value);
  };

  return { isDarkMode, toggleTheme };
};
