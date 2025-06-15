// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserType } from '../services/admin.service';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import Button from '../components/Button';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth();

  // State to manage which user's role is being changed
  const [userRoles, setUserRoles] = useState({});

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data || []);
      // Initialize the local role state for each user
      const initialRoles = {};
      data.forEach(u => {
        initialRoles[u.id] = u.userType;
      });
      setUserRoles(initialRoles);
    } catch (err) {
      setError('Failed to fetch user data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = (userId, newRole) => {
    setUserRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateUser = async (userId) => {
    const newRole = userRoles[userId];
    if (!newRole) {
      alert("No new role selected.");
      return;
    }
    try {
      await updateUserType(userId, { userType: newRole });
      alert(`User ${userId}'s role has been updated to ${newRole}.`);
      // Optionally, refetch users to confirm the change from the server
      fetchUsers();
    } catch (err) {
      alert('Failed to update user role. Please try again.');
      console.error("Update user role error:", err);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">Admin Dashboard</h1>
        <p className="mt-1 text-text-muted">Manage all users and their roles.</p>
      </div>

      {/* Styled Table Container */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-border-color sm:rounded-lg">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-surface">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Name / Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Current Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Change Role</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Update</span></th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border-color">
                  {users.map((u) => (
                    // Exclude the admin themselves from the list to prevent self-lockout
                    adminUser?.id !== u.id && (
                      <tr key={u.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={u.profilePhotoUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(u.name)}`} alt={u.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-text-main">{u.name}</div>
                              <div className="text-sm text-text-muted">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {u.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={userRoles[u.id] || u.userType}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-border-color focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                          >
                            <option value="POTENTIAL">Potential</option>
                            <option value="REGULAR_USER">Regular User</option>
                            <option value="EXPERT_PENDING">Expert Pending</option>
                            <option value="EXPERT_VERIFIED">Expert Verified</option>
                            <option value="BRAND_PENDING">Brand Pending</option>
                            <option value="BRAND_VERIFIED">Brand Verified</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="primary" onClick={() => handleUpdateUser(u.id)}>
                            Update
                          </Button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;