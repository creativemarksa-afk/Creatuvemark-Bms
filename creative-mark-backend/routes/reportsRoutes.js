import express from "express";
import { 
  getDashboardAnalytics, 
  getApplicationReports, 
  getEmployeeReports, 
  getFinancialReports 
} from "../controllers/reportsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get comprehensive dashboard analytics
router.get("/dashboard", authMiddleware, getDashboardAnalytics);

// Get detailed application reports
router.get("/applications", authMiddleware, getApplicationReports);

// Get employee performance reports
router.get("/employees", authMiddleware, getEmployeeReports);

// Get financial reports
router.get("/financial", authMiddleware, getFinancialReports);

export default router;
