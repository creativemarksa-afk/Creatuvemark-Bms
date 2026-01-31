import express from "express";
import {
  createTicket,
  getAllTickets,
  getMyTickets,
  assignTicket,
  updateStatus,
  deleteTicket,
} from "../controllers/ticketController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js";
import  authorize  from "../middlewares/checkRoles.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("client"), createTicket);


router.get("/", authMiddleware, authorize("admin"), getAllTickets);


router.get("/my", authMiddleware, authorize("employee","client"), getMyTickets);


router.patch("/:id/assign", authMiddleware, authorize("admin"), assignTicket);

router.patch("/:id/status", authMiddleware, authorize("admin", "employee"), updateStatus);

router.delete("/:id", authMiddleware, authorize("admin"), deleteTicket);

export default router;
