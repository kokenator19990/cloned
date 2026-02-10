// ── Backend API Client with Auto-Auth ──
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject token (SSR-safe)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cloned_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors (with retry guard to prevent infinite loops)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !(error.config as any).__retry) {
      (error.config as any).__retry = true;
      localStorage.removeItem('cloned_token');
      // Auto re-login
      await autoLogin();
      // Retry request once
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

/**
 * Auto-login for local development
 * Uses a persistent local user without UI friction
 */
async function autoLogin(): Promise<string> {
  const localUser = {
    email: 'local@cloned.app',
    password: 'local123',
    displayName: 'Usuario Local',
  };

  try {
    // Try login first
    const { data } = await axios.post(`${api.defaults.baseURL}/auth/login`, {
      email: localUser.email,
      password: localUser.password,
    });
    localStorage.setItem('cloned_token', data.accessToken);
    return data.accessToken;
  } catch {
    // If login fails, register
    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/register`, localUser);
      localStorage.setItem('cloned_token', data.accessToken);
      return data.accessToken;
    } catch (registerError) {
      console.error('Auto-login failed:', registerError);
      throw registerError;
    }
  }
}

/**
 * Ensure user is authenticated before making API calls
 */
export async function ensureAuth(): Promise<void> {
  const token = localStorage.getItem('cloned_token');
  if (!token) {
    await autoLogin();
  }
}

export default api;
