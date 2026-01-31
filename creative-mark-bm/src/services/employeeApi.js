// services/employeeService.js
import api from "./api";

// Fetch all employees from backend

export const getAllEmployees = async () => {
  try {
    const response = await api.get("/employees");

    // Validate response structure
    if (!response || !response.data || !Array.isArray(response.data.data)) {
      return {
        success: false,
        data: [],
        count: 0,
        message: "Invalid data received from server",
      };
    }

    return {
      success: response.data.success || false,
      data: response.data.data || [],
      count: response.data.count || response.data.data.length,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error fetching employees:", error);

    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch employees";

    return {
      success: false,
      data: [],
      count: 0,
      message,
    };
  }
};

// Fetch a single employee by ID

export const getEmployeeById = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}`);

    if (!response || !response.data || !response.data.data) {
      return {
        success: false,
        data: null,
        message: "Employee not found",
      };
    }

    return {
      success: response.data.success || false,
      data: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error(`Error fetching employee ${employeeId}:`, error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch employee";
    return {
      success: false,
      data: null,
      message,
    };
  }
};

// Get request details
export const getRequestDetails = async (requestId) => {
  try {
    const response = await api.get(`/employees/applications/${requestId}`);
    return {
      success: response.data.success || false,
      request: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error fetching request details:", error);
    return {
      success: false,
      request: null,
      message: error.response?.data?.message || error.message || "Failed to fetch request details",
    };
  }
};

// Update request status
export const updateRequestStatus = async (requestId, statusData) => {
  try {
    const response = await api.put(`/employees/applications/${requestId}`, statusData);
    return {
      success: response.data.success || false,
      request: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error updating request status:", error);
    return {
      success: false,
      request: null,
      message: error.response?.data?.message || error.message || "Failed to update request status",
    };
  }
};

// Approve request
export const approveRequest = async (requestId, approvalData) => {
  try {
    const response = await api.patch(`/applications/${requestId}/review`, {
      action: 'approve',
      ...approvalData
    });
    return {
      success: response.data.success || false,
      request: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error approving request:", error);
    return {
      success: false,
      request: null,
      message: error.response?.data?.message || error.message || "Failed to approve request",
    };
  }
};

// Reject request
export const rejectRequest = async (requestId, rejectionData) => {
  try {
    const response = await api.patch(`/applications/${requestId}/review`, {
      action: 'reject',
      ...rejectionData
    });
    return {
      success: response.data.success || false,
      request: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      success: false,
      request: null,
      message: error.response?.data?.message || error.message || "Failed to reject request",
    };
  }
};

// Delete employee
export const deleteEmployee = async (employeeId, deletedBy) => {
  try {
    const response = await api.delete(`/employees/${employeeId}`, {
      data: { deletedBy }
    });
    return response.data;
  } catch (error) {
    console.error("Delete Employee Error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    const errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        "Failed to delete employee";

    throw new Error(errorMessage);
  }
};