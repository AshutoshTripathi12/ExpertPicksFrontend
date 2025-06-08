// src/pages/CollaborationRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getIncomingRequests, getOutgoingRequests, respondToCollaborationRequest } from '../services/collaboration.service';
import { useAuth } from '../contexts/AuthContext';
import VerifiedBadge from '../components/VerifiedBadge';

const CollaborationRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth(); // To check if viewer is the receiver

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch both lists in parallel
      const [incomingData, outgoingData] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests()
      ]);
      setIncomingRequests(incomingData || []);
      setOutgoingRequests(outgoingData || []);
    } catch (err) {
      setError('Failed to fetch collaboration requests.');
      console.error("Fetch requests error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResponse = async (requestId, newStatus) => {
    // Optimistic UI update can be complex, so we'll refetch for simplicity and accuracy
    try {
      await respondToCollaborationRequest(requestId, { status: newStatus });
      // Refresh all requests to get the latest state
      fetchRequests(); 
    } catch (err) {
      alert(`Error trying to ${newStatus.toLowerCase()} the request. Please try again.`);
      console.error("Respond to request error:", err);
    }
  };

  const renderRequestList = (requests, type) => {
    if (requests.length === 0) {
      return <p className="text-center text-text-muted py-10 bg-surface rounded-md">You have no {type} requests.</p>;
    }
    
    return (
      <div className="space-y-4">
        {requests.map(req => {
          const otherUser = type === 'incoming' ? req.requesterUser : req.receiverUser;
          const isVerified = otherUser.userType === 'EXPERT_VERIFIED' || otherUser.userType === 'BRAND_VERIFIED';
          
          return (
            <div key={req.id} className="bg-background p-4 rounded-lg shadow-sm border border-border-color">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* User Info */}
                <div className="flex items-center mb-4 sm:mb-0">
                  <img src={otherUser.profilePhotoUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(otherUser.name)}`} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover mr-4" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/users/${otherUser.id}`} className="font-bold text-text-main hover:underline">{otherUser.name}</Link>
                      {isVerified && <VerifiedBadge size={5} />}
                    </div>
                    <p className="text-sm text-text-muted">{otherUser.userType.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {req.status === 'PENDING' && type === 'incoming' ? (
                    <>
                      <button onClick={() => handleResponse(req.id, 'DECLINED')} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Decline</button>
                      <button onClick={() => handleResponse(req.id, 'ACCEPTED')} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Accept</button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                      ${req.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''} 
                      ${req.status === 'DECLINED' ? 'bg-red-100 text-red-800' : ''}
                      ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Message & Contact Info */}
              {req.message && <p className="mt-4 text-sm text-text-muted border-t border-border-color pt-3">"{req.message}"</p>}
              {req.status === 'ACCEPTED' && (
                <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                  <h4 className="font-semibold text-sm text-green-800">Collaboration Accepted!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Contact {type === 'incoming' ? 'Requester' : 'Receiver'} at: 
                    <a href={`mailto:${type === 'incoming' ? req.requesterContactEmail : req.receiverContactEmail}`} className="font-bold underline ml-1">
                      {type === 'incoming' ? req.requesterContactEmail : req.receiverContactEmail}
                    </a>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-main mb-8">Collaboration Requests</h1>
      
      {/* Tabs */}
      <div className="border-b border-border-color mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('incoming')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'incoming' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'}`}>
            Incoming ({incomingRequests.filter(r => r.status === 'PENDING').length} Pending)
          </button>
          <button onClick={() => setActiveTab('outgoing')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outgoing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'}`}>
            Outgoing
          </button>
        </nav>
      </div>

      {isLoading ? (
        <p className="text-center text-text-muted py-10">Loading requests...</p>
      ) : error ? (
        <p className="text-center text-red-600 py-10">{error}</p>
      ) : (
        <div>
          {activeTab === 'incoming' ? renderRequestList(incomingRequests, 'incoming') : renderRequestList(outgoingRequests, 'outgoing')}
        </div>
      )}
    </div>
  );
};

export default CollaborationRequestsPage;