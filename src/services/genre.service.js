// src/services/genre.service.js
import apiClient from './apiClient';

/**
 * Fetches the list of all available genres from the backend.
 * @returns {Promise<Array<{id: number, name: string}>>} A promise that resolves with the list of genres.
 */
export const getAllGenres = async () => {
  try {
    const response = await apiClient.get('/genres');
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error.response?.data || error.message);
    // Return an empty array on error so the UI doesn't crash
    return [];
  }
};