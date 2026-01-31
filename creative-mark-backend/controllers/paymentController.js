import Payment from "../models/Payment.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * @desc    Get client payments
 * @route   GET /api/payments/client
 * @access  Private (Client)
 */
export const getClientPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ clientId: userId })
      .populate("applicationId", "serviceType status")
      .populate("clientId", "fullName name email phone phoneCountryCode nationality address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Client payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Get Client Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private (Client/Admin)
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate("applicationId", "serviceType status userId")
      .populate("clientId", "fullName name email phone phoneCountryCode nationality address")
      .populate("paidBy", "fullName name email")
      .populate("verifiedBy", "fullName name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check authorization
    const user = await User.findById(userId);
    if (user.role !== "admin" && payment.clientId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Get Payment Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Submit payment with receipt upload
 * @route   POST /api/payments/:paymentId/submit
 * @access  Private (Client)
 */
export const submitPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentPlan } = req.body;
    const userId = req.user.id;

    console.log("Submit Payment - paymentId:", paymentId);
    console.log("Submit Payment - paymentPlan:", paymentPlan);
    console.log("Submit Payment - req.file:", req.file);
    console.log("Submit Payment - req.body:", req.body);

    // Validate payment plan
    if (!paymentPlan || !["full", "installments"].includes(paymentPlan)) {
      return res.status(400).json({
        success: false,
        message: "Payment plan must be 'full' or 'installments'",
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check authorization
    if (payment.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit payment for this application",
      });
    }

    // Check if payment is already submitted
    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been submitted",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment receipt file is required",
      });
    }

    // Upload receipt (using Cloudinary middleware)
    const receiptUrl = req.file.path;

    // Update payment
    payment.paymentPlan = paymentPlan;
    payment.receiptImage = receiptUrl;
    payment.status = "submitted";
    payment.paidBy = userId;

    // If installments, create installment records
    if (paymentPlan === "installments") {
      const installmentAmount = payment.totalAmount / 3; // Default to 3 installments
      payment.installments = [
        { amount: installmentAmount, status: "submitted", receiptImage: receiptUrl, uploadedAt: new Date() },
        { amount: installmentAmount, status: "pending" },
        { amount: installmentAmount, status: "pending" }
      ];
    }

    await payment.save();

    // Notify admins about new payment submission
    const io = req.app.get("io");
    const admins = await User.find({ role: "admin" }).select("_id fullName");
    const client = await User.findById(userId);

    for (const admin of admins) {
      const notificationData = {
        userId: admin._id,
        type: "info",
        title: "New Payment Receipt Uploaded",
        message: `${client.fullName || client.name} uploaded a payment receipt for application ${payment.applicationId}.`,
        priority: "high",
        data: {
          paymentId: payment._id,
          applicationId: payment.applicationId,
          submittedBy: client.fullName || client.name,
          submittedAt: new Date(),
          paymentPlan: paymentPlan,
        },
      };

      const savedNotification = new Notification(notificationData);
      await savedNotification.save();

      if (io) {
        io.to(`user_${admin._id}`).emit("new_payment_notification", savedNotification);
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment submitted successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Submit Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Upload installment receipt
 * @route   POST /api/payments/:paymentId/installments/:installmentIndex/upload
 * @access  Private (Client)
 */
export const uploadInstallmentReceipt = async (req, res) => {
  try {
    const { paymentId, installmentIndex } = req.params;
    const userId = req.user.id;

    console.log("Upload Installment - paymentId:", paymentId);
    console.log("Upload Installment - installmentIndex:", installmentIndex);
    console.log("Upload Installment - req.file:", req.file);

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment receipt file is required",
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check authorization
    if (payment.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload receipt for this payment",
      });
    }

    // Check if payment plan is installments
    if (payment.paymentPlan !== "installments") {
      return res.status(400).json({
        success: false,
        message: "This payment is not set up for installments",
      });
    }

    const index = parseInt(installmentIndex);
    if (index < 0 || index >= payment.installments.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid installment index",
      });
    }

    // Upload receipt
    const receiptUrl = req.file.path;

    // Update installment
    payment.installments[index].receiptImage = receiptUrl;
    payment.installments[index].status = "submitted";
    payment.installments[index].uploadedAt = new Date();

    await payment.save();

    // Notify admins
    const io = req.app.get("io");
    const admins = await User.find({ role: "admin" }).select("_id fullName");
    const client = await User.findById(userId);

    for (const admin of admins) {
      const notificationData = {
        userId: admin._id,
        type: "info",
        title: "New Installment Receipt Uploaded",
        message: `${client.fullName || client.name} uploaded a receipt for installment ${index + 1} of application ${payment.applicationId}.`,
        priority: "high",
        data: {
          paymentId: payment._id,
          applicationId: payment.applicationId,
          installmentIndex: index,
          submittedBy: client.fullName || client.name,
          submittedAt: new Date(),
        },
      };

      const savedNotification = new Notification(notificationData);
      await savedNotification.save();

      if (io) {
        io.to(`user_${admin._id}`).emit("new_payment_notification", savedNotification);
      }
    }

    res.status(200).json({
      success: true,
      message: "Installment receipt uploaded successfully",
      data: payment.installments[index],
    });
  } catch (error) {
    console.error("Upload Installment Receipt Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get all payments for admin review
 * @route   GET /api/payments/admin/pending
 * @access  Private (Admin)
 */
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [
        { status: "submitted" },
        { "installments.status": "submitted" }
      ]
    })
      .populate("applicationId", "serviceType status")
      .populate("clientId", "fullName name email phone phoneCountryCode nationality address")
      .populate("paidBy", "fullName name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Pending payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Get Pending Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Approve or reject payment
 * @route   PATCH /api/payments/:paymentId/verify
 * @access  Private (Admin)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, adminNotes } = req.body; // action: "approve" or "reject"
    const adminId = req.user.id;

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'",
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if payment is in submitted status
    if (payment.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Payment is not in submitted status",
      });
    }

    // Update payment status
    payment.status = action === "approve" ? "approved" : "rejected";
    payment.verifiedByAdmin = true;
    payment.verifiedAt = new Date();
    payment.verifiedBy = adminId;
    payment.adminNotes = adminNotes;

    await payment.save();

    // If approved, update application status to active
    if (action === "approve") {
      await Application.findByIdAndUpdate(payment.applicationId, {
        status: "in_process"
      });
    }

    // Notify client about verification result
    const client = await User.findById(payment.clientId);
    const admin = await User.findById(adminId);

    const notificationData = {
      userId: payment.clientId,
      type: action === "approve" ? "success" : "error",
      title: action === "approve" ? "Payment Verified" : "Payment Rejected",
      message: action === "approve" 
        ? `Your payment has been verified and approved. Your application is now active.`
        : `Your payment receipt was not approved. Please re-upload. ${adminNotes ? `Reason: ${adminNotes}` : ""}`,
      priority: "high",
      data: {
        paymentId: payment._id,
        applicationId: payment.applicationId,
        status: payment.status,
        adminNotes,
        verifiedBy: admin.fullName || admin.name,
      },
    };

    const savedNotification = new Notification(notificationData);
    await savedNotification.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${payment.clientId}`).emit("payment_verification", savedNotification);
    }

    res.status(200).json({
      success: true,
      message: `Payment ${action}d successfully`,
      data: payment,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Verify installment payment
 * @route   PATCH /api/payments/:paymentId/installments/:installmentIndex/verify
 * @access  Private (Admin)
 */
export const verifyInstallmentPayment = async (req, res) => {
  try {
    const { paymentId, installmentIndex } = req.params;
    const { action, adminNotes } = req.body; // action: "approve" or "reject"
    const adminId = req.user.id;

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'",
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const index = parseInt(installmentIndex);
    if (index < 0 || index >= payment.installments.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid installment index",
      });
    }

    const installment = payment.installments[index];

    // Check if installment is in submitted status
    if (installment.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Installment is not in submitted status",
      });
    }

    // Update installment status
    installment.status = action === "approve" ? "approved" : "rejected";
    installment.verifiedByAdmin = true;
    installment.verifiedAt = new Date();
    installment.verifiedBy = adminId;
    installment.adminNotes = adminNotes;

    await payment.save();

    // Check if all installments are approved
    const allApproved = payment.installments.every(inst => inst.status === "approved");
    if (allApproved) {
      payment.status = "approved";
      payment.verifiedByAdmin = true;
      payment.verifiedAt = new Date();
      payment.verifiedBy = adminId;
      await payment.save();

      // Update application status to active
      await Application.findByIdAndUpdate(payment.applicationId, {
        status: "in_process"
      });
    }

    // Notify client about verification result
    const client = await User.findById(payment.clientId);
    const admin = await User.findById(adminId);

    const notificationData = {
      userId: payment.clientId,
      type: action === "approve" ? "success" : "error",
      title: action === "approve" ? "Installment Verified" : "Installment Rejected",
      message: action === "approve" 
        ? `Your payment for installment ${index + 1} has been verified and approved.`
        : `Your payment for installment ${index + 1} has been rejected. Please re-upload. ${adminNotes ? `Reason: ${adminNotes}` : ""}`,
      priority: "high",
      data: {
        paymentId: payment._id,
        applicationId: payment.applicationId,
        installmentIndex: index,
        status: installment.status,
        adminNotes,
        verifiedBy: admin.fullName || admin.name,
      },
    };

    const savedNotification = new Notification(notificationData);
    await savedNotification.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${payment.clientId}`).emit("payment_verification", savedNotification);
    }

    res.status(200).json({
      success: true,
      message: `Installment ${action}d successfully`,
      data: installment,
    });
  } catch (error) {
    console.error("Verify Installment Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Download payment receipt
 * @route   GET /api/payments/:paymentId/receipt
 * @access  Private (Client/Admin)
 */
export const downloadPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check authorization
    const user = await User.findById(userId);
    if (user.role !== "admin" && payment.clientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this receipt",
      });
    }

    if (!payment.receiptImage) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Redirect to receipt URL (Cloudinary) or send file if stored locally
    res.redirect(payment.receiptImage);
  } catch (error) {
    console.error("Download Payment Receipt Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

// Get all payments for admin revenue statistics
export const getAllPayments = async (req, res) => {
  try {
    console.log("Get All Payments called by admin:", req.user.id);

    // Get all payments with populated data
    const payments = await Payment.find({})
      .populate('applicationId', 'serviceType clientId')
      .populate('clientId', 'fullName name email phone phoneCountryCode nationality address')
      .populate('verifiedBy', 'fullName name')
      .sort({ createdAt: -1 });

    console.log("Found", payments.length, "payments");

    // Calculate revenue statistics
    const stats = {
      totalPayments: payments.length,
      totalRevenue: 0,
      approvedRevenue: 0,
      pendingRevenue: 0,
      submittedRevenue: 0,
      rejectedRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      paymentPlanStats: {
        full: 0,
        installments: 0
      },
      statusStats: {
        pending: 0,
        submitted: 0,
        approved: 0,
        rejected: 0
      },
      serviceTypeStats: {},
      monthlyBreakdown: {},
      yearlyBreakdown: {}
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const paymentMonth = paymentDate.getMonth();
      const paymentYear = paymentDate.getFullYear();

      // Calculate revenue based on payment plan
      let paymentAmount = payment.totalAmount;
      if (payment.paymentPlan === 'installments' && payment.installments && payment.installments.length > 0) {
        // For installments, only count approved installments
        paymentAmount = payment.installments
          .filter(installment => installment.status === 'approved')
          .reduce((sum, installment) => sum + installment.amount, 0);
      } else if (payment.status === 'approved') {
        paymentAmount = payment.totalAmount;
      } else {
        paymentAmount = 0; // Only count approved payments
      }

      // Update stats
      stats.totalRevenue += payment.totalAmount;
      
      if (payment.status === 'approved') {
        stats.approvedRevenue += paymentAmount;
      } else if (payment.status === 'pending') {
        stats.pendingRevenue += payment.totalAmount;
      } else if (payment.status === 'submitted') {
        stats.submittedRevenue += payment.totalAmount;
      } else if (payment.status === 'rejected') {
        stats.rejectedRevenue += payment.totalAmount;
      }

      // Monthly revenue (current month)
      if (paymentMonth === currentMonth && paymentYear === currentYear) {
        stats.monthlyRevenue += paymentAmount;
      }

      // Yearly revenue (current year)
      if (paymentYear === currentYear) {
        stats.yearlyRevenue += paymentAmount;
      }

      // Payment plan stats
      stats.paymentPlanStats[payment.paymentPlan]++;

      // Status stats
      stats.statusStats[payment.status]++;

      // Service type stats
      const serviceType = payment.applicationId?.serviceType || 'Unknown';
      if (!stats.serviceTypeStats[serviceType]) {
        stats.serviceTypeStats[serviceType] = {
          count: 0,
          revenue: 0
        };
      }
      stats.serviceTypeStats[serviceType].count++;
      stats.serviceTypeStats[serviceType].revenue += paymentAmount;

      // Monthly breakdown
      const monthKey = `${paymentYear}-${String(paymentMonth + 1).padStart(2, '0')}`;
      if (!stats.monthlyBreakdown[monthKey]) {
        stats.monthlyBreakdown[monthKey] = 0;
      }
      stats.monthlyBreakdown[monthKey] += paymentAmount;

      // Yearly breakdown
      if (!stats.yearlyBreakdown[paymentYear]) {
        stats.yearlyBreakdown[paymentYear] = 0;
      }
      stats.yearlyBreakdown[paymentYear] += paymentAmount;
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
        stats
      }
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};