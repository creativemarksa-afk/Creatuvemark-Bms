import api from "./api";

/**
 * Create a new application
 * @param {Object} applicationData - Application form data
 * @param {FileList} files - Uploaded files
 */
export const createApplication = async (applicationData, files = null) => {
  try {
    
    // Normalize payload to match backend enum requirements
    const normalizedData = { ...applicationData };
    
    // Map serviceType to backend enum values
    const serviceTypeMapping = {
      'business_registration': 'commercial',
      'business_registration_sole': 'commercial',
      'business_registration_partner': 'commercial',
      'commercial': 'commercial',
      'engineering': 'engineering',
      'real_estate': 'real_estate',
      'industrial': 'industrial',
      'agricultural': 'agricultural',
      'service': 'service',
      'advertising': 'advertising'
    };
    
    if (normalizedData.serviceType && serviceTypeMapping[normalizedData.serviceType]) {
      normalizedData.serviceType = serviceTypeMapping[normalizedData.serviceType];
    }
    
    // Normalize partnerType to backend enum values
    const partnerTypeMapping = {
      'sole': 'sole',
      'sole_proprietorship': 'sole',
      'with_partner': 'withSaudiPartner',
      'withSaudiPartner': 'withSaudiPartner',
      'saudi_partner': 'withSaudiPartner'
    };
    
    if (normalizedData.partnerType && partnerTypeMapping[normalizedData.partnerType]) {
      normalizedData.partnerType = partnerTypeMapping[normalizedData.partnerType];
    }
    
    // Ensure status is 'submitted' for new applications
    normalizedData.status = 'submitted';
    
    
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add normalized application data to FormData
    Object.keys(normalizedData).forEach(key => {
      if (normalizedData[key] !== null && normalizedData[key] !== undefined) {
        if (['externalCompaniesDetails', 'familyMembers', 'assignedEmployees'].includes(key) && Array.isArray(normalizedData[key])) {
          // Handle array data
          if (normalizedData[key].length > 0) {
            formData.append(key, JSON.stringify(normalizedData[key]));
          }
        } else if (key === 'approvedBy' || key === 'approvedAt') {
          // Skip admin fields for client submissions
          if (normalizedData[key]) {
            formData.append(key, normalizedData[key]);
          }
        } else {
          formData.append(key, normalizedData[key]);
        }
      }
    });

    // Add files to FormData
    if (files) {
      Object.keys(files).forEach(fieldName => {
        const fileList = files[fieldName];
        if (fileList && fileList.length > 0) {
          for (let i = 0; i < fileList.length; i++) {
            formData.append(fieldName, fileList[i]);
          }
        }
      });
    }

    
    const response = await api.post("/applications", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Create Application Error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    
    // More detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        "Failed to create application";
    
    // Log detailed error information for debugging
    console.error("Detailed error information:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: errorMessage
    });
    
    throw new Error(errorMessage);
  }
};


// Get client application details

export const getApplication = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error("Get Application Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get application"
    );
  }
};

/**
 * Get user's applications
 */
export const getUserApplications = async () => {
  try {
    const response = await api.get("/applications");
    return response.data;
  } catch (error) {
    console.error("Get User Applications Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get applications"
    );
  }
};

/**
 * Make payment for approved application
 * @param {string} applicationId - Application ID
 * @param {Object} paymentData - Payment information
 */
export const makePayment = async (applicationId, paymentData) => {
  try {
    const response = await api.post(`/applications/${applicationId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Make Payment Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to process payment"
    );
  }
};

/**
 * Get user information by ID
 * @param {string} userId - User ID
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get User Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get user information"
    );
  }
};


// Get all applications for admin
export const getAllApplications = async () => {
  try {
    const response = await api.get("/applications/all");
    return response.data;
  } catch (error) {
    console.error("Get All Applications Error:", error);
    
    // Handle 404 specifically - return empty data instead of throwing error
    if (error.response?.status === 404) {
      return {
        success: true,
        message: "No applications found",
        data: [],
        count: 0
      };
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get applications"
    );
  }
};

// Assign application to employees
export const assignApplicationToEmployees = async (applicationId, employeeIds, assignedBy, note = '') => {
  try {
    const response = await api.patch(`/applications/${applicationId}/assign`, {
      employeeIds,
      assignedBy,
      note
    });
    return response.data;
  } catch (error) {
    console.error("Assign Application Error:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to assign application"
    );
  }
};

/**
 * Delete an application
 * @param {string} applicationId - Application ID
 * @param {string} deletedBy - User ID of the person deleting
 */
export const deleteApplication = async (applicationId, deletedBy) => {
  try {
    console.log("Deleting application:", { applicationId, deletedBy });
    
    if (!deletedBy) {
      throw new Error("User ID is required for deletion");
    }
    
    const response = await api.delete(`/applications/${applicationId}`, {
      data: { deletedBy }
    });
    return response.data;
  } catch (error) {
    console.error("Delete Application Error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        "Failed to delete application";
    
    throw new Error(errorMessage);
  }
};

/**
 * Get application progress from timeline data
 * @param {string} applicationId - Application ID
 * @returns {Object} Application progress data
 */
export const getApplicationProgress = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}`);
    const application = response.data.data;
    
    // Extract current progress from timeline
    const timeline = application.timeline || [];
    const currentStatus = application.status?.current || application.status;
    
    // Find the latest timeline entry with progress
    const latestProgressEntry = timeline
      .filter(entry => entry.progress !== undefined && entry.progress !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    
    // Calculate overall progress based on status and latest progress entry
    const progressData = {
      currentStatus,
      progressPercentage: latestProgressEntry?.progress || 0,
      timeline: timeline,
      latestUpdate: latestProgressEntry?.createdAt || application.timestamps?.updatedAt,
      currentStep: latestProgressEntry?.status || currentStatus,
      note: latestProgressEntry?.note || null
    };
    
    return {
      success: true,
      data: progressData
    };
  } catch (error) {
    console.error("Get Application Progress Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get application progress"
    );
  }
};