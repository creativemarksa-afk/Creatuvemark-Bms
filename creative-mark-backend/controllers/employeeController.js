import mongoose from "mongoose";
import User from "../models/User.js";
import Application from "../models/Application.js";
import ApplicationTimeline from "../models/Timeline.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

// Helper function to calculate progress percentage based on status
const getProgressPercentage = (status) => {
  switch (status) {
    case 'submitted':
      return 10;
    case 'under_review':
      return 25;
    case 'approved':
      return 50;
    case 'in_process':
      return 75;
    case 'completed':
      return 100;
    case 'rejected':
      return 0;
    default:
      return 0;
  }
};

// Get all employees with full details

export const getAllEmployees = async (req, res) => {
  try {
    // Fetch employees and admins (exclude password, tokens, sensitive data)
    const employees = await User.find({ role: { $in: ["employee"] } })
      .select("-passwordHash -refreshToken -__v")
      .sort({ createdAt: -1 }); // Latest first

    if (!employees || employees.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employees found",
        count: 0,
        data: [],
      });
    }

    // Format response
    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      id: emp._id,
      name: emp.fullName,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      phoneCountryCode: emp.phoneCountryCode || "+966",
      position: emp.employeeDetails?.position || "Not assigned",
      department: emp.employeeDetails?.department || "Not assigned",
      nationality: emp.nationality || "N/A",
      role: emp.role,
      status: emp.isActive ? "active" : "inactive",
      isActive: emp.isActive,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      count: formattedEmployees.length,
      data: formattedEmployees,
    });
  } catch (error) {
    console.error("Get All Employees Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee dashboard statistics
 * @route   GET /api/employees/dashboard/stats
 * @access  Private (Employee)
 */
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Get total applications assigned to this employee
    const totalApplications = await Application.countDocuments({
      "assignedEmployees.employeeId": employeeId
    });

    // Get completed applications
    const completedApplications = await Application.countDocuments({
      "assignedEmployees.employeeId": employeeId,
      status: "completed"
    });

    // Get pending applications
    const pendingApplications = await Application.countDocuments({
      "assignedEmployees.employeeId": employeeId,
      status: { $in: ["submitted", "under_review", "in_process"] }
    });

    // Get overdue applications
    const overdueApplications = await Application.countDocuments({
      "assignedEmployees.employeeId": employeeId,
      status: { $in: ["submitted", "under_review", "in_process"] },
      expectedCompletion: { $lt: new Date() }
    });

    // Calculate completion rate
    const completionRate = totalApplications > 0 ? 
      Math.round((completedApplications / totalApplications) * 100) : 0;

    // Get average completion time
    const completedApps = await Application.find({
      "assignedEmployees.employeeId": employeeId,
      status: "completed",
      approvedAt: { $exists: true }
    }).select("createdAt approvedAt");

    let averageCompletionTime = 0;
    if (completedApps.length > 0) {
      const totalDays = completedApps.reduce((sum, app) => {
        const days = (new Date(app.approvedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageCompletionTime = Math.round(totalDays / completedApps.length);
    }

    // Get this week's applications
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekApplications = await Application.countDocuments({
      "assignedEmployees.employeeId": employeeId,
      createdAt: { $gte: startOfWeek }
    });

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalApplications,
        completedApplications,
        pendingApplications,
        overdueApplications,
        completionRate,
        averageCompletionTime,
        thisWeekApplications
      }
    });
  } catch (error) {
    console.error("Get Employee Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee assigned applications/tasks
 * @route   GET /api/employees/applications
 * @access  Private (Employee)
 */
export const getEmployeeApplications = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      "assignedEmployees.employeeId": employeeId
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { serviceType: { $regex: search, $options: 'i' } },
        { 'userId.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate('userId', 'fullName email phone')
      .populate('approvedBy', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Format applications
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      id: app._id,
      type: app.serviceType,
      serviceType: app.serviceType,
      client: {
        name: app.userId?.fullName || 'Unknown Client',
        email: app.userId?.email,
        phone: app.userId?.phone
      },
      status: app.status,
      priority: app.expectedCompletion && new Date(app.expectedCompletion) < new Date() ? 'high' : 'medium',
      progress: getProgressPercentage(app.status),
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      expectedCompletion: app.expectedCompletion,
      assignedAt: app.assignedEmployees?.find(emp => emp.employeeId.toString() === employeeId)?.assignedAt
    }));

    res.status(200).json({
      success: true,
      message: "Employee applications retrieved successfully",
      data: formattedApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Get Employee Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee recent activities
 * @route   GET /api/employees/activities
 * @access  Private (Employee)
 */
export const getEmployeeRecentActivities = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { limit = 10 } = req.query;

    // Get recent timeline entries for applications assigned to this employee
    const activities = await ApplicationTimeline.find({
      applicationId: {
        $in: await Application.find({
          "assignedEmployees.employeeId": employeeId
        }).distinct('_id')
      }
    })
    .populate('applicationId', 'serviceType status')
    .populate('updatedBy', 'fullName')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Format activities
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      type: activity.status,
      description: activity.note || `Status changed to ${activity.status}`,
      application: {
        id: activity.applicationId?._id,
        type: activity.applicationId?.serviceType,
        status: activity.applicationId?.status
      },
      user: {
        name: activity.updatedBy?.fullName || 'System'
      },
      date: activity.createdAt,
      progress: activity.progress
    }));

    res.status(200).json({
      success: true,
      message: "Recent activities retrieved successfully",
      data: formattedActivities
    });
  } catch (error) {
    console.error("Get Employee Recent Activities Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee performance metrics
 * @route   GET /api/employees/performance
 * @access  Private (Employee)
 */
export const getEmployeePerformance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get applications in the period
    const applications = await Application.find({
      "assignedEmployees.employeeId": employeeId,
      createdAt: { $gte: startDate }
    });

    // Calculate metrics
    const totalTasks = applications.length;
    const completedTasks = applications.filter(app => app.status === 'completed').length;
    const pendingTasks = applications.filter(app => 
      ['submitted', 'under_review', 'in_process'].includes(app.status)
    ).length;
    const overdueTasks = applications.filter(app => 
      app.expectedCompletion && 
      new Date(app.expectedCompletion) < now && 
      !['completed', 'rejected'].includes(app.status)
    ).length;

    // Calculate average completion time
    const completedApps = applications.filter(app => 
      app.status === 'completed' && app.approvedAt
    );
    
    let averageCompletionTime = 0;
    if (completedApps.length > 0) {
      const totalDays = completedApps.reduce((sum, app) => {
        const days = (new Date(app.approvedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageCompletionTime = Math.round(totalDays / completedApps.length);
    }

    // Calculate success rate
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get monthly breakdown
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthApps = applications.filter(app => 
        app.createdAt >= monthStart && app.createdAt <= monthEnd
      );
      
      monthlyData.unshift({
        month: months[monthStart.getMonth()],
        tasks: monthApps.length,
        completed: monthApps.filter(app => app.status === 'completed').length,
        successRate: monthApps.length > 0 ? 
          Math.round((monthApps.filter(app => app.status === 'completed').length / monthApps.length) * 100) : 0
      });
    }

    res.status(200).json({
      success: true,
      message: "Performance metrics retrieved successfully",
      data: {
        period,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        averageCompletionTime,
        successRate,
        monthlyData
      }
    });
  } catch (error) {
    console.error("Get Employee Performance Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee deadlines
 * @route   GET /api/employees/deadlines
 * @access  Private (Employee)
 */
export const getEmployeeDeadlines = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { limit = 10 } = req.query;

    // Get applications with upcoming deadlines
    const applications = await Application.find({
      "assignedEmployees.employeeId": employeeId,
      status: { $in: ["submitted", "under_review", "in_process"] },
      expectedCompletion: { $exists: true }
    })
    .populate('userId', 'fullName email')
    .sort({ expectedCompletion: 1 })
    .limit(parseInt(limit));

    // Format deadlines
    const deadlines = applications.map(app => {
      const daysUntilDeadline = Math.ceil(
        (new Date(app.expectedCompletion) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: app._id,
        title: `${app.serviceType} Application`,
        client: app.userId?.fullName || 'Unknown Client',
        deadline: app.expectedCompletion,
        daysUntilDeadline,
        priority: daysUntilDeadline <= 1 ? 'urgent' : 
                 daysUntilDeadline <= 3 ? 'high' : 'medium',
        status: app.status,
        applicationId: app._id
      };
    });

    res.status(200).json({
      success: true,
      message: "Deadlines retrieved successfully",
      data: deadlines
    });
  } catch (error) {
    console.error("Get Employee Deadlines Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee notifications
 * @route   GET /api/employees/notifications
 * @access  Private (Employee)
 */
export const getEmployeeNotifications = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { limit = 20 } = req.query;

    // Get recent applications assigned to this employee
    const applications = await Application.find({
      "assignedEmployees.employeeId": employeeId
    })
    .populate('userId', 'fullName')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

    // Generate notifications based on application status and updates
    const notifications = [];

    applications.forEach(app => {
      // Status change notifications
      if (app.status === 'submitted') {
        notifications.push({
          id: `status-${app._id}`,
          type: 'info',
          title: 'New Task Assigned',
          message: `You have been assigned a new ${app.serviceType} application from ${app.userId?.fullName || 'Unknown Client'}`,
          date: app.assignedEmployees?.find(emp => emp.employeeId.toString() === employeeId)?.assignedAt || app.createdAt,
          read: false,
          priority: 'medium',
          actionUrl: `/employee/my-tasks?id=${app._id}`,
          applicationId: app._id
        });
      }

      // Overdue notifications
      if (app.expectedCompletion && 
          new Date(app.expectedCompletion) < new Date() && 
          !['completed', 'rejected'].includes(app.status)) {
        notifications.push({
          id: `overdue-${app._id}`,
          type: 'urgent',
          title: 'Task Overdue',
          message: `${app.serviceType} application is past its due date`,
          date: app.expectedCompletion,
          read: false,
          priority: 'high',
          actionUrl: `/employee/my-tasks?id=${app._id}`,
          applicationId: app._id
        });
      }

      // Completion notifications
      if (app.status === 'completed') {
        notifications.push({
          id: `completed-${app._id}`,
          type: 'success',
          title: 'Task Completed',
          message: `Successfully completed ${app.serviceType} application`,
          date: app.updatedAt,
          read: false,
          priority: 'low',
          actionUrl: `/employee/my-tasks?id=${app._id}`,
          applicationId: app._id
        });
      }
    });

    // Add system notifications
    notifications.push(
      {
        id: 'system-1',
        type: 'info',
        title: 'System Update',
        message: 'The system has been updated with new features',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        actionUrl: null,
        applicationId: null
      },
      {
        id: 'system-2',
        type: 'urgent',
        title: 'Maintenance Scheduled',
        message: 'System maintenance scheduled for tomorrow at 2 AM',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: null,
        applicationId: null
      }
    );

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error("Get Employee Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get application details for employee
 * @route   GET /api/employees/applications/:id
 * @access  Private (Employee)
 */
export const getEmployeeApplicationDetails = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const applicationId = req.params.id;

    // Find application assigned to this employee
    const application = await Application.findOne({
      _id: applicationId,
      "assignedEmployees.employeeId": employeeId
    })
    .populate('userId', 'fullName email phone nationality')
    .populate('approvedBy', 'fullName')
    .populate('assignedEmployees.employeeId', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or not assigned to you"
      });
    }

    // Get timeline entries
    const timeline = await ApplicationTimeline.find({ applicationId })
      .populate('updatedBy', 'fullName')
      .sort({ createdAt: -1 });

    // Get documents
    const documents = await mongoose.model('ApplicationDocument').find({ applicationId });

    // Get payment information
    const payment = await Payment.findOne({ applicationId });

    // Format response
    const formattedApplication = {
      _id: application._id,
      id: application._id,
      serviceType: application.serviceType,
      externalCompaniesCount: application.externalCompaniesCount,
      externalCompaniesDetails: application.externalCompaniesDetails,
      projectEstimatedValue: application.projectEstimatedValue,
      familyMembers: application.familyMembers,
      needVirtualOffice: application.needVirtualOffice,
      companyArrangesExternalCompanies: application.companyArrangesExternalCompanies,
      status: application.status,
      approvedBy: application.approvedBy,
      approvedAt: application.approvedAt,
      assignedEmployees: application.assignedEmployees,
      client: {
        _id: application.userId._id,
        name: application.userId.fullName,
        email: application.userId.email,
        phone: application.userId.phone,
        nationality: application.userId.nationality
      },
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      timeline: timeline.map(entry => ({
        _id: entry._id,
        status: entry.status,
        note: entry.note,
        progress: entry.progress,
        updatedBy: entry.updatedBy ? {
          name: entry.updatedBy.fullName,
          id: entry.updatedBy._id
        } : null,
        createdAt: entry.createdAt
      })),
      documents: documents.map(doc => ({
        _id: doc._id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        uploadedAt: doc.uploadedAt
      })),
      payment: payment ? {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        paidAt: payment.paidAt
      } : null
    };

    res.status(200).json({
      success: true,
      message: "Application details retrieved successfully",
      data: formattedApplication
    });
  } catch (error) {
    console.error("Get Employee Application Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};



// PUT /api/employees/applications/:id

// PUT /api/employees/applications/:id
export const updateEmployeeApplicationData = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const applicationId = req.params.id;
    const updateData = req.body;
    
    console.log('Update request:', { employeeId, applicationId, updateData });

    // Find application assigned to this employee
    const application = await Application.findOne({
      _id: applicationId,
      "assignedEmployees.employeeId": employeeId
    });

    console.log('Application found:', application ? 'Yes' : 'No');
    if (application) {
      console.log('Application details:', {
        id: application._id,
        status: application.status,
        assignedEmployees: application.assignedEmployees?.length || 0
      });
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or not assigned to you",
      });
    }

    // Fields employees can update (now includes `status`)
    const allowedFields = [
      "externalCompaniesCount",
      "externalCompaniesDetails",
      "projectEstimatedValue",
      "familyMembers",
      "needVirtualOffice",
      "companyArrangesExternalCompanies",
      "status", // ✅ allow employees to update status
    ];

    // Filter update data
    const filteredUpdateData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    // Update the application
    console.log('Updating application with data:', filteredUpdateData);
    
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    )
      .populate("userId", "fullName email phone nationality")
      .populate("approvedBy", "fullName")
      .populate("assignedEmployees.employeeId", "fullName email");

    console.log('Application updated successfully:', {
      id: updatedApplication._id,
      status: updatedApplication.status
    });

    // Create timeline entry for the update
    const calculatedProgress = getProgressPercentage(updatedApplication.status);
    console.log('Creating timeline entry:', { 
      applicationId, 
      status: updatedApplication.status, 
      progress: calculatedProgress 
    });
    
    const timelineEntry = new ApplicationTimeline({
      applicationId,
      status: updatedApplication.status,
      note: updateData.note || "Application data updated by employee",
      progress: calculatedProgress,
      updatedBy: employeeId,
    });

    try {
      await timelineEntry.save();
      console.log('Timeline entry saved successfully');
    } catch (timelineError) {
      console.error('Error saving timeline entry:', timelineError);
      // Continue with the response even if timeline fails
    }

    // Fetch timeline
    let timeline = [];
    try {
      timeline = await ApplicationTimeline.find({ applicationId })
        .populate("updatedBy", "fullName")
        .sort({ createdAt: -1 });
      console.log('Timeline fetched successfully:', timeline.length, 'entries');
    } catch (timelineFetchError) {
      console.error('Error fetching timeline:', timelineFetchError);
      // Continue with empty timeline
    }

    // Fetch documents
    let documents = [];
    try {
      documents = await mongoose
        .model("ApplicationDocument")
        .find({ applicationId });
      console.log('Documents fetched successfully:', documents.length, 'documents');
    } catch (documentsError) {
      console.error('Error fetching documents:', documentsError);
      // Continue with empty documents
    }

    // Fetch payment
    let payment = null;
    try {
      payment = await Payment.findOne({ applicationId });
      console.log('Payment fetched successfully:', payment ? 'found' : 'not found');
    } catch (paymentError) {
      console.error('Error fetching payment:', paymentError);
      // Continue with null payment
    }

    // Format response
    const formattedApplication = {
      _id: updatedApplication._id,
      id: updatedApplication._id,
      serviceType: updatedApplication.serviceType,
      externalCompaniesCount: updatedApplication.externalCompaniesCount,
      externalCompaniesDetails: updatedApplication.externalCompaniesDetails,
      projectEstimatedValue: updatedApplication.projectEstimatedValue,
      familyMembers: updatedApplication.familyMembers,
      needVirtualOffice: updatedApplication.needVirtualOffice,
      companyArrangesExternalCompanies:
        updatedApplication.companyArrangesExternalCompanies,
      status: updatedApplication.status,
      approvedBy: updatedApplication.approvedBy,
      approvedAt: updatedApplication.approvedAt,
      assignedEmployees: updatedApplication.assignedEmployees,
      client: {
        _id: updatedApplication.userId._id,
        name: updatedApplication.userId.fullName,
        email: updatedApplication.userId.email,
        phone: updatedApplication.userId.phone,
        nationality: updatedApplication.userId.nationality,
      },
      createdAt: updatedApplication.createdAt,
      updatedAt: updatedApplication.updatedAt,
      timeline: timeline.map((entry) => ({
        _id: entry._id,
        status: entry.status,
        note: entry.note,
        progress: entry.progress,
        updatedBy: entry.updatedBy
          ? {
              name: entry.updatedBy.fullName,
              id: entry.updatedBy._id,
            }
          : null,
        createdAt: entry.createdAt,
      })),
      documents: documents.map((doc) => ({
        _id: doc._id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        uploadedAt: doc.uploadedAt,
      })),
      payment: payment
        ? {
            _id: payment._id,
            amount: payment.amount,
            status: payment.status,
            method: payment.method,
            paidAt: payment.paidAt,
          }
        : null,
    };

    // Emit notifications if status was updated
    if (updateData.status) {
      const io = req.app.get('io');
      if (io) {
        const employee = await User.findById(employeeId).select('fullName');
        const statusMessage = updateData.note 
          ? `Your ${updatedApplication.serviceType} application status has been updated to ${updateData.status.replace('_', ' ')}. Note: ${updateData.note}`
          : `Your ${updatedApplication.serviceType} application status has been updated to ${updateData.status.replace('_', ' ')}`;

        // Notify client
        const clientNotification = {
          applicationId: updatedApplication._id,
          status: updateData.status,
          message: statusMessage,
          updatedBy: employee?.fullName || 'Employee',
          note: updateData.note,
          timestamp: new Date()
        };
        
        io.to(`user_${updatedApplication.userId._id}`).emit('status_update_notification', clientNotification);

        // Notify other assigned employees
        updatedApplication.assignedEmployees.forEach(assignment => {
          if (assignment.employeeId._id.toString() !== employeeId) {
            const employeeMessage = updateData.note
              ? `Application ${updatedApplication._id} status updated to ${updateData.status.replace('_', ' ')} by ${employee?.fullName || 'Employee'}. Note: ${updateData.note}`
              : `Application ${updatedApplication._id} status updated to ${updateData.status.replace('_', ' ')} by ${employee?.fullName || 'Employee'}`;
              
            io.to(`user_${assignment.employeeId._id}`).emit('status_update_notification', {
              applicationId: updatedApplication._id,
              status: updateData.status,
              message: employeeMessage,
              updatedBy: employee?.fullName || 'Employee',
              note: updateData.note,
              timestamp: new Date()
            });
          }
        });

        // Notify admins
        const admins = await User.find({ role: 'admin' });
        admins.forEach(admin => {
          const adminMessage = updateData.note
            ? `Application ${updatedApplication._id} status updated to ${updateData.status.replace('_', ' ')} by ${employee?.fullName || 'Employee'}. Note: ${updateData.note}`
            : `Application ${updatedApplication._id} status updated to ${updateData.status.replace('_', ' ')} by ${employee?.fullName || 'Employee'}`;
            
          io.to(`user_${admin._id}`).emit('status_update_notification', {
            applicationId: updatedApplication._id,
            status: updateData.status,
            message: adminMessage,
            updatedBy: employee?.fullName || 'Employee',
            note: updateData.note,
            timestamp: new Date()
          });
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Application data updated successfully",
      data: formattedApplication,
    });
  } catch (error) {
    console.error("Update Employee Application Data Error:", error);
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

// Delete employee (Admin only)
export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { deletedBy } = req.body;

    // Validate required fields
    if (!deletedBy) {
      return res.status(400).json({
        success: false,
        message: "Deleted by user ID is required"
      });
    }

    // Validate employee ID format
    if (!employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format"
      });
    }

    // Find employee to ensure it exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Verify the user deleting has permission (admin only)
    const user = await User.findById(deletedBy);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only admins can delete employees"
      });
    }

    // Check if employee is assigned to any applications
    const assignedApplications = await Application.find({
      'assignedEmployees.employeeId': employeeId
    });

    if (assignedApplications.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee. They are currently assigned to ${assignedApplications.length} application(s). Please reassign these applications first.`,
        assignedApplications: assignedApplications.length
      });
    }

    // Delete the employee
    await User.findByIdAndDelete(employeeId);

    // Emit notification to other admins about deletion
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('employee_deleted_notification', {
        employeeId: employeeId,
        employeeName: employee.fullName,
        deletedBy: user.fullName,
        deletedAt: new Date(),
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
      data: {
        employeeId: employeeId,
        employeeName: employee.fullName,
        deletedBy: user.fullName,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

