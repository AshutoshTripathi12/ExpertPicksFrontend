// src/services/collaboration.service.js
import apiClient from './apiClient';

const API_URL_PREFIX = "/collaborations";

/**
 * Sends a new collaboration request to a user.
 * @param {object} requestData - { receiverUserId: Long, message: String }
 */
export const sendCollaborationRequest = async (requestData) => {
  try {
    const response = await apiClient.post(`${API_URL_PREFIX}/request`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error sending collaboration request:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Responds to a collaboration request (Accept/Decline).
 * @param {Long} requestId - The ID of the request to respond to.
 * @param {object} statusData - { status: "ACCEPTED" | "DECLINED" }
 */
export const respondToCollaborationRequest = async (requestId, statusData) => {
  try {
    const response = await apiClient.put(`${API_URL_PREFIX}/requests/${requestId}`, statusData);
    return response.data;
  } catch (error) {
    console.error(`Error responding to request ${requestId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets all incoming collaboration requests for the logged-in user.
 */
export const getIncomingRequests = async () => {
  try {
    const response = await apiClient.get(`${API_URL_PREFIX}/requests/incoming`);
    return response.data;
  } catch (error) {
    console.error("Error fetching incoming requests:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets all outgoing collaboration requests for the logged-in user.
 */
export const getOutgoingRequests = async () => {
  try {
    const response = await apiClient.get(`${API_URL_PREFIX}/requests/outgoing`);
    return response.data;
  } catch (error) {
    console.error("Error fetching outgoing requests:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets the count of pending incoming requests for the logged-in user (for notifications).
 */
export const getPendingRequestCount = async () => {
  try {
    const response = await apiClient.get(`${API_URL_PREFIX}/requests/incoming/pending-count`);
    return response.data; // Expected { pendingCount: number }
  } catch (error) {
    console.error("Error fetching pending request count:", error.response?.data || error.message);
    // Return 0 on error so UI doesn't break
    return { pendingCount: 0 };
  }
};