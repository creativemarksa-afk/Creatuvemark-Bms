import express from "express";
import {
  getClientPayments,
  getPaymentDetails,
  submitPayment,
  uploadInstallmentReceipt,
  getPendingPayments,
  verifyPayment,
  verifyInstallmentPayment,
  downloadPaymentReceipt,
  getAllPayments,
} from "../controllers/paymentController.js";
import upload, { handleUploadError } from "../config/upload.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import checkRoles from "../middlewares/checkRoles.js";

const router = express.Router();

// ================== CLIENT PAYMENT ROUTES ==================

// Get all payments for the authenticated client
router.get("/client", authMiddleware, checkRoles("client"), getClientPayments);

// Get details of a specific payment
router.get("/:paymentId", authMiddleware, getPaymentDetails);

// Submit payment with receipt upload (full payment or first installment)
router.post(
  "/:paymentId/submit",
  authMiddleware,
  checkRoles("client"),
  upload.single("receipt"),
  handleUploadError,
  submitPayment
);

// Upload receipt for specific installment
router.post(
  "/:paymentId/installments/:installmentIndex/upload",
  authMiddleware,
  checkRoles("client"),
  upload.single("receipt"),
  handleUploadError,
  uploadInstallmentReceipt
);

// Download or view payment receipt
router.get("/:paymentId/receipt", authMiddleware, downloadPaymentReceipt);

// ================== ADMIN PAYMENT ROUTES ==================

// Get all payments for admin revenue statistics
router.get(
  "/admin/all",
  authMiddleware,
  checkRoles("admin", "staff"),
  getAllPayments
);

// Get all pending payments for admin review
router.get(
  "/admin/pending",
  authMiddleware,
  checkRoles("admin"),
  getPendingPayments
);

// Approve or reject payment
router.patch(
  "/:paymentId/verify",
  authMiddleware,
  checkRoles("admin"),
  verifyPayment
);

// Verify installment payment
router.patch(
  "/:paymentId/installments/:installmentIndex/verify",
  authMiddleware,
  checkRoles("admin"),
  verifyInstallmentPayment
);

export default router;