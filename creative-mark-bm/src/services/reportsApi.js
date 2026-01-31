// services/reportsApi.js
import api from "./api";

// Fetch dashboard analytics
export const getDashboardAnalytics = async () => {
  try {
    const response = await api.get("/reports/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch dashboard analytics";
    throw new Error(message);
  }
};

// Fetch application reports
export const getApplicationReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/reports/applications?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching application reports:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch application reports";
    throw new Error(message);
  }
};

// Fetch employee performance reports
export const getEmployeeReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/reports/employees?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee reports:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch employee reports";
    throw new Error(message);
  }
};

// Fetch financial reports
export const getFinancialReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching financial reports:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch financial reports";
    throw new Error(message);
  }
};
