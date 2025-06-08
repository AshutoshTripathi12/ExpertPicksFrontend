// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as loginService, logout as logoutService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Will store the user object from localStorage/login response
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // To handle initial check

  useEffect(() => {
    // Check for user on initial load
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await loginService({ email, password }); // userData from service includes token
      setUser(userData);
      setIsAuthenticated(true);
      return userData; // Return user data for potential use in component
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-throw to be caught by the login form
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
    // Potentially redirect using useNavigate if useLogout hook is created
  };

  const value = {
    user,
    isAuthenticated,
    isLoading, // Expose isLoading so components can wait for auth check
    login,
    logout,
    getToken: () => user ? user.token : null // Convenience function
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};