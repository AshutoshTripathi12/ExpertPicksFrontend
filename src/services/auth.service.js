// src/services/auth.service.js
import apiClient from './apiClient';

const API_URL = "/auth/"; // Base for auth endpoints, apiClient prepends /api

/**
 * Registers a new user.
 * @param {object} userData - { name, email, password }
 */
export const register = (userData) => {
  return apiClient.post(API_URL + "register", userData);
};

/**
 * Logs in a user.
 * @param {object} credentials - { email, password }
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(API_URL + "login", credentials);
    if (response.data.token) {
      // Store user details and JWT token in local storage
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data; // Return the data part which includes the token and user info
  } catch (error) {
    throw error;
  }
};

/**
 * Logs out the current user.
 * Removes user data and token from local storage.
 */
export const logout = () => {
  localStorage.removeItem("user");
  // We might want to call a backend logout endpoint here in the future if needed
};

/**
 * Gets the current user's data (including token) from local storage.
 * @returns {object|null} The user data object or null if not found.
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

/**
 * Gets the current user's JWT token from local storage.
 * @returns {string|null} The JWT token or null if not found.
 */
export const getToken = () => {
    const user = getCurrentUser();
    return user ? user.token : null;
};