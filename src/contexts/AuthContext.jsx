import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response);
      } catch (err) {
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      const { access_token, user: userData } = response;
      
      localStorage.setItem('authToken', access_token);
      
      // If user data is not included in login response, fetch it separately
      if (!userData) {
        try {
          const userResponse = await authAPI.getCurrentUser();
          setUser(userResponse);
        } catch (userErr) {
          // Still set authentication as successful since we have a token
          setUser({ email: credentials.email }); // Fallback user object
        }
      } else {
        setUser(userData);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      
      const response = await authAPI.register(userData);
      
      const { access_token, user: newUser } = response;
      
      localStorage.setItem('authToken', access_token);
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 