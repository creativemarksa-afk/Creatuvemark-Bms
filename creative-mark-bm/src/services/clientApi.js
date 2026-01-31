// services/clientApi.js
import api from "./api";

// Fetch all clients from backend
export const getAllClients = async () => {
  try {
    const response = await api.get("/clients");

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
      data: response.data.data,
      count: response.data.count || response.data.data.length,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error("Error fetching clients:", error);

    // Handle 404 specifically - return empty data instead of error
    if (error.response?.status === 404) {
      return {
        success: true,
        data: [],
        count: 0,
        message: "No clients found",
      };
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch clients";

    return {
      success: false,
      data: [],
      count: 0,
      message,
    };
  }
};

// Fetch a single client by ID
export const getClientById = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}`);

    if (!response || !response.data || !response.data.data) {
      return {
        success: false,
        data: null,
        message: "Client not found",
      };
    }

    return {
      success: response.data.success || false,
      data: response.data.data,
      message: response.data.message || "",
    };
  } catch (error) {
    console.error(`Error fetching client ${clientId}:`, error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch client";
    return {
      success: false,
      data: null,
      message,
    };
  }
};

// Delete a client and all associated data
export const deleteClient = async (clientId) => {
  try {
    const response = await api.delete(`/clients/${clientId}`);

    if (!response || !response.data) {
      return {
        success: false,
        message: "Invalid response from server",
      };
    }

    return {
      success: response.data.success || false,
      message: response.data.message || "Client deleted successfully",
      data: response.data.data || null,
    };
  } catch (error) {
    console.error(`Error deleting client ${clientId}:`, error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete client";
    return {
      success: false,
      message,
    };
  }
};