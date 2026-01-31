import Application from "../models/Application.js";
import User from "../models/User.js";
import ApplicationTimeline from "../models/Timeline.js";
import Payment from "../models/Payment.js";

/**
 * @desc    Get comprehensive dashboard analytics
 * @route   GET /api/reports/dashboard
 * @access  Private (Admin/Staff)
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total counts
    const [
      totalApplications,
      totalClients,
      totalEmployees
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments({ role: "client" }),
      User.countDocuments({ role: { $in: ["employee", "admin"] } })
    ]);

    // Get application status breakdown
    const statusBreakdown = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly application trends (last 12 months)
    const monthlyTrends = await Application.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get service type breakdown
    const serviceTypeBreakdown = await Application.aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent applications (last 10)
    const recentApplications = await Application.find()
      .populate("userId", "fullName email phone")
      .populate("assignedEmployees.employeeId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("serviceType status createdAt assignedEmployees");

    // Get employee workload
    const employeeWorkload = await Application.aggregate([
      { $unwind: "$assignedEmployees" },
      {
        $group: {
          _id: "$assignedEmployees.employeeId",
          assignedCount: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          employeeId: "$_id",
          employeeName: "$employee.fullName",
          employeeEmail: "$employee.email",
          assignedCount: 1,
          completedCount: 1,
          completionRate: {
            $multiply: [
              { $divide: ["$completedCount", "$assignedCount"] },
              100
            ]
          }
        }
      },
      { $sort: { assignedCount: -1 } }
    ]);

    // Get processing time analytics
    const processingTimeAnalytics = await Application.aggregate([
      {
        $match: {
          status: { $in: ["completed", "approved"] },
          createdAt: { $exists: true },
          updatedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingDays: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          },
          serviceType: 1,
          status: 1
        }
      },
      {
        $group: {
          _id: "$serviceType",
          avgProcessingDays: { $avg: "$processingDays" },
          minProcessingDays: { $min: "$processingDays" },
          maxProcessingDays: { $max: "$processingDays" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment analytics
    const paymentAnalytics = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Get monthly revenue trends (last 12 months)
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          },
          status: { $in: ["approved", "submitted"] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalAmount" },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get client activity (most active clients)
    const clientActivity = await Application.aggregate([
      {
        $group: {
          _id: "$userId",
          applicationCount: { $sum: 1 },
          lastApplicationDate: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $project: {
          clientId: "$_id",
          clientName: "$client.fullName",
          clientEmail: "$client.email",
          applicationCount: 1,
          lastApplicationDate: 1
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: {
        overview: {
          totalApplications,
          totalClients,
          totalEmployees
        },
        statusBreakdown: statusBreakdown.map(item => ({
          status: item._id,
          count: item.count
        })),
        monthlyTrends: monthlyTrends.map(item => ({
          month: item._id.month,
          year: item._id.year,
          count: item.count
        })),
        serviceTypeBreakdown: serviceTypeBreakdown.map(item => ({
          serviceType: item._id,
          count: item.count
        })),
        recentApplications: recentApplications.map(app => ({
          id: app._id,
          serviceType: app.serviceType,
          status: app.status,
          clientName: app.userId?.fullName,
          clientEmail: app.userId?.email,
          assignedEmployees: app.assignedEmployees?.length || 0,
          createdAt: app.createdAt
        })),
        employeeWorkload,
        processingTimeAnalytics,
        paymentAnalytics: paymentAnalytics.map(item => ({
          status: item._id,
          count: item.count,
          totalAmount: item.totalAmount
        })),
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: item._id.month,
          year: item._id.year,
          totalRevenue: item.totalRevenue,
          paymentCount: item.paymentCount
        })),
        clientActivity
      }
    });
  } catch (error) {
    console.error("Get Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get detailed application reports
 * @route   GET /api/reports/applications
 * @access  Private (Admin/Staff)
 */
export const getApplicationReports = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      serviceType, 
      assignedEmployee,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    
    if (assignedEmployee) {
      filter["assignedEmployees.employeeId"] = assignedEmployee;
    }

    // Get applications with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(filter)
      .populate("userId", "fullName email phone nationality")
      .populate("assignedEmployees.employeeId", "fullName email role")
      .populate("approvedBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Application.countDocuments(filter);

    // Format response
    const formattedApplications = applications.map(app => ({
      id: app._id,
      applicationId: app._id,
      client: {
        id: app.userId._id,
        name: app.userId.fullName,
        email: app.userId.email,
        phone: app.userId.phone,
        nationality: app.userId.nationality
      },
      serviceType: app.serviceType,
      status: app.status,
      assignedEmployees: app.assignedEmployees.map(assignment => ({
        id: assignment.employeeId._id,
        name: assignment.employeeId.fullName,
        email: assignment.employeeId.email,
        role: assignment.employeeId.role,
        task: assignment.task,
        assignedAt: assignment.assignedAt
      })),
      approvedBy: app.approvedBy ? {
        id: app.approvedBy._id,
        name: app.approvedBy.fullName,
        email: app.approvedBy.email,
        role: app.approvedBy.role
      } : null,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      processingDays: app.updatedAt ? 
        Math.ceil((app.updatedAt - app.createdAt) / (1000 * 60 * 60 * 24)) : 0
    }));

    res.status(200).json({
      success: true,
      message: "Application reports retrieved successfully",
      data: {
        applications: formattedApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNextPage: skip + parseInt(limit) < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get Application Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get employee performance reports
 * @route   GET /api/reports/employees
 * @access  Private (Admin/Staff)
 */
export const getEmployeeReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get employee performance data
    const employeePerformance = await Application.aggregate([
      { $match: dateFilter },
      { $unwind: "$assignedEmployees" },
      {
        $group: {
          _id: "$assignedEmployees.employeeId",
          assignedApplications: { $sum: 1 },
          completedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          inProgressApplications: {
            $sum: { 
              $cond: [
                { $in: ["$status", ["under_review", "in_process"]] }, 
                1, 
                0
              ] 
            }
          },
          avgProcessingDays: {
            $avg: {
              $cond: [
                { $in: ["$status", ["completed", "approved"]] },
                {
                  $divide: [
                    { $subtract: ["$updatedAt", "$createdAt"] },
                    1000 * 60 * 60 * 24
                  ]
                },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          employeeId: "$_id",
          employeeName: "$employee.fullName",
          employeeEmail: "$employee.email",
          employeeRole: "$employee.role",
          assignedApplications: 1,
          completedApplications: 1,
          approvedApplications: 1,
          inProgressApplications: 1,
          completionRate: {
            $multiply: [
              { $divide: ["$completedApplications", "$assignedApplications"] },
              100
            ]
          },
          approvalRate: {
            $multiply: [
              { $divide: ["$approvedApplications", "$assignedApplications"] },
              100
            ]
          },
          avgProcessingDays: { $round: ["$avgProcessingDays", 1] }
        }
      },
      { $sort: { assignedApplications: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: "Employee reports retrieved successfully",
      data: {
        employeePerformance
      }
    });
  } catch (error) {
    console.error("Get Employee Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

/**
 * @desc    Get financial reports
 * @route   GET /api/reports/financial
 * @access  Private (Admin/Staff)
 */
export const getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get payment analytics
    const paymentAnalytics = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    // Get monthly revenue trends
    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: "completed"
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$amount" },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get service type revenue
    const serviceRevenue = await Payment.aggregate([
      { $match: { ...dateFilter, status: "completed" } },
      {
        $lookup: {
          from: "applications",
          localField: "applicationId",
          foreignField: "_id",
          as: "application"
        }
      },
      { $unwind: "$application" },
      {
        $group: {
          _id: "$application.serviceType",
          totalRevenue: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: "Financial reports retrieved successfully",
      data: {
        paymentAnalytics: paymentAnalytics.map(item => ({
          status: item._id,
          count: item.count,
          totalAmount: item.totalAmount,
          avgAmount: item.avgAmount
        })),
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: item._id.month,
          year: item._id.year,
          totalRevenue: item.totalRevenue,
          paymentCount: item.paymentCount
        })),
        serviceRevenue: serviceRevenue.map(item => ({
          serviceType: item._id,
          totalRevenue: item.totalRevenue,
          paymentCount: item.paymentCount,
          avgAmount: item.avgAmount
        }))
      }
    });
  } catch (error) {
    console.error("Get Financial Reports Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};
