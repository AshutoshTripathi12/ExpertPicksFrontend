import apiClient from './apiClient';

// Helper function to store user data with token in localStorage
const storeUserData = (userData) => {
    if (userData && userData.token) {
        localStorage.setItem("user", JSON.stringify(userData));
    }
};

// Makes API call to register, then stores the returned user data
export const register = async (credentials) => {
    const response = await apiClient.post('/auth/register', credentials);
    storeUserData(response.data);
    return response.data;
};

// Makes API call to login, then stores the returned user data
export const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    storeUserData(response.data);
    return response.data;
};

// Removes user data from localStorage
export const logout = () => {
    localStorage.removeItem("user");
};

// Retrieves user data from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Could not parse user from localStorage", e);
            return null;
        }
    }
    return null;
};