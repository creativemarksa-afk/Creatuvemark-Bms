import Application from "../models/Application.js";
import ApplicationDocument from "../models/Document.js";
import ApplicationTimeline from "../models/Timeline.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Helper function to calculate payment amount based on service type
const calculateAmount = (application) => {
  const servicePricing = {
    commercial: 5000,
    engineering: 8000,
    real_estate: 10000,
    industrial: 12000,
    agricultural: 6000,
    service: 4000,
    advertising: 3000,
  };
  
  let baseAmount = servicePricing[application.serviceType] || 5000;
  
  // Add extra costs for additional services
  if (application.needVirtualOffice) {
    baseAmount += 2000;
  }
  
  if (application.externalCompaniesCount > 0) {
    baseAmount += application.externalCompaniesCount * 1000;
  }
  
  return baseAmount;
};

// Helper function to get next month date
const getNextMonthDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};

/**
 * @desc    Create a new application
 * @route   POST /api/applications
 * @access  Private (Client)
 * @param   {Object} req.body - Application data
 * @param   {string} req.body.userId - User ID (required)
 * @param   {string} req.body.serviceType - Service type (required)
 * @param   {number} [req.body.externalCompaniesCount] - Number of external companies (default: 0)
 * @param   {Array} [req.body.externalCompaniesDetails] - External companies details
 * @param   {number} [req.body.projectEstimatedValue] - Project estimated value
 * @param   {Array} [req.body.familyMembers] - Family members details
 * @param   {boolean} [req.body.needVirtualOffice] - Need virtual office (default: false)
 * @param   {boolean} [req.body.companyArrangesExternalCompanies] - Company arranges external companies (default: false)
 * @param   {string} [req.body.status] - Application status (default: "submitted")
 * @param   {string} [req.body.approvedBy] - Approver user ID
 * @param   {string} [req.body.approvedAt] - Approval date
 * @param   {Array} [req.body.assignedEmployees] - Assigned employee IDs
 * @param   {Object} req.files - Uploaded documents
 * @returns {Object} Created application details with all fields
 */
export const addApplication = async (req, res) => {
    try {
  
    // Get the authenticated user from the middleware (security fix)
    const authenticatedUserId = req.user.id;
    console.log("Authenticated user from middleware:", authenticatedUserId);
    console.log("User from request body:", req.body.userId);
    
    const {
      userId, // This should be ignored for security - use authenticated user instead
      serviceType,
      externalCompaniesCount,
      externalCompaniesDetails,
      projectEstimatedValue,
      familyMembers,
      needVirtualOffice,
      companyArrangesExternalCompanies,
      // Additional fields from the model
      approvedBy,
      approvedAt,
      assignedEmployees,
      status
    } = req.body;
  
      
      if (!authenticatedUserId || !serviceType) {
        console.log("Validation failed: Missing required fields", { authenticatedUserId, serviceType });
        const missingFields = [];
        if (!authenticatedUserId) missingFields.push("Authenticated User ID");
        if (!serviceType) missingFields.push("Service Type");
        
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields: missingFields,
        });
      }

      // Validate serviceType enum
      const validServiceTypes = ["commercial", "engineering", "real_estate", "industrial", "agricultural", "service", "advertising"];
      if (!validServiceTypes.includes(serviceType)) {
        console.log("Validation failed: Invalid service type", { serviceType, validServiceTypes });
        return res.status(400).json({
          success: false,
          message: `Invalid service type. Must be one of: ${validServiceTypes.join(", ")}`,
          providedServiceType: serviceType,
          validServiceTypes: validServiceTypes,
        });
      }
  
      // Verify authenticated user exists
      const user = await User.findById(authenticatedUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Authenticated user not found",
        });
      }
  
      // Parse JSON arrays if sent as strings
      let parsedExternalCompanies = [];
      let parsedFamilyMembers = [];
      let parsedAssignedEmployees = [];

      try {
        if (externalCompaniesDetails) {
          parsedExternalCompanies = Array.isArray(externalCompaniesDetails)
            ? externalCompaniesDetails
            : JSON.parse(externalCompaniesDetails);
        }
      } catch (err) {
        console.warn("Invalid externalCompaniesDetails JSON:", externalCompaniesDetails);
      }

      try {
        if (familyMembers) {
          parsedFamilyMembers = Array.isArray(familyMembers)
            ? familyMembers
            : JSON.parse(familyMembers);
        }
      } catch (err) {
        console.warn("Invalid familyMembers JSON:", familyMembers);
      }

      try {
        if (assignedEmployees) {
          parsedAssignedEmployees = Array.isArray(assignedEmployees)
            ? assignedEmployees
            : JSON.parse(assignedEmployees);
        }
      } catch (err) {
        console.warn("Invalid assignedEmployees JSON:", assignedEmployees);
      }

      // Validate status if provided
      const validStatuses = ["submitted", "under_review", "approved", "in_process", "completed", "rejected"];
      const finalStatus = status && validStatuses.includes(status) ? status : "submitted";

      // Validate approvedBy if provided
      if (approvedBy) {
        const approver = await User.findById(approvedBy);
        if (!approver || !["staff", "admin"].includes(approver.role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid approver. Only staff and admin can approve applications"
          });
        }
      }

      // Validate assignedEmployees if provided
      if (parsedAssignedEmployees.length > 0) {
        const employees = await User.find({ _id: { $in: parsedAssignedEmployees } });
        if (employees.length !== parsedAssignedEmployees.length) {
          return res.status(400).json({
            success: false,
            message: "One or more assigned employees not found"
          });
        }
      }
  
   
      
      const application = new Application({
        userId: authenticatedUserId, // Use authenticated user ID for security
        serviceType,
        externalCompaniesCount: externalCompaniesCount || 0,
        externalCompaniesDetails: parsedExternalCompanies,
        projectEstimatedValue,
        familyMembers: parsedFamilyMembers,
        needVirtualOffice: needVirtualOffice || false,
        companyArrangesExternalCompanies: companyArrangesExternalCompanies || false,
        // Additional fields from model
        status: finalStatus,
        approvedBy: approvedBy || null,
        approvedAt: approvedAt ? new Date(approvedAt) : null,
        assignedEmployees: parsedAssignedEmployees,
      });

      await application.save();

      // Auto-create payment record after application is submitted
      const totalAmount = calculateAmount(application);
      const dueDate = getNextMonthDate();
      
      const payment = new Payment({
        applicationId: application._id,
        clientId: authenticatedUserId,
        totalAmount: totalAmount,
        dueDate: dueDate,
        status: "pending",
        paymentPlan: "full", // Default to full payment, client can change later
      });

      await payment.save();
      console.log("✅ Payment record auto-created for application:", application._id, "Amount:", totalAmount);
    
  
      // Handle document uploads (req.files from Cloudinary)
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("Processing uploaded files:", Object.keys(req.files));
        const documentPromises = [];

        for (const field in req.files) {
          const fileArray = req.files[field];
          for (const file of fileArray) {
            console.log(`Saving document: ${field} -> ${file.path}`);
            documentPromises.push(
              ApplicationDocument.create({
                applicationId: application._id,
                type: field,
                fileUrl: file.path, // 🔑 Cloudinary URL stored here
                uploadedBy: authenticatedUserId,
              })
            );
          }
        }

        await Promise.all(documentPromises);
        console.log("All documents saved to Cloudinary successfully!");
      }
  
      // Create initial timeline entry
      await ApplicationTimeline.create({
        applicationId: application._id,
        status: "submitted",
        note: "Application submitted by client",
        progress: 0,
        updatedBy: authenticatedUserId,
      });

      // Notify admins about new application submission
     // Notify admins about new application submission
const io = req.app.get('io');
if (io) {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id fullName');
    const clientName = user.fullName || user.name || 'Client';

    for (const admin of admins) {
      const notificationData = {
        userId: admin._id,
        type: 'info',
        title: 'New Application Received',
        message: `A new ${application.serviceType} application was submitted by ${clientName}.`,
        priority: 'high',
        data: {
          applicationId: application._id,
          serviceType: application.serviceType,
          submittedBy: clientName,
          submittedAt: new Date()
        }
      };

      // ✅ Save notification in DB
      const savedNotification = new Notification(notificationData);
      await savedNotification.save();
      console.log('✅ Admin notification saved:', savedNotification._id, 'for admin:', admin._id);

      // ✅ Emit real-time notification with full notification object
      io.to(`user_${admin._id}`).emit('new_application_notification', savedNotification);
      io.to(`user_${admin._id}`).emit('notification', savedNotification);
      console.log('📤 Admin notification emitted to user:', admin._id);
    }

    console.log('✅ Notifications stored & emitted successfully to admins.');
  } catch (notificationError) {
    console.error('❌ Error sending admin notifications:', notificationError);
    // Continue response even if notification fails
  }
} else {
  console.warn('⚠️ Socket.IO not available - cannot send notifications');
}

  
      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: {
          applicationId: application._id,
          status: application.status,
          serviceType: application.serviceType,
          externalCompaniesCount: application.externalCompaniesCount,
          needVirtualOffice: application.needVirtualOffice,
          approvedBy: application.approvedBy,
          approvedAt: application.approvedAt,
          assignedEmployees: application.assignedEmployees,
          submittedAt: application.createdAt,
          updatedAt: application.updatedAt,
          payment: {
            paymentId: payment._id,
            totalAmount: payment.totalAmount,
            dueDate: payment.dueDate,
            status: payment.status,
            paymentPlan: payment.paymentPlan,
          },
        },
      });
    } catch (error) {
      console.error("Add Application Error:", error);
  
      if (error.name === "ValidationError") {
        console.error("Validation errors:", Object.values(error.errors).map(err => err.message));
        console.error("Validation error fields:", Object.keys(error.errors));
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((err) => err.message),
          details: Object.keys(error.errors)
        });
      }
  
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  };
  

/**
 * @desc    Review application (approve/reject)
 * @route   PATCH /api/applications/:applicationId/review
 * @access  Private (Staff/Admin)
 * @param   {string} req.params.applicationId - Application ID
 * @param   {string} req.body.action - Review action (approve/reject)
 * @param   {string} req.body.staffId - Staff member ID
 * @param   {string} [req.body.reason] - Reason for rejection
 * @returns {Object} Review result
 */
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, staffId, reason } = req.body;

    // Validate required fields
    if (!action || !staffId) {
      return res.status(400).json({
        success: false,
        message: "Action and staff ID are required"
      });
    }

    // Validate action
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'"
      });
    }

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if application is in reviewable state
    if (application.status !== "submitted" && application.status !== "under_review") {
      return res.status(400).json({
        success: false,
        message: `Application cannot be reviewed. Current status: ${application.status}`
      });
    }

    // Verify staff member exists
    const staff = await User.findById(staffId);
    if (!staff || !["staff", "admin"].includes(staff.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only staff and admin can review applications"
      });
    }

    // Process approval
    if (action === "approve") {
      application.status = "approved";
      application.approvedBy = staffId;
      application.approvedAt = new Date();
      await application.save();

      await ApplicationTimeline.create({
        applicationId: application._id,
        status: "approved",
        note: "Application approved. Awaiting payment.",
        updatedBy: staffId,
      });

      // Emit notification to client
      const io = req.app.get('io');
      if (io) {
        const clientMessage = reason 
          ? `Your ${application.serviceType} application has been approved! You can now proceed with payment. Note: ${reason}`
          : `Your ${application.serviceType} application has been approved! You can now proceed with payment.`;
          
        io.to(`user_${application.userId}`).emit('status_update_notification', {
          applicationId: application._id,
          status: 'approved',
          message: clientMessage,
          updatedBy: staff.fullName,
          note: reason,
          timestamp: new Date()
        });

        // Notify assigned employees
        application.assignedEmployees.forEach(assignment => {
          const employeeMessage = reason
            ? `Application ${application._id} has been approved by ${staff.fullName}. Note: ${reason}`
            : `Application ${application._id} has been approved by ${staff.fullName}`;
            
          io.to(`user_${assignment.employeeId}`).emit('status_update_notification', {
            applicationId: application._id,
            status: 'approved',
            message: employeeMessage,
            updatedBy: staff.fullName,
            note: reason,
            timestamp: new Date()
          });
        });
      }

      return res.json({
        success: true,
        message: "Application approved successfully",
        data: {
          applicationId: application._id,
          status: application.status,
          approvedBy: staff.fullName,
          approvedAt: application.approvedAt
        }
      });
    }

    // Process rejection
    if (action === "reject") {
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Reason is required for rejection"
        });
      }

      application.status = "rejected";
      await application.save();

      await ApplicationTimeline.create({
        applicationId: application._id,
        status: "rejected",
        note: `Application rejected. Reason: ${reason}`,
        updatedBy: staffId,
      });

      // Emit notification to client
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${application.userId}`).emit('status_update_notification', {
          applicationId: application._id,
          status: 'rejected',
          message: `Your ${application.serviceType} application has been rejected. Reason: ${reason}`,
          updatedBy: staff.fullName,
          note: reason,
          timestamp: new Date()
        });

        // Notify assigned employees
        application.assignedEmployees.forEach(assignment => {
          const employeeMessage = `Application ${application._id} has been rejected by ${staff.fullName}. Reason: ${reason}`;
          
          io.to(`user_${assignment.employeeId}`).emit('status_update_notification', {
            applicationId: application._id,
            status: 'rejected',
            message: employeeMessage,
            updatedBy: staff.fullName,
            note: reason,
            timestamp: new Date()
          });
        });
      }

      return res.json({
        success: true,
        message: "Application rejected",
        data: {
          applicationId: application._id,
          status: application.status,
          rejectedBy: staff.fullName,
          rejectedAt: new Date(),
          reason
        }
      });
    }
  } catch (error) {
    console.error("Review Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * @desc    Process payment for approved application
 * @route   POST /api/applications/:applicationId/payment
 * @access  Private (Client)
 * @param   {string} req.params.applicationId - Application ID
 * @param   {number} req.body.amount - Payment amount
 * @param   {string} req.body.method - Payment method
 * @param   {string} req.body.plan - Payment plan
 * @param   {string} req.body.userId - User making payment
 * @returns {Object} Payment confirmation
 */
export const makePayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { amount, method, plan, userId } = req.body;

    // Validate required fields
    if (!amount || !method || !plan || !userId) {
      return res.status(400).json({
        success: false,
        message: "Amount, method, plan, and user ID are required"
      });
    }

    // Validate payment method
    if (!["card", "bank_transfer", "cash"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    // Validate payment plan
    if (!["full", "installment"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment plan"
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0"
      });
    }

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check application status
    if (application.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Payment allowed only for approved applications",
        currentStatus: application.status
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ applicationId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this application"
      });
    }

    // Verify user exists and is the application owner
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (application.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only pay for your own applications"
      });
    }

    // Create payment record
    const payment = new Payment({
      applicationId,
      amount,
      method,
      plan,
      status: "paid",
      paidBy: userId,
      transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    await payment.save();

    // Update application status
    application.status = "in_process";
    await application.save();

    // Create timeline entry
    await ApplicationTimeline.create({
      applicationId,
      status: "in_process",
      note: `Payment received via ${method} (${plan} plan) - Amount: ${amount} SAR`,
      updatedBy: userId,
    });

    // Emit notification to assigned employees
    const io = req.app.get('io');
    if (io) {
      const paymentNote = `Payment received via ${method} (${plan} plan) - Amount: ${amount} SAR`;
      
      application.assignedEmployees.forEach(assignment => {
        io.to(`user_${assignment.employeeId}`).emit('status_update_notification', {
          applicationId: application._id,
          status: 'in_process',
          message: `Payment received for application ${application._id}. Processing can now begin.`,
          updatedBy: user.fullName,
          note: paymentNote,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        paymentId: payment._id,
        transactionRef: payment.transactionRef,
        amount: payment.amount,
        method: payment.method,
        plan: payment.plan,
        status: payment.status,
        paidAt: payment.createdAt,
        applicationStatus: application.status
      }
    });
  } catch (error) {
    console.error("Make Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * @desc    Get application details with full information
 * @route   GET /api/applications/:applicationId
 * @access  Private (Client/Staff/Admin)
 * @param   {string} req.params.applicationId - Application ID
 * @returns {Object} Complete application details
 */
export const getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Validate application ID format
    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format"
      });
    }

    const application = await Application.findById(applicationId)
      .populate("userId", "fullName email phone role nationality")
      .populate("assignedEmployees.employeeId", "fullName email role position")
      .populate("approvedBy", "fullName email role")
      .populate("documents")
      .populate("timeline")
      .populate("payment");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Format response data
    const responseData = {
      applicationId: application._id,
      client: {
        id: application.userId._id,
        name: application.userId.fullName,
        email: application.userId.email,
        phone: application.userId.phone,
        role: application.userId.role,
        nationality: application.userId.nationality
      },
      serviceDetails: {
        serviceType: application.serviceType,
        externalCompaniesCount: application.externalCompaniesCount,
        externalCompaniesDetails: application.externalCompaniesDetails,
        projectEstimatedValue: application.projectEstimatedValue,
        familyMembers: application.familyMembers,
        needVirtualOffice: application.needVirtualOffice
      },
      status: {
        current: application.status,
        approvedBy: application.approvedBy ? {
          id: application.approvedBy._id,
          name: application.approvedBy.fullName,
          email: application.approvedBy.email
        } : null,
        approvedAt: application.approvedAt
      },
      assignedEmployees: application.assignedEmployees.map(assignment => ({
        id: assignment.employeeId._id,
        name: assignment.employeeId.fullName,
        email: assignment.employeeId.email,
        role: assignment.employeeId.role,
        position: assignment.employeeId.position,
        task: assignment.task,
        assignedAt: assignment.assignedAt,
      })),
      documents: application.documents || [],
      timeline: application.timeline || [],
      payment: application.payment || null,
      timestamps: {
        createdAt: application.createdAt,
        updatedAt: application.updatedAt
      }
    };

    res.json({
      success: true,
      message: "Application retrieved successfully",
      data: responseData
    });
  } catch (error) {
    console.error("Get Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * @desc    Get all applications for the authenticated user
 * @route   GET /api/applications
 * @access  Private (Client)
 * @returns {Object} List of user's applications
 */
export const getUserApplications = async (req, res) => {
  try {
    // Get user ID from the authenticated user (from auth middleware)
    const userId = req.user.id;
    console.log("Get User Applications - User ID:", userId);
    console.log("Get User Applications - User:", req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Find all applications for this user
    console.log("Searching for applications with userId:", userId, "Type:", typeof userId);
    
    // First, let's check if there are any applications in the database at all
    const allApplications = await Application.find({}).select('_id userId serviceType createdAt');
    console.log("All applications in database:", allApplications.length);
    allApplications.forEach(app => {
      console.log(`App ${app._id}: userId=${app.userId} (${typeof app.userId}), serviceType=${app.serviceType}, createdAt=${app.createdAt}`);
    });
    
    const applications = await Application.find({ userId })
      .populate("documents")
      .populate("timeline")
      .populate("payment")
      .select('_id serviceType status externalCompaniesCount needVirtualOffice createdAt updatedAt')
      .sort({ createdAt: -1 }); // Most recent first

    console.log("Found applications for user:", applications.length, applications);

    // Format response data to match frontend expectations
    const formattedApplications = applications.map((app) => ({
      _id: app._id,
      serviceType: app.serviceType, // Keep direct field for compatibility
      serviceDetails: {
        serviceType: app.serviceType,
        externalCompaniesCount: app.externalCompaniesCount,
        needVirtualOffice: app.needVirtualOffice
      },
      status: {
        current: app.status
      },
      timestamps: {
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      },
      documents: app.documents || [],
      timeline: app.timeline || [],
      payment: app.payment || null,
      progressPercentage: app.timeline && app.timeline.length > 0 
        ? Math.max(...app.timeline.map(t => t.progress || 0))
        : 0
    }));

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: formattedApplications
    });

  } catch (error) {
    console.error("Get User Applications Error:", error);
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};


// Get all applications for admin
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("userId", "fullName email phone role nationality")
      .populate("assignedEmployees.employeeId", "fullName email role position")
      .populate("approvedBy", "fullName email role")
      .populate("documents")
      .populate("timeline")
      .populate("payment")
      .sort({ createdAt: -1 }); // Show latest first

    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No applications found",
        data: [],
        count: 0,
      });
    }

    // Map into structured response
    const formattedApplications = applications.map((app) => ({
      applicationId: app._id,
      client: app.userId
        ? {
            id: app.userId._id,
            name: app.userId.fullName,
            email: app.userId.email,
            phone: app.userId.phone,
            role: app.userId.role,
            nationality: app.userId.nationality,
          }
        : null,
      serviceDetails: {
        serviceType: app.serviceType,
        externalCompaniesCount: app.externalCompaniesCount,
        externalCompaniesDetails: app.externalCompaniesDetails,
        projectEstimatedValue: app.projectEstimatedValue,
        familyMembers: app.familyMembers,
        needVirtualOffice: app.needVirtualOffice,
      },
      status: {
        current: app.status,
        approvedBy: app.approvedBy
          ? {
              id: app.approvedBy._id,
              name: app.approvedBy.fullName,
              email: app.approvedBy.email,
            }
          : null,
        approvedAt: app.approvedAt,
      },
      assignedEmployees: app.assignedEmployees.map((assignment) => ({
        id: assignment.employeeId._id,
        name: assignment.employeeId.fullName,
        email: assignment.employeeId.email,
        role: assignment.employeeId.role,
        position: assignment.employeeId.position,
        task: assignment.task,
        assignedAt: assignment.assignedAt,
      })),
      documents: app.documents || [],
      timeline: app.timeline || [],
      payment: app.payment || null,
      timestamps: {
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      },
    }));

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: formattedApplications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

/**
 * @desc    Assign application to employees
 * @route   PATCH /api/applications/:applicationId/assign
 * @access  Private (Internal/Admin)
 * @param   {string} req.params.applicationId - Application ID
 * @param   {Array} req.body.employeeIds - Array of employee IDs to assign
 * @param   {string} req.body.assignedBy - ID of the user assigning the application
 * @param   {string} [req.body.note] - Optional note about the assignment
 * @returns {Object} Updated application with assigned employees
 */
export const assignApplicationToEmployees = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { employeeIds, assignedBy, note } = req.body;

    // Validate input
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee IDs array is required and must not be empty",
      });
    }

    if (!assignedBy) {
      return res.status(400).json({
        success: false,
        message: "Assigned by user ID is required",
      });
    }

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Validate that all employee IDs exist and are employees
    const employees = await User.find({
      _id: { $in: employeeIds },
      role: { $in: ['employee', 'admin'] }
    });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more employee IDs are invalid or not employees",
      });
    }

    // Format employee IDs for the schema (array of objects with employeeId, task, assignedAt)
    const assignedEmployeesData = employeeIds.map(employeeId => ({
      employeeId: employeeId,
      task: 'Application processing',
      assignedAt: new Date()
    }));

    // Update application with assigned employees
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          assignedEmployees: assignedEmployeesData,
          status: application.status === 'submitted' ? 'under_review' : application.status,
        },
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'userId', select: 'name email phone nationality role' },
      { path: 'assignedEmployees.employeeId', select: 'name email phone role' },
      { path: 'approvedBy', select: 'name email role' }
    ]);

    // Create timeline entry for assignment
    await ApplicationTimeline.create({
      applicationId: applicationId,
      status: updatedApplication.status,
      note: note || `Application assigned to ${employees.length} employee(s)`,
      updatedBy: assignedBy,
      progress: updatedApplication.status === 'under_review' ? 25 : 0,
    });

    // Emit assignment notifications and save to database
    const io = req.app.get('io');
    if (io) {
      // Notify assigned employees and save to database
      for (const employeeId of employeeIds) {
        const assignmentMessage = `You have been assigned to handle application ${applicationId}`;
        
        // Save notification to database
        const employeeNotification = new Notification({
          userId: employeeId,
          type: 'info',
          title: 'New Application Assignment',
          message: assignmentMessage,
          priority: 'high',
          data: {
            applicationId: applicationId,
            assignedBy: req.user.fullName || 'System',
            assignedAt: new Date()
          }
        });
        await employeeNotification.save();
        
        io.to(`user_${employeeId}`).emit('assignment_notification', employeeNotification);
        io.to(`user_${employeeId}`).emit('notification', employeeNotification);
      }

      // Notify client and save to database
      const clientMessage = note 
        ? `Your application has been assigned to our team and is now under review. Note: ${note}`
        : `Your application has been assigned to our team and is now under review`;
        
      // Save notification to database
      const clientNotification = new Notification({
        userId: updatedApplication.userId._id,
        type: 'success',
        title: 'Application Assigned',
        message: clientMessage,
        priority: 'medium',
        data: {
          applicationId: applicationId,
          status: updatedApplication.status,
          assignedBy: req.user.fullName || 'System',
          note: note
        }
      });
      await clientNotification.save();
      
      io.to(`user_${updatedApplication.userId._id}`).emit('status_update_notification', clientNotification);
      io.to(`user_${updatedApplication.userId._id}`).emit('notification', clientNotification);
    }

    // Format the response
    const formattedApplication = {
      applicationId: updatedApplication._id,
      client: {
        id: updatedApplication.userId._id,
        name: updatedApplication.userId.name,
        email: updatedApplication.userId.email,
        phone: updatedApplication.userId.phone,
        role: updatedApplication.userId.role,
        nationality: updatedApplication.userId.nationality,
      },
      serviceDetails: {
        serviceType: updatedApplication.serviceType,
        externalCompaniesCount: updatedApplication.externalCompaniesCount,
        externalCompaniesDetails: updatedApplication.externalCompaniesDetails,
        familyMembers: updatedApplication.familyMembers,
        needVirtualOffice: updatedApplication.needVirtualOffice,
      },
      status: {
        current: updatedApplication.status,
        approvedBy: updatedApplication.approvedBy ? {
          id: updatedApplication.approvedBy._id,
          name: updatedApplication.approvedBy.name,
          email: updatedApplication.approvedBy.email,
          role: updatedApplication.approvedBy.role,
        } : null,
        approvedAt: updatedApplication.approvedAt,
      },
      assignedEmployees: updatedApplication.assignedEmployees.map(assignment => ({
        id: assignment.employeeId._id,
        name: assignment.employeeId.name,
        email: assignment.employeeId.email,
        phone: assignment.employeeId.phone,
        role: assignment.employeeId.role,
        task: assignment.task,
        assignedAt: assignment.assignedAt,
      })),
      documents: updatedApplication.documents || [],
      timeline: updatedApplication.timeline || [],
      payment: updatedApplication.payment || null,
      timestamps: {
        createdAt: updatedApplication.createdAt,
        updatedAt: updatedApplication.updatedAt,
      },
    };

    res.status(200).json({
      success: true,
      message: `Application successfully assigned to ${employees.length} employee(s)`,
      data: formattedApplication,
    });

  } catch (error) {
    console.error("Assign Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

/**
 * @desc    Delete an application
 * @route   DELETE /api/applications/:applicationId
 * @access  Private (Admin/Staff)
 * @param   {string} req.params.applicationId - Application ID
 * @param   {string} req.body.deletedBy - User ID of the person deleting
 * @returns {Object} Deletion result
 */
export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { deletedBy } = req.body;

    // Validate required fields
    if (!deletedBy) {
      return res.status(400).json({
        success: false,
        message: "Deleted by user ID is required"
      });
    }

    // Validate application ID format
    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format"
      });
    }

    // Find application to ensure it exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify the user deleting has permission (admin or staff)
    const user = await User.findById(deletedBy);
    if (!user || !["admin", "staff"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only admin and staff can delete applications"
      });
    }

    // Delete related documents
    await ApplicationDocument.deleteMany({ applicationId });

    // Delete related timeline entries
    await ApplicationTimeline.deleteMany({ applicationId });

    // Delete related payments
    await Payment.deleteMany({ applicationId });

    // Delete the application itself
    await Application.findByIdAndDelete(applicationId);

    // Emit notification to client about deletion
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${application.userId}`).emit('application_deleted_notification', {
        applicationId: applicationId,
        message: `Your ${application.serviceType} application has been deleted by ${user.fullName}`,
        deletedBy: user.fullName,
        deletedAt: new Date(),
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
      data: {
        applicationId: applicationId,
        deletedBy: user.fullName,
        deletedAt: new Date(),
        serviceType: application.serviceType,
        clientId: application.userId
      }
    });

  } catch (error) {
    console.error("Delete Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * @desc    Get applications assigned to current employee
 * @route   GET /api/applications/assigned-to-me
 * @access  Private (Employee)
 * @param   {Object} req.user - Authenticated user
 * @returns {Object} Applications assigned to the current employee
 */
export const getAssignedApplications = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Find applications where the current employee is assigned
    const applications = await Application.find({
      "assignedEmployees.employeeId": employeeId
    })
      .populate("userId", "fullName email phone nationality")
      .populate("assignedEmployees.employeeId", "fullName email role position")
      .populate("approvedBy", "fullName email role")
      .populate("documents")
      .populate("timeline")
      .populate("payment")
      .sort({ createdAt: -1 });

    // Format the applications for response
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      serviceType: app.serviceType,
      status: {
        current: app.status,
        approvedBy: app.approvedBy ? {
          id: app.approvedBy._id,
          name: app.approvedBy.fullName,
          email: app.approvedBy.email
        } : null,
        approvedAt: app.approvedAt
      },
      clientName: app.userId?.fullName || app.userId?.name || 'Unknown Client',
      clientEmail: app.userId?.email,
      clientPhone: app.userId?.phone,
      externalCompaniesCount: app.externalCompaniesCount,
      needVirtualOffice: app.needVirtualOffice,
      companyArrangesExternalCompanies: app.companyArrangesExternalCompanies,
      assignedEmployees: app.assignedEmployees.map(assignment => ({
        id: assignment.employeeId._id,
        name: assignment.employeeId.fullName,
        email: assignment.employeeId.email,
        role: assignment.employeeId.role,
        position: assignment.employeeId.position,
        assignedAt: assignment.assignedAt
      })),
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      dueDate: app.dueDate,
      priority: app.priority
    }));

    res.status(200).json({
      success: true,
      message: "Assigned applications retrieved successfully",
      data: formattedApplications,
    });

  } catch (error) {
    console.error("Get Assigned Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};