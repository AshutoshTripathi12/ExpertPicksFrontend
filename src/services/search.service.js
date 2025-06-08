// src/services/search.service.js
import apiClient from './apiClient';

const API_URL_PREFIX = "/search";

/**
 * Performs a global search for experts and recommendations.
 * @param {string} query - The search term.
 * @returns {Promise} A promise that resolves with combined search results.
 */
export const globalSearch = async (query) => {
  if (!query || query.trim().length < 2) {
    return Promise.resolve({ experts: [], recommendations: [] });
  }
  try {
    const params = new URLSearchParams({ q: query });
    const response = await apiClient.get(`${API_URL_PREFIX}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error performing global search:", error.response?.data || error.message);
    throw error;
  }
};