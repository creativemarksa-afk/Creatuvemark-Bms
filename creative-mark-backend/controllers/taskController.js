import Task from "../models/Task.js";
import User from "../models/User.js";
import Application from "../models/Application.js";

/**
 * Create a new task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createTask = async (req, res) => {
  try {
    console.log('Create task request body:', req.body);
    console.log('User from auth:', req.user);
    
    const {
      title,
      description,
      priority = "medium",
      assignedTo,
      applicationId,
      dueDate,
      estimatedHours,
      tags = [],
    } = req.body;

    // Validate required fields
    if (!title || !description || !assignedTo || !dueDate) {
      console.log('Validation failed - missing required fields:', {
        title: !!title,
        description: !!description,
        assignedTo: !!assignedTo,
        dueDate: !!dueDate
      });
      return res.status(400).json({
        success: false,
        message: "Title, description, assignedTo, and dueDate are required",
        details: {
          title: !!title,
          description: !!description,
          assignedTo: !!assignedTo,
          dueDate: !!dueDate
        }
      });
    }

    // Validate assignedTo user exists and is an employee
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    if (!["employee", "admin"].includes(assignedUser.role)) {
      return res.status(400).json({
        success: false,
        message: "Can only assign tasks to employees or admins",
      });
    }

    // Validate applicationId if provided
    if (applicationId) {
      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(400).json({
          success: false,
          message: "Application not found",
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo,
      assignedBy: req.user.id,
      applicationId,
      dueDate: new Date(dueDate),
      estimatedHours,
      tags,
    });

    // Populate the task with user details
    await task.populate([
      { path: "assignedTo", select: "name fullName email role" },
      { path: "assignedBy", select: "name fullName email role" },
      { path: "applicationId", select: "serviceType status" },
    ]);

    // Send notification to assigned user
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${assignedTo}`).emit("task_assignment_notification", {
        taskId: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedBy: req.user.fullName || req.user.name || "Admin",
        applicationId: task.applicationId,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

/**
 * Get all tasks with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      assignedBy,
      applicationId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedBy) filter.assignedBy = assignedBy;
    if (applicationId) filter.applicationId = applicationId;

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get tasks with population
    const tasks = await Task.find(filter)
      .populate([
        { path: "assignedTo", select: "name fullName email role" },
        { path: "assignedBy", select: "name fullName email role" },
        { path: "applicationId", select: "serviceType status" },
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    });
  }
};

/**
 * Get task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate([
      { path: "assignedTo", select: "name fullName email role phone" },
      { path: "assignedBy", select: "name fullName email role" },
      { path: "applicationId", select: "serviceType status userId" },
      { path: "notes.addedBy", select: "name fullName" },
      { path: "attachments.uploadedBy", select: "name fullName" },
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
      error: error.message,
    });
  }
};

/**
 * Update task status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, note, actualHours } = req.body;

    // Validate status
    const validStatuses = ["open", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is authorized to update this task
    const isAssignedTo = task.assignedTo.toString() === req.user.id;
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAssignedTo && !isAssignedBy && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Update task
    const updateData = { status };
    
    if (status === "completed") {
      updateData.completedAt = new Date();
    } else if (status !== "completed" && task.status === "completed") {
      updateData.completedAt = null;
    }

    if (actualHours !== undefined) {
      updateData.actualHours = actualHours;
    }

    // Add note if provided
    if (note) {
      updateData.$push = {
        notes: {
          note,
          addedBy: req.user.id,
          addedAt: new Date(),
        },
      };
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "assignedTo", select: "name fullName email role" },
      { path: "assignedBy", select: "name fullName email role" },
      { path: "applicationId", select: "serviceType status" },
    ]);

    // Send notification to task creator and admin
    const io = req.app.get("io");
    if (io) {
      const notificationData = {
        taskId: task._id,
        title: task.title,
        status: status,
        updatedBy: req.user.fullName || req.user.name || "User",
        note: note || "",
        timestamp: new Date(),
      };

      // Notify task creator
      io.to(`user_${task.assignedBy}`).emit("task_status_update_notification", notificationData);
      
      // Notify admins
      const admins = await User.find({ role: "admin" }).select("_id");
      admins.forEach(admin => {
        if (admin._id.toString() !== req.user.id) {
          io.to(`user_${admin._id}`).emit("task_status_update_notification", notificationData);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

/**
 * Update task details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is authorized to update this task
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAssignedBy && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.assignedBy;
    delete updateData.createdAt;

    // Handle date conversion for dueDate
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "assignedTo", select: "name fullName email role" },
      { path: "assignedBy", select: "name fullName email role" },
      { path: "applicationId", select: "serviceType status" },
    ]);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

/**
 * Delete task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only task creator or admin can delete
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAssignedBy && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

/**
 * Get tasks assigned to current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMyTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      sortBy = "dueDate",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = { assignedTo: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get tasks with population
    const tasks = await Task.find(filter)
      .populate([
        { path: "assignedTo", select: "name fullName email role" },
        { path: "assignedBy", select: "name fullName email role" },
        { path: "applicationId", select: "serviceType status" },
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "My tasks retrieved successfully",
      data: tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve my tasks",
      error: error.message,
    });
  }
};

/**
 * Get task statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get overdue tasks
    const overdueCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    // Get tasks due today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dueTodayCount = await Task.countDocuments({
      dueDate: { $lte: today },
      dueDate: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
      status: { $ne: "completed" },
    });

    res.status(200).json({
      success: true,
      message: "Task statistics retrieved successfully",
      data: {
        statusStats: stats,
        priorityStats: priorityStats,
        overdueCount,
        dueTodayCount,
      },
    });
  } catch (error) {
    console.error("Get Task Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task statistics",
      error: error.message,
    });
  }
};
