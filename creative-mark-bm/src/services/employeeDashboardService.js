// Employee Dashboard Service
import api from "./api";

/**
 * Get employee dashboard statistics
 */
export const getEmployeeDashboardStats = async () => {
  try {
    const response = await api.get("/employees/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee dashboard stats:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch dashboard statistics"
    );
  }
};

/**
 * Get employee's assigned applications
 */
export const getEmployeeApplications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/employees/applications?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee applications:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch assigned applications"
    );
  }
};

/**
 * Get recent activities for employee
 */
export const getEmployeeRecentActivities = async (limit = 10) => {
  try {
    const response = await api.get(`/employees/activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch recent activities"
    );
  }
};

/**
 * Get employee performance metrics
 */
export const getEmployeePerformance = async (period = 'month') => {
  try {
    const response = await api.get(`/employees/performance?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee performance:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch performance metrics"
    );
  }
};

/**
 * Get employee's upcoming deadlines
 */
export const getEmployeeDeadlines = async (limit = 10) => {
  try {
    const response = await api.get(`/employees/deadlines?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deadlines:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch upcoming deadlines"
    );
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (applicationId, status, note = '') => {
  try {
    const response = await api.patch(`/status/${applicationId}/update`, {
      status,
      note
    });
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to update application status"
    );
  }
};

/**
 * Add progress update to application
 */
export const addProgressUpdate = async (applicationId, progressData) => {
  try {
    const response = await api.post(`/applications/${applicationId}/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error("Error adding progress update:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to add progress update"
    );
  }
};

/**
 * Get employee notifications
 */
export const getEmployeeNotifications = async (limit = 20) => {
  try {
    const response = await api.get(`/employees/notifications?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch notifications"
    );
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to mark notification as read"
    );
  }
};

/**
 * Get application details for employee
 */
export const getEmployeeApplicationDetails = async (applicationId) => {
  try {
    const response = await api.get(`/employees/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching application details:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch application details"
    );
  }
};

/**
 * Update application status/progress by employee
 */
export const updateEmployeeApplication = async (applicationId, updateData) => {
  try {
    const response = await api.patch(`/employees/applications/${applicationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating application:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to update application"
    );
  }
};

/**
 * Add progress update to application
 */
export const addApplicationProgress = async (applicationId, progressData) => {
  try {
    const response = await api.post(`/employees/applications/${applicationId}/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error("Error adding progress update:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to add progress update"
    );
  }
};

/**
 * Update application data by employee
 */
export const updateEmployeeApplicationData = async (applicationId, updateData) => {
  try {
    const response = await api.put(`/employees/applications/${applicationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating application data:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to update application data"
    );
  }
};
