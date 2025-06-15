import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicUserProfile, followUser, unfollowUser } from '../services/user.service';
import { getRecommendationsByUserId } from '../services/recommendation.service';
import { sendCollaborationRequest } from '../services/collaboration.service';
import RecommendationCard from '../components/RecommendationCard';
import { useAuth } from '../contexts/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import FollowListModal from '../components/FollowListModal';
import Loader from '../components/Loader';
const SocialIcon = ({ platform }) => {
  const iconPaths = {
    twitter: "M22.46,6C21.78,6.35 21.06,6.58 20.3,6.69C21.09,6.24 21.68,5.5 21.98,4.62C21.24,5.03 20.44,5.35 19.6,5.5C18.9,4.79 17.9,4.31 16.79,4.31C14.68,4.31 12.97,6.02 12.97,8.13C12.97,8.44 13,8.74 13.08,9.03C8.69,8.81 4.88,6.71 2.23,3.36C1.88,3.99 1.68,4.73 1.68,5.52C1.68,6.89 2.39,8.1 3.43,8.82C2.8,8.8 2.21,8.62 1.72,8.33V8.37C1.72,10.32 3.14,11.95 5.04,12.33C4.69,12.42 4.32,12.47 3.93,12.47C3.68,12.47 3.43,12.44 3.19,12.4C3.72,14.03 5.23,15.22 7.02,15.25C5.61,16.32 3.86,16.97 2,16.97C1.69,16.97 1.38,16.95 1.07,16.91C2.88,18.09 4.99,18.76 7.29,18.76C16.79,18.76 20.59,11.16 20.59,4.92C20.59,4.77 20.59,4.62 20.58,4.47C21.41,3.85 22.01,3.12 22.46,2.22V6Z",
    linkedin: "M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.43 12.92,11.24V10.13H10.13V18.5H12.92V13.57C12.92,12.8 13.54,12.17 14.31,12.17A1.4,1.4 0 0,1 15.71,13.57V18.5H18.5M6.88,8.56A1.68,1.68 0 0,0 8.56,6.88C8.56,6 7.88,5.32 7,5.32A1.68,1.68 0 0,0 5.32,6.88C5.32,7.76 6,8.44 6.88,8.56M8.27,18.5V10.13H5.5V18.5H8.27Z",
    instagram: "M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.2,5.2 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.2,5.2 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z",
    github: "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.55,5.9 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.45,5.9 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.16,21.5A10,10 0 0,0 22,12C22,6.48 17.52,2 12,2Z",
    website: "M10,13V11H14V13H10M10,17V15H14V17H10M10,9V7H14V9H10M6,21H18A2,2 0 0,0 20,19V5A2,2 0 0,0 18,3H6A2,2 0 0,0 4,5V19A2,2 0 0,0 6,21M6,5H18V19H6V5Z",
  };
  const path = iconPaths[platform.toLowerCase()] || iconPaths.website;
  return (<svg className="w-5 h-5 mr-3 text-gray-400" viewBox="0 0 24 24"><path fill="currentColor" d={path} /></svg>);
};
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

  if (authLoading || isLoading) {
    // Show the loader if we are either checking auth OR fetching profile data
    return <Loader />;
  }


  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600 bg-red-100 p-6 rounded-md shadow">{error}</div>;
  }
  
  if (!profile) {
    return <div className="container mx-auto px-4 py-8 text-center">User profile not found.</div>;
  }
  
  const parseSocialLinks = (linksString) => {
    if (!linksString || typeof linksString !== 'string') return {};
    try {
      // Try to parse as JSON (new format)
      const parsed = JSON.parse(linksString);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
      // Fallback for old, newline-separated data
      const links = linksString.split('\n').map(l => l.trim()).filter(Boolean);
      const linkObject = {};
      if (links.find(l => l.includes('twitter'))) linkObject.twitter = links.find(l => l.includes('twitter'));
      if (links.find(l => l.includes('linkedin'))) linkObject.linkedin = links.find(l => l.includes('linkedin'));
      if (links.find(l => l.includes('instagram'))) linkObject.instagram = links.find(l => l.includes('instagram'));
      if (links.find(l => l.includes('github'))) linkObject.github = links.find(l => l.includes('github'));
      return linkObject;
    }
  };
  
  if (!profile) { /* ... return loading/error/not found ... */ }
  const socialLinksArray = parseSocialLinks(profile.socialMediaLinks);
  const isOwnProfile = loggedInUser && loggedInUser.id === profile.id;
  const isVerified = profile.userType === 'EXPERT_VERIFIED' || profile.userType === 'BRAND_VERIFIED';
  const canRequestCollab = isAuthenticated && !isOwnProfile &&
    (loggedInUser.roles.includes('ROLE_EXPERT_VERIFIED') || loggedInUser.roles.includes('ROLE_BRAND_VERIFIED')) &&
    isVerified;

  return (
    <>
    {isLoading && <Loader />}
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
              {isLoading && recommendations.length === 0 && <Loader />}
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