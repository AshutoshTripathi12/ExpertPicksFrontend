import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getFollowersList, getFollowingList } from '../services/user.service';
import { getRecommendationsByUserId, deleteRecommendation } from '../services/recommendation.service';
import { useAuth } from '../contexts/AuthContext';
import EditProfileForm from '../components/EditProfileForm';
import RecommendationCard from '../components/RecommendationCard';
import VerifiedBadge from '../components/VerifiedBadge';
import Loader from '../components/Loader';
import UserListCard from '../components/UserListCard';
import Button from '../components/Button';

const ProfilePage = () => {
  const { user: authUser, isLoading: authLoading, updateAuthUser } = useAuth();
  const navigate = useNavigate();

  // State for all data on this page
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllProfileData = useCallback(async () => {
    if (!authUser?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const [profileData, recsData, followersData, followingData] = await Promise.all([
        getUserProfile(),
        getRecommendationsByUserId(authUser.id),
        getFollowersList(authUser.id, 0, 100),
        getFollowingList(authUser.id, 0, 100)
      ]);
      
      setProfile(profileData);
      setRecommendations(recsData || []);
      setFollowers(followersData?.content || []);
      setFollowing(followingData?.content || []);

    } catch (err) {
      setError('Failed to load your profile dashboard. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchAllProfileData();
    }
  }, [authLoading, authUser, fetchAllProfileData]);
  
  const handleSaveProfile = async (updatedData) => {
    setIsSaving(true);
    try {
      const data = await updateUserProfile(updatedData);
      setProfile(data);
      updateAuthUser({ name: data.name, profilePhotoUrl: data.profilePhotoUrl });
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile. Please try again.');
      console.error("Update profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecommendation = async (recommendationId) => {
    if (window.confirm('Are you sure you want to permanently delete this recommendation?')) {
      try {
        await deleteRecommendation(recommendationId);
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
      } catch (err) {
        alert('Error: Could not delete the recommendation.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (authLoading || isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 bg-red-100 p-6 rounded-md shadow">{error}</div>;
  }
  
  if (!profile) {
    return <div className="text-center p-10 text-text-muted">Could not load profile.</div>;
  }

  const isVerified = profile.userType === 'EXPERT_VERIFIED' || profile.userType === 'BRAND_VERIFIED';

  const TabButton = ({ tabName, label, count }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setIsEditing(false);
      }}
      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabName ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'}`}
    >
      {label}
      {count !== undefined && <span className="ml-2 inline-block py-0.5 px-2.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">{count}</span>}
    </button>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-6">
        <img
          src={profile.profilePhotoUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(profile.name || 'User')}`}
          alt={profile.name}
          className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full shadow-lg border-4 border-white"
        />
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h1 className="text-3xl font-bold text-text-main">{profile.name}</h1>
            {isVerified && <VerifiedBadge size={6} />}
          </div>
          <p className="text-text-muted mt-1">{profile.email}</p>
        </div>
      </header>

      {/* Profile Navigation Bar (Tabs) */}
      <div className="border-b border-border-color mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton tabName="recommendations" label="My Recommendations" count={recommendations.length} />
          <TabButton tabName="followers" label="Followers" count={followers.length} />
          <TabButton tabName="following" label="Following" count={following.length} />
          <TabButton tabName="settings" label="Account Settings" />
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'recommendations' && (
          recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {recommendations.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onEdit={() => navigate(`/edit-recommendation/${rec.id}`)}
                  onDelete={() => handleDeleteRecommendation(rec.id)}
                  showActionsAsAuthor={true}
                />
              ))}
            </div>
          ) : <p className="text-center text-text-muted py-10">You have not created any recommendations yet.</p>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {followers.length > 0 ? followers.map(user => <UserListCard key={user.id} user={user} />) : <p className="text-center text-text-muted py-10">You don't have any followers yet.</p>}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {following.length > 0 ? following.map(user => <UserListCard key={user.id} user={user} />) : <p className="text-center text-text-muted py-10">You are not following anyone yet.</p>}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            {isEditing ? (
              <EditProfileForm
                currentUserProfile={profile}
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
                isLoading={isSaving}
              />
            ) : (
              <div className="bg-background shadow-lg rounded-lg p-6 md:p-8 border border-border-color">
                <div className="flex justify-between items-center border-b border-border-color pb-4 mb-6">
                  <h2 className="text-2xl font-semibold text-text-main">Account Details</h2>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <p className="font-medium text-text-muted col-span-1">Name</p>
                    <p className="text-text-main col-span-2">{profile.name || "-"}</p>
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-border-color">
                    <p className="font-medium text-text-muted col-span-1">Email</p>
                    <p className="text-text-main col-span-2">{profile.email}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-border-color">
                    <p className="font-medium text-text-muted col-span-1">Bio/Introduction</p>
                    <p className="text-text-main col-span-2 whitespace-pre-wrap">{profile.introduction || "Not provided."}</p>
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-border-color">
                    <p className="font-medium text-text-muted col-span-1">Expertise</p>
                    <p className="text-text-main col-span-2">{profile.expertiseDescription || "Not provided."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-border-color">
                    <p className="font-medium text-text-muted col-span-1">Website</p>
                    <p className="text-text-main col-span-2">{profile.companyWebsite ? <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{profile.companyWebsite}</a> : "Not provided."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;