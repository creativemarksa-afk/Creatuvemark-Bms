"use client";

import { useState, useEffect } from "react";
import { getConversations } from "../../services/messageService";
import LoadingSpinner from "../LoadingSpinner";

const ConversationList = ({ onSelectConversation, selectedApplicationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getServiceTypeDisplay = (serviceType) => {
    const serviceTypes = {
      commercial: "Commercial Registration",
      engineering: "Engineering License",
      real_estate: "Real Estate License",
      industrial: "Industrial License",
      agricultural: "Agricultural License",
      service: "Service License",
      advertising: "Advertising License"
    };
    return serviceTypes[serviceType] || serviceType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 mb-3">{error}</p>
        <button 
          onClick={fetchConversations}
          className="px-4 py-2 bg-[#25d366] hover:bg-[#1ea952] text-white rounded-full transition-colors font-medium text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-[#25d366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-[#25d366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-white font-medium mb-1">No conversations yet</p>
        <p className="text-green-300/60 text-sm">Start by applying for a service</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#1f3933]">
      {conversations.map((conversation, index) => {
        const isSelected = selectedApplicationId === conversation.applicationId;
        
        return (
          <div
            key={conversation.applicationId}
            onClick={() => onSelectConversation(conversation)}
            className={`px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-[#1f3933]/50 ${
              isSelected ? "bg-[#1f3933]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#25d366] to-[#1ea952] rounded-full flex items-center justify-center ring-2 ring-[#25d366]/30">
                  <span className="text-white font-bold text-base">
                    {conversation.conversationPartner?.fullName?.charAt(0) || "S"}
                  </span>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#25d366] rounded-full flex items-center justify-center border-2 border-[#0f2921]">
                    <span className="text-white text-[10px] font-bold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {conversation.conversationPartner?.fullName || "Support Team"}
                    </h3>
                  </div>
                  {conversation.lastMessage && (
                    <span className="text-[10px] text-green-300/60 font-medium flex-shrink-0">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-green-300/50 mb-1.5 truncate">
                  {getServiceTypeDisplay(conversation.application.serviceType)}
                </p>
                
                {conversation.lastMessage && (
                  <p className={`text-xs truncate ${
                    conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-green-300/60'
                  }`}>
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2.5 pl-[60px]">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                conversation.application.status === 'completed' 
                  ? 'bg-[#25d366]/20 text-[#25d366]'
                  : conversation.application.status === 'in_process'
                  ? 'bg-blue-500/20 text-blue-400'
                  : conversation.application.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {typeof conversation.application.status === 'object' 
                  ? conversation.application.status.current?.replace('_', ' ') || 'Unknown'
                  : conversation.application.status?.replace('_', ' ') || 'Unknown'
                }
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;