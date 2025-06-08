import apiClient from './apiClient';

const API_URL_PREFIX = "/recommendations"; // Base URL for general recommendations
const USER_API_PREFIX = "/users"; // Base URL for user-specific lists like bookmarks

/**
 * Handles all API calls related to recommendations and user bookmarks.
 */
// --- Recommendation CRUD Operations ---

/**
 * Creates a new recommendation.
 * @param {Object} recommendationData - The data for the new recommendation.
 * @returns {Promise<Object>} The created recommendation data from the API.
 * @throws {Error} If the API call fails.
 */
export const createRecommendation = async (recommendationData) => {
  try {
    const response = await apiClient.post(API_URL_PREFIX, recommendationData);
    return response.data;
  } catch (error) {
    console.error("Error creating recommendation:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all recommendations, with optional filtering by genre.
 * @param {string} [genre] - Optional genre to filter recommendations.
 * @returns {Promise<Array<Object>>} A list of recommendations.
 * @throws {Error} If the API call fails.
 */
export const getAllRecommendations = async ({ genre, keyword, page = 0, size = 12 }) => {
  try {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (keyword) params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    params.append('sort', 'createdAt,desc'); // Default sort by newest

    const response = await apiClient.get(`${API_URL_PREFIX}?${params.toString()}`);
    return response.data; // This is now the Page object
  } catch (error) {
    console.error("Error fetching all recommendations:", error.response?.data || error.message);
    throw error;
  }
};
/**
 * Fetches a single recommendation by its ID.
 * @param {string|number} id - The ID of the recommendation to fetch.
 * @returns {Promise<Object>} The recommendation data.
 * @throws {Error} If the API call fails or recommendation is not found.
 */
export const getRecommendationById = async (id) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.get(`${API_URL_PREFIX}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommendation with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all recommendations made by a specific user.
 * @param {string|number} userId - The ID of the user whose recommendations to fetch.
 * @returns {Promise<Array<Object>>} A list of recommendations by the user.
 * @throws {Error} If the API call fails.
 */
export const getRecommendationsByUserId = async (userId) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.get(`${API_URL_PREFIX}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recommendations for user ID ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing recommendation.
 * @param {string|number} id - The ID of the recommendation to update.
 * @param {Object} recommendationData - The updated data for the recommendation.
 * @returns {Promise<Object>} The updated recommendation data.
 * @throws {Error} If the API call fails.
 */
export const updateRecommendation = async (id, recommendationData) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.put(`${API_URL_PREFIX}/${id}`, recommendationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating recommendation with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a recommendation by its ID.
 * @param {string|number} id - The ID of the recommendation to delete.
 * @returns {Promise<Object>} The API response indicating success.
 * @throws {Error} If the API call fails.
 */
export const deleteRecommendation = async (id) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.delete(`${API_URL_PREFIX}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting recommendation with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};



// --- Bookmark Functions ---

/**
 * Adds a bookmark for a recommendation for the currently logged-in user.
 * Calls POST /api/recommendations/{recommendationId}/bookmark
 * @param {string|number} recommendationId - The ID of the recommendation to bookmark.
 * @returns {Promise<Object>} The API response data.
 * @throws {Error} If the API call fails.
 */
export const addBookmark = async (recommendationId) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.post(`${API_URL_PREFIX}/${recommendationId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error(`Error adding bookmark for recommendation ${recommendationId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Removes a bookmark for a recommendation for the currently logged-in user.
 * Calls DELETE /api/recommendations/{recommendationId}/bookmark
 * @param {string|number} recommendationId - The ID of the recommendation to unbookmark.
 * @returns {Promise<Object>} The API response data.
 * @throws {Error} If the API call fails.
 */
export const removeBookmark = async (recommendationId) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.delete(`${API_URL_PREFIX}/${recommendationId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error(`Error removing bookmark for recommendation ${recommendationId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets all bookmarked recommendations for the currently logged-in user.
 * Calls GET /api/users/me/bookmarks
 * @returns {Promise<Array<Object>>} A list of bookmarked recommendations.
 * @throws {Error} If the API call fails.
 */
export const getMyBookmarkedRecommendations = async () => {
  try {
    // Corrected URL construction using USER_API_PREFIX
    const response = await apiClient.get(`${USER_API_PREFIX}/me/bookmarks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked recommendations:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Checks if a specific recommendation is bookmarked by the current user.
 * Calls GET /api/recommendations/{recommendationId}/is-bookmarked
 * @param {string|number} recommendationId - The ID of the recommendation to check.
 * @returns {Promise<{isBookmarked: boolean}>} An object indicating if the recommendation is bookmarked.
 * @throws {Error} If the API call fails (may return { isBookmarked: false } in catch).
 */
export const isRecommendationBookmarked = async (recommendationId) => {
  try {
    // Corrected URL construction using template literals
    const response = await apiClient.get(`${API_URL_PREFIX}/${recommendationId}/is-bookmarked`);
    return response.data; // Expected to be { isBookmarked: true/false }
  } catch (error) {
    console.error(`Error checking bookmark status for recommendation ${recommendationId}:`, error.response?.data || error.message);
    // As per your comment, returning false on error for simplicity.
    return { isBookmarked: false };
  }
};