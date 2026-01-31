import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitToUser } from "../utils/socketHandler.js";

// Create ticket (Client)
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, tags } = req.body;

    const ticket = await Ticket.create({
      userId: req.user.id,
      title,
      description,
      priority,
      category,
      tags,
    });

    // Get client info for notification
    const client = await User.findById(req.user.id);
    const clientName = client?.fullName || client?.email || 'Unknown Client';

    // Get all admins to notify them
    const admins = await User.find({ role: 'admin' });
    const io = req.app.get('io');

    // Send notifications to all admins
    for (const admin of admins) {
      try {
        const notificationData = {
          userId: admin._id,
          type: 'info',
          title: 'New Support Ticket Received',
          message: `A new ${priority} priority ticket "${title}" has been submitted by ${clientName}`,
          priority: priority === 'urgent' ? 'high' : 'medium',
          data: {
            ticketId: ticket._id,
            title: title,
            priority: priority,
            category: category,
            submittedBy: clientName,
            submittedAt: new Date()
          }
        };

        // Save notification in DB
        const savedNotification = new Notification(notificationData);
        await savedNotification.save();
        console.log('✅ Admin ticket notification saved:', savedNotification._id, 'for admin:', admin._id);

        // Emit real-time notification
        io.to(`user_${admin._id}`).emit('new_ticket_notification', savedNotification);
        io.to(`user_${admin._id}`).emit('notification', savedNotification);
        console.log('📤 Admin ticket notification emitted to user:', admin._id);
      } catch (notificationError) {
        console.error('❌ Error sending admin ticket notification:', notificationError);
      }
    }

    console.log('✅ Ticket notifications stored & emitted successfully to admins.');

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error('❌ Error creating ticket:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all tickets (Admin)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "name email")
      .populate("assignedTo", "name email");
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get my tickets (Client/Employee)
export const getMyTickets = async (req, res) => {
  try {
    const query =
      req.user.role === "employee"
        ? { assignedTo: req.user.id }
        : { userId: req.user.id };

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name email");
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign ticket to employee (Admin)
export const assignTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });

    const { employeeId } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: employeeId, status: "in_progress" },
      { new: true }
    ).populate('userId', 'fullName email').populate('assignedTo', 'fullName email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Get admin info
    const admin = await User.findById(req.user.id);
    const adminName = admin?.fullName || admin?.email || 'Admin';

    // Get employee info
    const employee = await User.findById(employeeId);
    const employeeName = employee?.fullName || employee?.email || 'Employee';

    // Get client info
    const client = await User.findById(ticket.userId);
    const clientName = client?.fullName || client?.email || 'Client';

    const io = req.app.get('io');

    // Create notification for employee
    try {
      const employeeNotification = new Notification({
        userId: employeeId,
        type: 'info',
        title: 'New Ticket Assignment',
        message: `You have been assigned to handle ticket "${ticket.title}" by ${adminName}`,
        priority: ticket.priority === 'urgent' ? 'high' : 'medium',
        data: {
          ticketId: ticket._id,
          title: ticket.title,
          priority: ticket.priority,
          category: ticket.category,
          assignedBy: adminName,
          assignedAt: new Date()
        }
      });

      await employeeNotification.save();
      console.log('✅ Employee ticket notification saved:', employeeNotification._id);

      // Emit real-time notification to employee
      io.to(`user_${employeeId}`).emit('ticket_assignment_notification', employeeNotification);
      io.to(`user_${employeeId}`).emit('notification', employeeNotification);
      console.log('📤 Employee ticket notification emitted to user:', employeeId);
    } catch (notificationError) {
      console.error('❌ Error sending employee ticket notification:', notificationError);
    }

    // Create notification for client
    try {
      const clientNotification = new Notification({
        userId: ticket.userId,
        type: 'success',
        title: 'Ticket Assigned',
        message: `Your ticket "${ticket.title}" has been assigned to our support team and is now being processed`,
        priority: 'medium',
        data: {
          ticketId: ticket._id,
          title: ticket.title,
          status: 'in_progress',
          assignedBy: adminName,
          assignedTo: employeeName
        }
      });

      await clientNotification.save();
      console.log('✅ Client ticket notification saved:', clientNotification._id);

      // Emit real-time notification to client
      io.to(`user_${ticket.userId}`).emit('ticket_assignment_notification', clientNotification);
      io.to(`user_${ticket.userId}`).emit('notification', clientNotification);
      console.log('📤 Client ticket notification emitted to user:', ticket.userId);
    } catch (notificationError) {
      console.error('❌ Error sending client ticket notification:', notificationError);
    }

    console.log('✅ Ticket assignment notifications sent successfully.');

    res.json({ success: true, ticket });
  } catch (err) {
    console.error('❌ Error assigning ticket:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update ticket status (Employee/Admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["open", "in_progress", "resolved", "closed"];

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email').populate('assignedTo', 'fullName email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Get the user who updated the status
    const updatedBy = await User.findById(req.user.id);
    const updatedByName = updatedBy?.fullName || updatedBy?.email || 'Support Team';

    // Get client info
    const client = await User.findById(ticket.userId);
    const clientName = client?.fullName || client?.email || 'Client';

    const io = req.app.get('io');

    // Create notification for client
    try {
      let statusMessage = '';
      let notificationType = 'info';
      
      switch (status) {
        case 'in_progress':
          statusMessage = 'is now being processed';
          notificationType = 'info';
          break;
        case 'resolved':
          statusMessage = 'has been resolved';
          notificationType = 'success';
          break;
        case 'closed':
          statusMessage = 'has been closed';
          notificationType = 'info';
          break;
        default:
          statusMessage = `status has been updated to ${status}`;
          notificationType = 'info';
      }

      const clientNotification = new Notification({
        userId: ticket.userId,
        type: notificationType,
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.title}" ${statusMessage} by ${updatedByName}`,
        priority: 'medium',
        data: {
          ticketId: ticket._id,
          title: ticket.title,
          status: status,
          updatedBy: updatedByName,
          updatedAt: new Date()
        }
      });

      await clientNotification.save();
      console.log('✅ Client ticket status notification saved:', clientNotification._id);

      // Emit real-time notification to client
      io.to(`user_${ticket.userId}`).emit('ticket_status_notification', clientNotification);
      io.to(`user_${ticket.userId}`).emit('notification', clientNotification);
      console.log('📤 Client ticket status notification emitted to user:', ticket.userId);
    } catch (notificationError) {
      console.error('❌ Error sending client ticket status notification:', notificationError);
    }

    // If employee updated status, notify admin
    if (req.user.role === 'employee' && ticket.assignedTo) {
      try {
        const admins = await User.find({ role: 'admin' });
        
        for (const admin of admins) {
          const adminNotification = new Notification({
            userId: admin._id,
            type: 'info',
            title: 'Ticket Status Updated',
            message: `Ticket "${ticket.title}" status updated to ${status} by ${updatedByName}`,
            priority: 'low',
            data: {
              ticketId: ticket._id,
              title: ticket.title,
              status: status,
              updatedBy: updatedByName,
              clientName: clientName,
              updatedAt: new Date()
            }
          });

          await adminNotification.save();
          console.log('✅ Admin ticket status notification saved:', adminNotification._id);

          // Emit real-time notification to admin
          io.to(`user_${admin._id}`).emit('ticket_status_notification', adminNotification);
          io.to(`user_${admin._id}`).emit('notification', adminNotification);
          console.log('📤 Admin ticket status notification emitted to user:', admin._id);
        }
      } catch (notificationError) {
        console.error('❌ Error sending admin ticket status notification:', notificationError);
      }
    }

    console.log('✅ Ticket status update notifications sent successfully.');

    res.json({ success: true, ticket });
  } catch (err) {
    console.error('❌ Error updating ticket status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete ticket (Admin only)
export const deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });

    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
