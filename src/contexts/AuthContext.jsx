// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as loginService, logout as logoutService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuthentication = (userData) => {
    if (!userData || !userData.token) {
      logout();
      return;
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    try {
      const userData = await loginService({ email, password });
      setAuthentication(userData);
      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login'; 
  };

  // --- NEW FUNCTION TO UPDATE USER DETAILS ---
  const updateAuthUser = (updatedData) => {
    // This function merges new data with the existing user object
    // and updates both the state and localStorage.
    setUser(currentUser => {
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setAuthentication,
    updateAuthUser // Expose the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};