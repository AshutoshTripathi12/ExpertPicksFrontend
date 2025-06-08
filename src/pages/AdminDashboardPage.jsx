// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserType } from '../services/admin.service';

// Define UserTypes available for selection.
// These should match the string values of your backend UserType enum.
const USER_TYPES = ["POTENTIAL", "EXPERT_PENDING", "EXPERT_VERIFIED", "BRAND_PENDING", "BRAND_VERIFIED", "ADMIN"];

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [actionLoading, setActionLoading] = useState(false); // For update action

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data || []); // Ensure users is an array
    } catch (err) {
      setError('Failed to fetch users. You might not have admin privileges, or an error occurred.');
      console.error("Fetch users error details:", err.response?.data || err.message);
      setUsers([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUserType = async (userId, newType) => {
    if (!newType) {
      alert("Please select a valid user type.");
      return;
    }
    setActionLoading(true);
    try {
      const updatedUser = await updateUserType(userId, { userType: newType });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, userType: updatedUser.userType, roles: updatedUser.roles } : user
        )
      );
      setEditingUserId(null);
      alert(`User ${userId}'s type updated to ${newType} successfully.`);
    } catch (err) {
      setError(`Failed to update user type for user ${userId}.`);
      console.error("Update user type error details:", err.response?.data || err.message);
      alert(`Error updating user type for user ${userId}. Check console for details.`);
    } finally {
      setActionLoading(false);
    }
  };

  const startEditUserType = (user) => {
    setEditingUserId(user.id);
    setSelectedUserType(user.userType); // Pre-select current type
    setError(''); // Clear previous errors
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading users list...</div>;
  }

  if (error && users.length === 0) { // Show error prominently if user list fails to load
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard - User Management</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {users.length === 0 && !isLoading ? (
        <p>No users found or unable to load users.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.userType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUserId === user.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedUserType}
                          onChange={(e) => setSelectedUserType(e.target.value)}
                          disabled={actionLoading}
                          className="block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          {USER_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateUserType(user.id, selectedUserType)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditUserType(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Change Type
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;