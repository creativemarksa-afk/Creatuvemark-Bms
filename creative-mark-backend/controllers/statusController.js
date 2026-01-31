import Application from "../models/Application.js";
import ApplicationTimeline from "../models/Timeline.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * @desc    Update application status (for employees)
 * @route   PATCH /api/status/:applicationId/update
 * @access  Private (Employee)
 * @param   {string} req.params.applicationId - Application ID
 * @param   {string} req.body.status - New status
 * @param   {string} req.body.note - Optional note
 * @param   {string} req.body.updatedBy - User ID who is updating
 * @returns {Object} Updated application status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, note } = req.body;
    const updatedBy = req.user.id; // Get user ID from auth middleware

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Validate status
    const validStatuses = ["submitted", "under_review", "approved", "in_process", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
      });
    }

    // Find application
    const application = await Application.findById(applicationId)
      .populate("userId", "fullName email")
      .populate("assignedEmployees.employeeId", "fullName email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify user exists and has permission
    const user = await User.findById(updatedBy);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has permission to update this application
    const isAssignedEmployee = application.assignedEmployees.some(
      assignment => assignment.employeeId._id.toString() === updatedBy
    );
    const isApplicationOwner = application.userId._id.toString() === updatedBy;
    const isAdmin = user.role === 'admin';

    if (!isAssignedEmployee && !isApplicationOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update applications assigned to you"
      });
    }

    // Update application status
    const previousStatus = application.status;
    application.status = status;
    await application.save();

    // Create timeline entry
    await ApplicationTimeline.create({
      applicationId: application._id,
      status: status,
      note: note || `Status updated from ${previousStatus} to ${status}`,
      updatedBy: updatedBy,
      progress: getProgressForStatus(status)
    });

    // Emit notifications and save to database
    const io = req.app.get('io');
    if (io) {
      // Create notification messages with note
      const statusMessage = note 
        ? `Your ${application.serviceType} application status has been updated to ${status.replace('_', ' ')}. Note: ${note}`
        : `Your ${application.serviceType} application status has been updated to ${status.replace('_', ' ')}`;
      
      const employeeMessage = note
        ? `Application ${application._id} status updated to ${status.replace('_', ' ')} by ${user.fullName}. Note: ${note}`
        : `Application ${application._id} status updated to ${status.replace('_', ' ')} by ${user.fullName}`;

      const adminMessage = note
        ? `Application ${application._id} status updated to ${status.replace('_', ' ')} by ${user.fullName}. Note: ${note}`
        : `Application ${application._id} status updated to ${status.replace('_', ' ')} by ${user.fullName}`;

      // Notify client and save to database
      if (!isApplicationOwner) {
        // Save notification to database
        const clientNotification = new Notification({
          userId: application.userId._id,
          type: 'info',
          title: 'Application Status Updated',
          message: statusMessage,
          priority: 'medium',
          data: {
            applicationId: application._id,
            status: status,
            updatedBy: user.fullName,
            note: note
          }
        });
        await clientNotification.save();
        
        io.to(`user_${application.userId._id}`).emit('status_update_notification', clientNotification);
        io.to(`user_${application.userId._id}`).emit('notification', clientNotification);
      }

      // Notify other assigned employees and save to database
      for (const assignment of application.assignedEmployees) {
        if (assignment.employeeId._id.toString() !== updatedBy) {
          // Save notification to database
          const employeeNotification = new Notification({
            userId: assignment.employeeId._id,
            type: 'info',
            title: 'Application Status Updated',
            message: employeeMessage,
            priority: 'medium',
            data: {
              applicationId: application._id,
              status: status,
              updatedBy: user.fullName,
              note: note
            }
          });
          await employeeNotification.save();
          
          io.to(`user_${assignment.employeeId._id}`).emit('status_update_notification', employeeNotification);
          io.to(`user_${assignment.employeeId._id}`).emit('notification', employeeNotification);
        }
      }

      // Notify admins and save to database
      if (user.role !== 'admin') {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          // Save notification to database
          const adminNotification = new Notification({
            userId: admin._id,
            type: 'info',
            title: 'Application Status Updated',
            message: adminMessage,
            priority: 'medium',
            data: {
              applicationId: application._id,
              status: status,
              updatedBy: user.fullName,
              note: note
            }
          });
          await adminNotification.save();
          
          io.to(`user_${admin._id}`).emit('status_update_notification', adminNotification);
          io.to(`user_${admin._id}`).emit('notification', adminNotification);
        }
      }
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      data: {
        applicationId: application._id,
        previousStatus,
        newStatus: status,
        updatedBy: user.fullName,
        updatedAt: new Date(),
        note: note || `Status updated from ${previousStatus} to ${status}`
      }
    });

  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Helper function to get progress percentage for status
 */
const getProgressForStatus = (status) => {
  switch (status) {
    case 'submitted': return 10;
    case 'under_review': return 25;
    case 'approved': return 50;
    case 'in_process': return 75;
    case 'completed': return 100;
    case 'rejected': return 0;
    default: return 0;
  }
};
