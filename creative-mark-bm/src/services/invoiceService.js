import api from "./api";
import axios from "axios";

/**
 * Invoice Service
 * Handles all invoice-related API calls
 */

/**
 * Get all invoices
 */
export const getInvoices = async () => {
  try {
    const response = await api.get("/invoices");
    // If the response has pagination structure
    if (response.data && typeof response.data === 'object' && 'invoices' in response.data) {
      return response.data;
    }
    // If it's just an array
    if (Array.isArray(response.data)) {
      return {
        invoices: response.data,
        pagination: {
          current: 1,
          total: 1,
          count: response.data.length,
          totalRecords: response.data.length
        }
      };
    }
    // If something went wrong, return empty structure
    return {
      invoices: [],
      pagination: {
        current: 1,
        total: 1,
        count: 0,
        totalRecords: 0
      }
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch invoices");
  }
};

/**
 * Get single invoice by ID
 */
export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch invoice");
  }
};

// Create invoice service
// ✅ Create a new invoice
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post("/invoices/create", invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error creating invoice" };
  }
};
  


/**
 * Update invoice
 */
export const updateInvoice = async (id, invoiceData) => {
  try {
    // Validate invoice ID
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Invalid invoice ID format");
    }
    
    // Ensure the ID is included in the URL or payload as required by your API
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw new Error(error.response?.data?.message || "Failed to update invoice");
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id) => {
  try {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new Error(error.response?.data?.message || "Failed to delete invoice");
  }
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INV-${year}${month}${day}-${random}`;
};
