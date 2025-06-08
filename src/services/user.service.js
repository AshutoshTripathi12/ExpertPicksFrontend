// src/services/user.service.js
import apiClient from './apiClient';

// Define the base prefix for user-related API endpoints.
// The apiClient will prepend "/api", so these become "/api/users".
const USER_API_PREFIX = "/users";

/**
 * Gets the current logged-in user's profile (your own profile).
 * Calls GET /api/users/me
 * @returns {Promise} A promise that resolves with the user profile data.
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(`${USER_API_PREFIX}/me`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user profile:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates the current logged-in user's profile.
 * Calls PUT /api/users/me
 * @param {object} profileData - The profile data to update.
 * @returns {Promise} A promise that resolves with the updated user profile data.
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put(`${USER_API_PREFIX}/me`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets a user's public profile by their ID.
 * Calls GET /api/users/{userId}/public-profile
 * @param {string|number} userId - The ID of the user.
 * @returns {Promise} A promise that resolves with the public user profile data.
 */
export const getPublicUserProfile = async (userId) => {
  try {
    // Ensure userId is correctly interpolated into the string
    const url = `${USER_API_PREFIX}/${userId}/public-profile`;
    console.log("Requesting public profile URL:", `/api${url}`); // For debugging the exact URL
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public profile for user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Follows a user.
 * Calls POST /api/users/{userIdToFollow}/follow
 * @param {string|number} userIdToFollow - The ID of the user to follow.
 */
export const followUser = async (userIdToFollow) => {
  try {
    const url = `${USER_API_PREFIX}/${userIdToFollow}/follow`;
    console.log("Requesting follow URL:", `/api${url}`); // For debugging
    const response = await apiClient.post(url);
    return response.data;
  } catch (error) {
    console.error(`Error following user ${userIdToFollow}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Unfollows a user.
 * Calls DELETE /api/users/{userIdToUnfollow}/unfollow
 * @param {string|number} userIdToUnfollow - The ID of the user to unfollow.
 */
export const unfollowUser = async (userIdToUnfollow) => {
  try {
    const url = `${USER_API_PREFIX}/${userIdToUnfollow}/unfollow`;
    console.log("Requesting unfollow URL:", `/api${url}`); // For debugging
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error(`Error unfollowing user ${userIdToUnfollow}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets the paginated list of followers for a user.
 * @param {string|number} userId - The ID of the user.
 * @param {number} page - The page number to fetch (0-indexed).
 * @param {number} size - The number of items per page.
 */
export const getFollowersList = async (userId, page = 0, size = 15) => {
    try {
        const params = new URLSearchParams({ page, size });
        const response = await apiClient.get(`${USER_API_PREFIX}/${userId}/followers?${params.toString()}`);
        return response.data; // This will be the Page object
    } catch (error) {
        console.error(`Error fetching followers for user ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};
/***
 * Gets the paginated list of users someone is following.
 * @param {string|number} userId - The ID of the user.
 * @param {number} page - The page number to fetch (0-indexed).
 * @param {number} size - The number of items per page.
 */
export const getFollowingList = async (userId, page = 0, size = 15) => {
    try {
        const params = new URLSearchParams({ page, size });
        const response = await apiClient.get(`${USER_API_PREFIX}/${userId}/following?${params.toString()}`);
        return response.data; // This will be the Page object
    } catch (error) {
        console.error(`Error fetching following list for user ${userId}:`, error.response?.data || error.message);
        throw error;
    }

  
};