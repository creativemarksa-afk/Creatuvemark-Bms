import api from './api';

export const getConversations = async () => {
  try {
  
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not authenticated
    if (error.response?.status !== 401) {
      console.error('Error fetching conversations:', error);
    }
    throw error;
  }
};

export const getConversationMessages = async (applicationId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/messages/conversation/${applicationId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/messages', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (messageIds) => {
  try {
    const response = await api.put('/messages/read', { messageIds });
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const getUnreadCount = async (applicationId = null) => {
  try {
   
    const params = applicationId ? { applicationId } : {};
    const response = await api.get('/messages/unread-count', { params });
    return response.data;
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not authenticated
    if (error.response?.status !== 401) {
      console.error('Error getting unread count:', error);
    }
    throw error;
  }
};

export const pollForNewMessages = async (applicationId, lastMessageId) => {
  try {
    const response = await api.get(`/messages/conversation/${applicationId}`, {
      params: { 
        since: lastMessageId,
        limit: 10
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error polling for new messages:', error);
    throw error;
  }
};

// Default export with all functions
const messageService = {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount,
  pollForNewMessages
};

export default messageService;
