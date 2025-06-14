// src/services/health.service.js
import apiClient from './apiClient';

/**
 * Pings the backend to keep the server instance from spinning down.
 * @returns {Promise} A promise that resolves with the health status.
 */
export const pingBackend = async () => {
  try {
    const response = await apiClient.get('/health/ping');
    return response.data;
  } catch (error) {
    // We can just log this error, no need to show it to the user
    console.warn("Backend ping failed. Server might be spinning up or down.", error.message);
    throw error;
  }
};