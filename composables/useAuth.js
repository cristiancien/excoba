/**
 * useAuth - Composable for PocketBase authentication and user session.
 * Follows SoC: Handled independently from scoring/bank logic.
 */
window.useAuth = () => {
  const { ref, computed } = Vue;

  const user = ref(null);
  const token = ref(null);
  const authMode = ref('login'); // 'login' | 'register'
  const authError = ref('');
  const isLoading = ref(false);

  const BASE_URL = 'http://localhost:8090/api';

  const isAuthenticated = computed(() => !!user.value);

  const saveSession = (userData, authToken) => {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('excoba_user', JSON.stringify(userData));
    localStorage.setItem('excoba_token', authToken);
  };

  const clearSession = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('excoba_user');
    localStorage.removeItem('excoba_token');
  };

  const login = async (identity, password) => {
    authError.value = '';
    isLoading.value = true;
    try {
      const res = await fetch(`${BASE_URL}/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Credenciales incorrectas');
      }

      const data = await res.json();
      saveSession(data.record, data.token);
      return true;
    } catch (err) {
      authError.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (email, password, name) => {
    authError.value = '';
    isLoading.value = true;
    try {
      // 1. Create account
      const username = 'excoba_' + Math.random().toString(36).substring(2, 8);
      const regRes = await fetch(`${BASE_URL}/collections/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm: password,
          username,
          name
        })
      });

      if (!regRes.ok) {
        const errData = await regRes.json();
        throw new Error(errData.message || 'Error al crear la cuenta');
      }

      // 2. Automate login immediately
      return await login(email, password);
    } catch (err) {
      authError.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const socialLogin = async (provider) => {
    authError.value = '';
    isLoading.value = true;
    try {
      // Premium simulated OAuth2 flow for local convenience
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        id: 'social_' + provider + '_' + Math.random().toString(36).substring(2, 6),
        email: `social_${provider}@excoba.edu`,
        username: `${provider}_student`,
        name: `Estudiante de ${provider.toUpperCase()}`
      };
      const mockToken = 'mock_oauth_token_' + Math.random().toString(36).substring(2, 10);
      saveSession(mockUser, mockToken);
      return true;
    } catch (err) {
      authError.value = 'Error en autenticación social';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const initSession = () => {
    const storedUser = localStorage.getItem('excoba_user');
    const storedToken = localStorage.getItem('excoba_token');
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
  };

  return {
    user,
    token,
    authMode,
    authError,
    isLoading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    logout: clearSession,
    initSession
  };
};
