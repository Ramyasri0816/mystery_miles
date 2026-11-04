import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      // Token might be expired or invalid
      setUser(null);
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
    }
  };

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();
    if (storedUser && token) {
      setUser(storedUser);
      // Verify with backend in background
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...data.user }));
    return data;
  };

  const updatePreferences = async (preferencesData) => {
    const data = await authService.updatePreferences(preferencesData);
    setUser((prev) => ({
      ...prev,
      travelPreferences: data.travelPreferences || preferencesData
    }));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
