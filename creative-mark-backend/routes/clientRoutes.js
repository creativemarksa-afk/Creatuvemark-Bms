import express from "express";
import { getAllClients, getClientById, deleteClient } from "../controllers/clientController.js";
import  authMiddleware  from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all clients
router.get("/",authMiddleware, getAllClients);

// Get a single client by ID
router.get("/:clientId", authMiddleware, getClientById);

// Delete a client and all associated data
router.delete("/:clientId", authMiddleware, deleteClient);

export default router;
