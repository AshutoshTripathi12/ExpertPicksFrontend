// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import EditProfileForm from '../components/EditProfileForm'; // Import the form

const ProfilePage = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (authUser && !authLoading) { // Ensure authUser is available and auth check is done
      setIsLoading(true);
      setError('');
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to fetch profile. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading) { // If auth check is done and no user
        setError('You must be logged in to view this page.');
        setIsLoading(false);
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (updatedData) => {
    setEditFormLoading(true);
    setError('');
    try {
      const data = await updateUserProfile(updatedData);
      setProfile(data); // Update profile with response from server
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      setError('Failed to update profile. Please ensure data is correct and try again.');
      console.error(err);
    } finally {
      setEditFormLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (error && !profile) { // Show error if profile couldn't be loaded at all
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (!authUser || !profile) { // Should be covered by fetchProfile logic, but good fallback
      return <div className="text-center p-10 text-red-600">Profile not available or you are not logged in.</div>;
  }

  // Helper to parse social media links if they are a JSON string
  const parseSocialLinks = (linksString) => {
    if (!linksString) return {};
    try {
      return JSON.parse(linksString);
    } catch (e) {
      console.warn("Could not parse socialMediaLinks JSON:", linksString);
      return { raw: linksString }; // Or return an empty object or handle error appropriately
    }
  };
  const socialLinks = parseSocialLinks(profile.socialMediaLinks);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1>

      {error && isEditing && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {isEditing ? (
        <EditProfileForm
          currentUserProfile={profile}
          onSave={handleSaveProfile}
          onCancel={() => { setIsEditing(false); setError(''); }}
          isLoading={editFormLoading}
        />
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt={profile.name} className="rounded-full w-40 h-40 object-cover mx-auto shadow-md" />
              ) : (
                <div className="rounded-full w-40 h-40 bg-gray-300 flex items-center justify-center mx-auto text-gray-500 text-4xl shadow-md">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-700">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member Type: <span className="font-medium text-indigo-500">{profile.userType}</span></p>
              <p className="text-sm text-gray-500">Joined: {new Date(profile.registrationTimestamp).toLocaleDateString()}</p>
            </div>
          </div>

          {profile.introduction && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Introduction</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{profile.introduction}</p>
            </div>
          )}

          {profile.expertiseDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Expertise</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{profile.expertiseDescription}</p>
            </div>
          )}

          {profile.socialMediaLinks && (
             <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Connect</h3>
              <ul className="list-none p-0">
                {Object.entries(socialLinks).map(([key, value]) => (
                  <li key={key} className="text-gray-600">
                    <span className="font-medium capitalize">{key}: </span> 
                    <a href={value.startsWith('http') ? value : `//${value}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                        {value}
                    </a>
                  </li>
                ))}
                {socialLinks.raw && !Object.keys(socialLinks).find(k => k !== 'raw') && (
                    <li className="text-gray-600">Raw Data: {socialLinks.raw} (Could not parse as JSON objects)</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;