"use client";
import React, { useState } from 'react';
import { FaTimes, FaPaperclip, FaReply, FaSpinner, FaClock, FaCheck, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { addTicketReply } from '../../services/ticketService';

export default function TicketDetail({ ticket, onClose, onTicketUpdated }) {
  const [reply, setReply] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!ticket) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FaClock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <FaCheck className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <FaTimes className="h-5 w-5 text-gray-500" />;
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setLoading(true);
    setError('');

    try {
      const replyData = {
        message: reply,
        attachments: attachments
      };

      const response = await addTicketReply(ticket._id, replyData);
      
      if (response.success) {
        setReply('');
        setAttachments([]);
        
        // Notify parent to refresh ticket data
        if (onTicketUpdated) {
          onTicketUpdated();
        }
      } else {
        setError(response.message || 'Failed to add reply');
      }
    } catch (err) {
      setError('Failed to add reply. Please try again.');
      console.error('Error adding reply:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900">Ticket #{ticket._id}</h2>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Ticket Details */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                <p className="text-gray-600 mb-4">{ticket.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600 capitalize">{ticket.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FaPaperclip className="h-4 w-4 text-gray-500 mr-3" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{attachment.name}</span>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Conversation</h4>
                <div className="space-y-4">
                  {/* Initial message */}
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">You</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{ticket.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {ticket.replies && ticket.replies.length > 0 ? (
                    ticket.replies.map((reply, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            reply.from === 'user' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <span className={`text-xs font-medium ${
                              reply.from === 'user' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {reply.from === 'user' ? 'You' : 'Support'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className={`rounded-lg p-3 ${
                            reply.from === 'user' ? 'bg-blue-50' : 'bg-green-50'
                          }`}>
                            <p className="text-sm text-gray-700">{reply.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaReply className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No replies yet. Be the first to add a reply!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <div className="border-t border-gray-200 p-6">
              <form onSubmit={handleSubmitReply} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                    Add Reply
                  </label>
                  <textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label htmlFor="reply-attachments" className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Files (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                    <input
                      type="file"
                      id="reply-attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="reply-attachments"
                      className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <FaPaperclip className="h-4 w-4 mr-2" />
                      <span className="text-sm">Click to attach files</span>
                    </label>
                  </div>

                  {/* Attached Files */}
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !reply.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaReply className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
