import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicUserProfile, followUser, unfollowUser } from '../services/user.service';
import { getRecommendationsByUserId } from '../services/recommendation.service';
import { sendCollaborationRequest } from '../services/collaboration.service';
import RecommendationCard from '../components/RecommendationCard';
import { useAuth } from '../contexts/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import FollowListModal from '../components/FollowListModal';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { user: loggedInUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Follow state
  const [isCurrentlyFollowed, setIsCurrentlyFollowed] = useState(false);
  const [followActionLoading, setFollowActionLoading] = useState(false);
  const [currentFollowersCount, setCurrentFollowersCount] = useState(0);
  
  // Follow list modal state
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [modalListType, setModalListType] = useState('followers');

  // Collaboration request modal state
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabMessage, setCollabMessage] = useState('');
  const [collabError, setCollabError] = useState('');
  const [collabLoading, setCollabLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!userId) {
      setError("User ID not found in URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const profileData = await getPublicUserProfile(userId);
      setProfile(profileData);
      setIsCurrentlyFollowed(profileData?.followedByCurrentUser || false);
      setCurrentFollowersCount(profileData?.followersCount || 0);
      
      const recsData = await getRecommendationsByUserId(userId);
      setRecommendations(recsData || []);
    } catch (err) {
      setError('Failed to load profile. The user may not exist or an error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfileData();
    }
  }, [authLoading, fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return alert("Please login to follow users.");
    if (loggedInUser?.id === parseInt(userId, 10)) return;

    setFollowActionLoading(true);
    try {
      if (isCurrentlyFollowed) {
        await unfollowUser(userId);
        setIsCurrentlyFollowed(false);
        setCurrentFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(userId);
        setIsCurrentlyFollowed(true);
        setCurrentFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      alert("Could not perform follow/unfollow action.");
    } finally {
      setFollowActionLoading(false);
    }
  };

  const handleSendCollabRequest = async (e) => {
    e.preventDefault();
    setCollabLoading(true);
    setCollabError('');
    try {
        await sendCollaborationRequest({
            receiverUserId: profile.id,
            message: collabMessage
        });
        alert('Collaboration request sent successfully!');
        setIsCollabModalOpen(false);
        setCollabMessage('');
    } catch (err) {
        const errorMessage = err.response?.data?.error || "Failed to send request. You may have a pending request already.";
        setCollabError(errorMessage);
    } finally {
        setCollabLoading(false);
    }
  };

  const openFollowModal = (type) => {
    setModalListType(type);
    setIsFollowModalOpen(true);
  };

  if (isLoading) {
    return <div className="text-center p-10 font-semibold text-lg text-text-muted">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600 bg-red-100 p-6 rounded-md shadow">{error}</div>;
  }
  
  if (!profile) {
    return <div className="container mx-auto px-4 py-8 text-center">User profile not found.</div>;
  }
  
  const parseSocialLinks = (linksString) => {
    if (!linksString || typeof linksString !== 'string') return [];
    try { return linksString.split('\n').map(link => link.trim()).filter(link => link); } 
    catch (e) { return []; }
  };
  const socialLinksArray = parseSocialLinks(profile.socialMediaLinks);
  const isOwnProfile = loggedInUser && loggedInUser.id === profile.id;
  const isVerified = profile.userType === 'EXPERT_VERIFIED' || profile.userType === 'BRAND_VERIFIED';
  const canRequestCollab = isAuthenticated && !isOwnProfile &&
    (loggedInUser.roles.includes('ROLE_EXPERT_VERIFIED') || loggedInUser.roles.includes('ROLE_BRAND_VERIFIED')) &&
    isVerified;

  return (
    <>
      <div className="bg-surface min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* --- Profile Header --- */}
          <header className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-10 md:mb-14 pb-10 border-b border-border-color">
            <img
              src={profile.profilePhotoUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(profile.name || 'User')}`}
              alt={profile.name || 'User profile'}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-lg border-4 border-white"
            />
            <div className="text-center md:text-left flex-grow">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-main">{profile.name || "User"}</h1>
                {isVerified && <VerifiedBadge size={7} />}
              </div>
              {profile.expertiseDescription && (
                <p className="text-lg text-primary-text font-semibold mt-2 bg-primary px-3 py-1 inline-block rounded-full">{profile.expertiseDescription}</p>
              )}
              <div className="flex justify-center md:justify-start space-x-6 mt-4 text-text-muted">
                <div className="text-center">
                  <span className="font-bold text-lg text-text-main">{recommendations.length}</span>
                  <p>Recommendations</p>
                </div>
                <button onClick={() => openFollowModal('followers')} className="text-center hover:text-indigo-600 transition-colors">
                  <span className="font-bold text-lg text-text-main">{currentFollowersCount}</span>
                  <p>Followers</p>
                </button>
                <button onClick={() => openFollowModal('following')} className="text-center hover:text-indigo-600 transition-colors">
                  <span className="font-bold text-lg text-text-main">{profile.followingCount || 0}</span>
                  <p>Following</p>
                </button>
              </div>
              
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                {isOwnProfile ? (
                  <Link to="/profile" className="inline-block px-6 py-2 border border-border-color text-sm font-semibold text-text-main rounded-md hover:bg-gray-100 transition-colors">Edit Your Profile</Link>
                ) : isAuthenticated ? (
                  <button onClick={handleFollowToggle} disabled={followActionLoading} className={`inline-block px-8 py-2.5 text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isCurrentlyFollowed ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'}`}>{followActionLoading ? '...' : (isCurrentlyFollowed ? 'Following' : 'Follow')}</button>
                ) : null}
                
                {canRequestCollab && (
                  <button onClick={() => setIsCollabModalOpen(true)} className="inline-block px-6 py-2.5 bg-primary text-primary-text text-sm font-semibold rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">Request Collaboration</button>
                )}
              </div>
            </div>
          </header>

          {/* --- Profile Body --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-8">
                {profile.introduction && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-main mb-2 pb-2 border-b border-border-color">About</h3>
                    <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">{profile.introduction}</p>
                  </div>
                )}
                {socialLinksArray.length > 0 && (
                   <div className="pt-6 border-t border-border-color">
                    <h3 className="text-lg font-semibold text-text-main mb-2">Connect</h3>
                    <div className="space-y-2">
                      {socialLinksArray.map((link, index) => (
                        <a key={index} href={link.startsWith('http') ? link : `//${link}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-text-muted hover:text-indigo-600 transition-colors group">
                          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                          <span className="group-hover:underline truncate" title={link}>{new URL(link.startsWith('http') ? link : `https://${link}`).hostname.replace('www.','')}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-8 xl:col-span-9">
              <h2 className="text-2xl font-bold text-text-main mb-6">Recommendations by {profile.name || "this User"}</h2>
              {isLoading && recommendations.length === 0 && (<p>Loading recommendations...</p>)}
              {!isLoading && recommendations.length === 0 && ( <p className="text-text-muted bg-background p-6 rounded-lg shadow-sm">This user hasn't made any recommendations yet.</p> )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((rec) => (<RecommendationCard key={rec.id} recommendation={rec} />))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <FollowListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        userId={userId}
        listType={modalListType}
        initialUsername={profile.name}
      />
      
      {isCollabModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setIsCollabModalOpen(false)}>
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSendCollabRequest}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-main">Send Collaboration Request</h3>
                <p className="text-sm text-text-muted mt-1">Send a request to collaborate with {profile.name}.</p>
                <div className="mt-4">
                  <label htmlFor="collabMessage" className="block text-sm font-medium text-text-main">Include a message (optional)</label>
                  <textarea
                    id="collabMessage"
                    name="collabMessage"
                    rows="4"
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder={`Hi ${profile.name}, I'd love to discuss a collaboration opportunity...`}
                    className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
                {collabError && <p className="text-sm text-red-600 mt-2">{collabError}</p>}
              </div>
              <div className="bg-surface px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                <button type="button" onClick={() => setIsCollabModalOpen(false)} className="px-4 py-2 text-sm font-semibold bg-white border border-border-color rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={collabLoading} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                  {collabLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicProfilePage;