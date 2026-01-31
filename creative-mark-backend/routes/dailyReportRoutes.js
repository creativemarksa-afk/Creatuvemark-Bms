import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createDailyReport, getMyDailyReports, listDailyReports } from "../controllers/dailyReportController.js";
import authorize from "../middlewares/checkRoles.js";

const router = express.Router();

// Employee/Admin: create a daily report
router.post("/", authMiddleware, authorize("employee", "admin"), createDailyReport);

// Employee/Admin: get own daily reports
router.get("/me", authMiddleware, authorize("employee", "admin"), getMyDailyReports);

// Admin: list all daily reports with filters
router.get("/", authMiddleware, authorize("admin"), listDailyReports);

export default router;


