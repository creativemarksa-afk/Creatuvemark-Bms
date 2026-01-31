"use client";

import { useState, useEffect, useRef } from "react";
import messageService from "../../services/messageService";
import { useSocket } from "../../contexts/SocketContext";
import LoadingSpinner from "../LoadingSpinner";

const MessageList = ({ applicationId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollHeight = useRef(0);
  const { 
    joinApplicationRoom, 
    leaveApplicationRoom, 
    onNewMessage, 
    onUserTyping, 
    onMessagesRead,
    markMessagesAsRead 
  } = useSocket();

  useEffect(() => {
    if (applicationId) {
      fetchMessages();
      joinApplicationRoom(applicationId);
    }

    return () => {
      if (applicationId) {
        leaveApplicationRoom(applicationId);
      }
    };
  }, [applicationId, joinApplicationRoom, leaveApplicationRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribeNewMessage = onNewMessage((newMessage) => {
      if (newMessage.applicationId === applicationId) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (!exists) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    });

    const unsubscribeTyping = onUserTyping((data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      }
    });

    const unsubscribeMessagesRead = onMessagesRead((data) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id) 
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      ));
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeMessagesRead();
    };
  }, [applicationId, currentUserId, onNewMessage, onUserTyping, onMessagesRead]);

  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await messageService.getConversationMessages(applicationId, pageNum);
      
      if (append) {
        setMessages(prev => [...response.messages, ...prev]);
      } else {
        setMessages(response.messages || []);
      }
      
      setHasMore(response.messages.length === 50);
      setPage(pageNum);
      
      return response;
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (hasMore && !loading) {
      const container = messagesContainerRef.current;
      if (container) {
        lastScrollHeight.current = container.scrollHeight;
      }
      
      await fetchMessages(page + 1, true);
      
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - lastScrollHeight.current;
        }
      }, 50);
    }
  };

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
    
    if (scrollTop < 100 && hasMore && !loading) {
      loadMoreMessages();
    }

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

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50/50 to-white/50">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50/50 to-white/50 p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 max-w-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-medium mb-2">Failed to load messages</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchMessages()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50/50 to-white/50 p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {loading && hasMore && (
          <div className="flex justify-center py-3">
            <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 font-medium">Loading...</span>
            </div>
          </div>
        )}

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
                           ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
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
                          <span className="ml-1">
                            {message.isRead ? (
                              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 11" fill="none">
                                <path d="M11.071.653a.75.75 0 0 1 1.06 0l3.857 3.857a.75.75 0 0 1-1.06 1.06L11.5 2.143 8.072 5.57a.75.75 0 1 1-1.06-1.06L11.07.653ZM5.5 3.214L1.929 6.786a.75.75 0 0 1-1.06-1.061L4.439 2.15a.75.75 0 0 1 1.06 0l3.429 3.428L12.5 2.007l-2.571 2.572a.75.75 0 0 1-1.06 0L5.5 3.214Zm-.929 4.358L1.143 10.93a.75.75 0 1 1-1.06-1.061l3.642-3.643a.75.75 0 0 1 1.06 0l3.429 3.428 3.428-3.428a.75.75 0 0 1 1.061 1.06L9.275 10.716a.75.75 0 0 1-1.06 0L4.57 7.572Z" fill="currentColor"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 12 11" fill="none">
                                <path d="M11.071.653a.75.75 0 0 1 1.06 0l3.857 3.857a.75.75 0 0 1-1.06 1.06L11.5 2.143 8.072 5.57a.75.75 0 1 1-1.06-1.06L11.07.653Z" fill="currentColor"/>
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {typingUsers.length > 0 && (
          <div className="flex justify-start mt-2 animate-slideIn">
            <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-6 right-6 w-11 h-11 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
          aria-label="Scroll to bottom"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MessageList;