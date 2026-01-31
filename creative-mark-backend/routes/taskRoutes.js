import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getMyTasks,
  getTaskStats,
} from "../controllers/taskController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Task CRUD operations
router.post("/", createTask);
router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.get("/my-tasks", getMyTasks);
router.get("/:taskId", getTaskById);
router.patch("/:taskId/status", updateTaskStatus);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
