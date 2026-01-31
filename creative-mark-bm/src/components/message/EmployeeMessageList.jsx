"use client";

import { useState, useEffect, useRef } from "react";
import { useMessageNotifications } from "../../contexts/MessageNotificationContext";
import LoadingSpinner from "../LoadingSpinner";

const EmployeeMessageList = ({ messages, currentUserId, applicationId }) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { markAsRead } = useMessageNotifications();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when viewing
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
  };

  const getDateDivider = (currentMsg, previousMsg) => {
    if (!currentMsg?.createdAt) return null;
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const previousDate = previousMsg ? new Date(previousMsg.createdAt).toDateString() : null;
    
    if (currentDate !== previousDate) {
      const msgDate = new Date(currentMsg.createdAt);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      let label;
      if (currentDate === today) {
        label = "Today";
      } else if (currentDate === yesterday) {
        label = "Yesterday";
      } else {
        label = msgDate.toLocaleDateString([], { 
          month: 'long', 
          day: 'numeric',
          year: msgDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      }
      
      return (
        <div className="flex items-center justify-center my-6">
          <div className="px-4 py-1.5 bg-gray-100/80 backdrop-blur-sm text-gray-600 text-xs font-medium rounded-full shadow-sm">
            {label}
          </div>
        </div>
      );
    }
    return null;
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50/50 to-white/50 p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No messages yet</p>
          <p className="text-sm text-gray-500">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-b from-gray-50/50 to-white/50">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
        onScroll={handleScroll}
      >
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId._id === currentUserId;
            const previousMsg = index > 0 ? messages[index - 1] : null;
            const dateDivider = getDateDivider(message, previousMsg);
            
            return (
              <div key={message._id}>
                {dateDivider}
                
                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-1 animate-slideIn`}
                >
                  <div className={`max-w-[75%] md:max-w-md lg:max-w-lg`}>
                    {!isOwnMessage && (
                      <div className="text-xs text-gray-600 mb-1 px-3 font-medium">
                        {message.senderId.fullName}
                      </div>
                    )}
                    
                     <div
                       className={`p-4 rounded-2xl shadow-sm relative ${
                         isOwnMessage
                           ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                           : "bg-white text-gray-800 border border-gray-100"
                       }`}
                     >
                      <p className="break-words text-[15px] leading-relaxed pr-16">
                        {message.content}
                      </p>
                      <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[11px] ${
                        isOwnMessage ? "text-gray-500" : "text-gray-400"
                      }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <div className="flex items-center gap-0.5">
                            {message.isRead ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-1">
            <div className="max-w-[75%] md:max-w-md lg:max-w-lg">
              <div className="p-4 rounded-2xl shadow-sm bg-white border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...` 
                      : `${typingUsers.length} people are typing...`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EmployeeMessageList;
