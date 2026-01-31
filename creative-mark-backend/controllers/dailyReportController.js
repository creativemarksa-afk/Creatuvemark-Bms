import DailyReport from "../models/DailyReport.js";

// Create a new daily report (employee)
export const createDailyReport = async (req, res) => {
  try {
    const employeeId = req.user?.id || req.user?._id;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { date, startTime, endTime, tasksCompleted, issues, nextPlans, attachments } = req.body;

    // Basic validations
    if (!date || !startTime || !endTime || !tasksCompleted) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Build Date objects for time calculations (assumes date as YYYY-MM-DD and time as HH:mm)
    // Use local timezone instead of UTC to avoid timezone conversion issues
    const toDateTime = (d, t) => {
      // Create date in local timezone
      const dateStr = `${d}T${t}:00`;
      return new Date(dateStr);
    };

    // Enforce: date must be today
    const todayStr = new Date().toISOString().slice(0, 10);
    if (date !== todayStr) {
      return res.status(400).json({ success: false, message: "Reports can only be submitted for today" });
    }
    const startAt = toDateTime(date, startTime);
    const endAt = toDateTime(date, endTime);

    if (!(startAt instanceof Date) || isNaN(startAt.getTime()) || !(endAt instanceof Date) || isNaN(endAt.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date/time format" });
    }

    if (endAt <= startAt) {
      return res.status(400).json({ success: false, message: "End time must be after start time" });
    }

    // Enforce: no overlapping time ranges for the same day
    const overlapping = await DailyReport.findOne({
      employee: employeeId,
      date,
      $or: [
        { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }] },
      ],
    });
    if (overlapping) {
      return res.status(400).json({ success: false, message: "Time range overlaps with an existing report" });
    }

    // No time restrictions - users can submit reports anytime

    const report = await DailyReport.create({
      employee: employeeId,
      date,
      startTime,
      endTime,
      tasksCompleted,
      issues,
      nextPlans,
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    res.status(201).json({ success: true, message: "Report created", data: report });
  } catch (error) {
    console.error("Create Daily Report Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get current employee reports (with pagination)
export const getMyDailyReports = async (req, res) => {
  try {
    const employeeId = req.user?.id || req.user?._id;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      DailyReport.find({ employee: employeeId })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DailyReport.countDocuments({ employee: employeeId }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCount: total,
          hasNextPage: skip + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error("Get My Daily Reports Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin/staff: list reports by employee or date range
export const listDailyReports = async (req, res) => {
  try {
    const { employee, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      DailyReport.find(filter)
        .populate("employee", "fullName email role")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DailyReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCount: total,
          hasNextPage: skip + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error("List Daily Reports Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


