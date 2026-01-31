import api from "./api";

export const createTicket = async (ticketData) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

export const getTicketsByUserId = async () => {
  const response = await api.get("/tickets/my");
  return response.data; // { success: true, tickets: [...] }
};


export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};


export const updateTicket = async (id, ticketData) => {
  const response = await api.put(`/tickets/${id}`, ticketData);
  return response.data;
};


export const deleteTicket = async (id) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};


export const getAllTickets = async () => {
  const response = await api.get("/tickets");
  return response.data;
};

// Employee functions
export const getAssignedTickets = async (page = 1, limit = 10, status = 'all') => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'all') params.append('status', status);
    
    const response = await api.get(`/tickets/my?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned tickets:', error);
    throw error;
  }
};

export const resolveTicket = async (ticketId) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}/status`, {
      status: 'resolved'
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving ticket:', error);
    throw error;
  }
};