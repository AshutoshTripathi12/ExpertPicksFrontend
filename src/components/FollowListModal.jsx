// src/components/FollowListModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFollowersList, getFollowingList } from '../services/user.service';
import VerifiedBadge from './VerifiedBadge'; // Ensure this component is imported
import { Loader } from 'lucide-react';

// This is the UserRow sub-component. The logic for the badge is here.
const UserRow = ({ user, onNavigate }) => {
    if (!user) return null;

    // This line checks the userType property from the data you provided.
    const isVerified = user.userType === 'EXPERT_VERIFIED' || user.userType === 'BRAND_VERIFIED';
    const placeholderAvatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(user.name || 'User')}`;

    return (
        // The onClick here closes the modal before navigating to the next profile.
        <Link to={`/users/${user.id}`} onClick={onNavigate} className="flex items-center p-3 hover:bg-surface rounded-lg transition-colors">
            <img src={user.profilePhotoUrl || placeholderAvatar} alt={user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
            <div className="flex-grow">
                <div className="flex items-center space-x-1.5">
                    <p className="font-semibold text-text-main">{user.name}</p>
                    
                    {/* This line will now correctly render the badge if isVerified is true */}
                    {isVerified && <VerifiedBadge size={4} />}
                </div>
                <p className="text-sm text-text-muted truncate">{user.expertiseDescription || ''}</p>
            </div>
        </Link>
    );
};


const FollowListModal = ({ isOpen, onClose, userId, listType, initialUsername }) => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const fetchUsers = useCallback(async (pageNum) => {
        setIsLoading(true);
        setError('');
        const fetchFunction = listType === 'followers' ? getFollowersList : getFollowingList;
        try {
            const data = await fetchFunction(userId, pageNum, 15);
            if (data?.content) {
                setUsers(prevUsers => pageNum === 0 ? data.content : [...prevUsers, ...data.content]);
            }
            setHasMore(!data?.last);
        } catch (err) {
            setError(`Failed to load ${listType}.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, listType]);
    
    useEffect(() => {
        if (isOpen) {
            setUsers([]);
            setPage(0);
            setHasMore(true);
            fetchUsers(0);
        }
    }, [isOpen, fetchUsers]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage);
    };

    if (!isOpen) {
        return null;
    }

    const title = listType.charAt(0).toUpperCase() + listType.slice(1);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-background rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-main">{title}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main text-2xl font-bold">&times;</button>
                </div>
                <div className="p-2 sm:p-4 overflow-y-auto">
                    {users.length > 0 ? (
                        <div className="space-y-1">
                            {users.map(user => <UserRow key={user.id} user={user} onNavigate={onClose} />)}
                        </div>
                    ) : !isLoading && (
                        <p className="text-center text-text-muted py-8">
                            {listType === 'followers' ? `${initialUsername} doesn't have any followers yet.` : `${initialUsername} isn't following anyone yet.`}
                        </p>
                    )}
                    {isLoading && <Loader className="mx-auto my-4 text-indigo-600 animate-spin" size={24} />}
                    {hasMore && !isLoading && (
                        <button 
                            onClick={handleLoadMore} 
                            className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;