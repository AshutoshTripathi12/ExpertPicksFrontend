// src/components/UserListCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';
import Button from './Button'; // Assuming you have your reusable Button component

const UserListCard = ({ user }) => {
  if (!user) return null;

  const isVerified = user.userType === 'EXPERT_VERIFIED' || user.userType === 'BRAND_VERIFIED';
  const placeholderAvatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(user.name || 'User')}`;

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border-color shadow-sm">
      <div className="flex items-center">
        <img 
          src={user.profilePhotoUrl || placeholderAvatar} 
          alt={user.name} 
          className="w-14 h-14 rounded-full object-cover mr-4"
        />
        <div>
          <div className="flex items-center space-x-2">
            <Link to={`/users/${user.id}`} className="font-bold text-text-main hover:underline">{user.name}</Link>
            {isVerified && <VerifiedBadge size={5} />}
          </div>
          <p className="text-sm text-text-muted capitalize">
            {user.expertiseDescription || user.userType.replace('_', ' ').toLowerCase()}
          </p>
        </div>
      </div>
      <div className="hidden sm:block">
        {/* We can add a follow/unfollow button here in the future if needed */}
        <Link to={`/users/${user.id}`}>
          <Button variant="secondary">View Profile</Button>
        </Link>
      </div>
    </div>
  );
};

export default UserListCard;