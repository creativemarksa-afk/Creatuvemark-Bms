import express from "express";
import { updateApplicationStatus } from "../controllers/statusController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Update application status
router.patch("/:applicationId/update", authMiddleware, updateApplicationStatus);

export default router;
