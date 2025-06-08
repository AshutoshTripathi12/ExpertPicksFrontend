// src/services/admin.service.js
import apiClient from './apiClient';

const API_URL_PREFIX = "/admin"; // Base for admin endpoints, apiClient prepends /api

/**
 * Gets all users (for admin).
 * @returns {Promise} A promise that resolves with the list of users.
 */
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get(`${API_URL_PREFIX}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates a user's type (for admin).
 * @param {Long} userId - The ID of the user to update.
 * @param {object} userTypeData - The data containing the new userType (e.g., { userType: "EXPERT_VERIFIED" }).
 * @returns {Promise} A promise that resolves with the updated user profile data.
 */
export const updateUserType = async (userId, userTypeData) => {
  try {
    const response = await apiClient.put(`${API_URL_PREFIX}/users/${userId}/update-type`, userTypeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user type for user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};