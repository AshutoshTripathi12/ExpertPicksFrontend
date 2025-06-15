// src/pages/CollaborationRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getIncomingRequests, getOutgoingRequests, respondToCollaborationRequest } from '../services/collaboration.service';
import { useAuth } from '../contexts/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';
import Loader from '../components/Loader'; // Assuming you have this loader component

// Sub-component for rendering a single request row
const RequestRow = ({ request, type, onRespond }) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const otherUser = type === 'incoming' ? request.requesterUser : request.receiverUser;
  const isVerified = otherUser.userType === 'EXPERT_VERIFIED' || otherUser.userType === 'BRAND_VERIFIED';
  const placeholderAvatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(otherUser.name || 'User')}`;

  const handleAction = async (newStatus) => {
    setIsActionLoading(true);
    await onRespond(request.id, newStatus);
    // The parent component will handle re-fetching, so we don't need to set loading to false here
    // unless there's an error. The component will re-render with new props.
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-sm border border-border-color">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center">
          <img src={otherUser.profilePhotoUrl || placeholderAvatar} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover mr-4" />
          <div>
            <div className="flex items-center space-x-2">
              <Link to={`/users/${otherUser.id}`} className="font-bold text-text-main hover:underline">{otherUser.name}</Link>
              {isVerified && <VerifiedBadge size={5} />}
            </div>
            <p className="text-sm text-text-muted capitalize">{otherUser.userType.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3 self-end sm:self-center">
          {request.status === 'PENDING' && type === 'incoming' ? (
            <>
              <button onClick={() => handleAction('DECLINED')} disabled={isActionLoading} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50">Decline</button>
              <button onClick={() => handleAction('ACCEPTED')} disabled={isActionLoading} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {isActionLoading ? '...' : 'Accept'}
              </button>
            </>
          ) : (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full 
              ${request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''} 
              ${request.status === 'DECLINED' ? 'bg-red-100 text-red-800' : ''}
              ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}`}
            >
              {request.status}
            </span>
          )}
        </div>
      </div>
      
      {/* Message */}
      {request.message && <p className="mt-4 text-sm text-text-muted border-t border-border-color pt-3 italic">"{request.message}"</p>}
      
      {/* Revealed Contact Info on Acceptance */}
      {request.status === 'ACCEPTED' && (
        <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
          <h4 className="font-semibold text-sm text-green-800">Collaboration Accepted!</h4>
          <p className="text-sm text-green-700 mt-1">
            You can now contact {otherUser.name} at: 
            <a href={`mailto:${type === 'incoming' ? request.requesterContactEmail : request.receiverContactEmail}`} className="font-bold underline ml-1">
              {type === 'incoming' ? request.requesterContactEmail : request.receiverContactEmail}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

const CollaborationRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [incomingData, outgoingData] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests()
      ]);
      setIncomingRequests(incomingData || []);
      setOutgoingRequests(outgoingData || []);
    } catch (err) {
      setError('Failed to fetch collaboration requests.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRespondToRequest = async (requestId, newStatus) => {
    try {
      // The service call updates the backend
      const updatedRequest = await respondToCollaborationRequest(requestId, { status: newStatus });
      // For a seamless UI update, we replace the old request in our state with the updated one
      setIncomingRequests(prevReqs => 
        prevReqs.map(req => req.id === requestId ? updatedRequest : req)
      );
    } catch (err) {
      alert(`Error trying to ${newStatus.toLowerCase()} the request. Please try again.`);
    }
  };

  const pendingCount = incomingRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-main mb-8">Collaboration Requests</h1>
      
      {/* Tabs */}
      <div className="border-b border-border-color mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('incoming')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'incoming' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'}`}>
            <span>Incoming</span>
            {pendingCount > 0 && <span className="ml-2 inline-block py-0.5 px-2.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveTab('outgoing')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outgoing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'}`}>
            Outgoing
          </button>
        </nav>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <p className="text-center text-red-600 py-10">{error}</p>
      ) : (
        <div className="space-y-4">
          {activeTab === 'incoming' ? 
            (incomingRequests.length > 0 ? incomingRequests.map(req => <RequestRow key={req.id} request={req} type="incoming" onRespond={handleRespondToRequest} />) : <p className="text-center text-text-muted py-10">No incoming requests.</p>) :
            (outgoingRequests.length > 0 ? outgoingRequests.map(req => <RequestRow key={req.id} request={req} type="outgoing" />) : <p className="text-center text-text-muted py-10">You have not sent any requests.</p>)
          }
        </div>
      )}
    </div>
  );
};

export default CollaborationRequestsPage;