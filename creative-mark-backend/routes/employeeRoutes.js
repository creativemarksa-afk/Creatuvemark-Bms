import express from "express";
import { 
  getAllEmployees,
  getEmployeeDashboardStats,
  getEmployeeApplications,
  getEmployeeRecentActivities,
  getEmployeePerformance,
  getEmployeeDeadlines,
  getEmployeeNotifications,
  getEmployeeApplicationDetails,
  updateEmployeeApplicationData,
  deleteEmployee
} from "../controllers/employeeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all employees (Admin/Staff only)
router.get("/", authMiddleware, getAllEmployees);

// Delete employee (Admin only)
router.delete("/:employeeId", authMiddleware, deleteEmployee);

// Employee Dashboard Routes
router.get("/dashboard/stats", authMiddleware, getEmployeeDashboardStats);
router.get("/applications", authMiddleware, getEmployeeApplications);
router.get("/activities", authMiddleware, getEmployeeRecentActivities);
router.get("/performance", authMiddleware, getEmployeePerformance);
router.get("/deadlines", authMiddleware, getEmployeeDeadlines);
router.get("/notifications", authMiddleware, getEmployeeNotifications);

// Employee Application Management Routes
router.get("/applications/:id", authMiddleware, getEmployeeApplicationDetails);
router.put("/applications/:id", authMiddleware, updateEmployeeApplicationData);

export default router;