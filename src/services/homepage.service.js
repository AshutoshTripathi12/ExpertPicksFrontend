// src/services/homepage.service.js
import apiClient from './apiClient';

const API_URL_PREFIX = "/homepage"; // Base for homepage endpoints

/**
 * Gets a paginated list of featured experts.
 * @param {object} params - The query parameters.
 * @param {number} [params.page=0] - The page number to retrieve.
 * @param {number} [params.size=4] - The number of items per page.
 * @returns {Promise} A promise that resolves with the paginated list of featured expert profiles.
 */
export const getFeaturedExperts = async ({ page = 0, size = 4 }) => {
  try {
    const params = new URLSearchParams({ page, size });
    const url = `${API_URL_PREFIX}/featured-experts?${params.toString()}`;
    console.log("Requesting featured experts URL:", `/api${url}`); // For debugging
    const response = await apiClient.get(url);
    return response.data; // This is the Page object from the backend
  } catch (error) {
    console.error("Error fetching featured experts:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets a paginated list of featured recommendations.
 * @param {object} params - The query parameters.
 * @param {number} [params.page=0] - The page number to retrieve.
 * @param {number} [params.size=4] - The number of items per page.
 * @returns {Promise} A promise that resolves with the paginated list of featured recommendations.
 */
export const getFeaturedRecommendations = async ({ page = 0, size = 4 }) => {
  try {
    const params = new URLSearchParams({ page, size });
    const url = `${API_URL_PREFIX}/featured-recommendations?${params.toString()}`;
    console.log("Requesting featured recommendations URL:", `/api${url}`); // For debugging
    const response = await apiClient.get(url);
    return response.data; // This is the Page object from the backend
  } catch (error) {
    console.error("Error fetching featured recommendations:", error.response?.data || error.message);
    throw error;
  }
};