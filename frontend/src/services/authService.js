import api from './api';

export const authService = {
  async register({ name, email, password }) {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.token) {
      localStorage.setItem('mm_token', res.data.token);
      localStorage.setItem('mm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('mm_token', res.data.token);
      localStorage.setItem('mm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    if (res.data?.user) {
      localStorage.setItem('mm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async updateProfile({ name, bio, avatar }) {
    const res = await api.put('/auth/profile', { name, bio, avatar });
    if (res.data?.user) {
      localStorage.setItem('mm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async updatePreferences(preferences) {
    const res = await api.put('/auth/preferences', preferences);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
    }
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('mm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('mm_token');
  }
};

export default authService;
