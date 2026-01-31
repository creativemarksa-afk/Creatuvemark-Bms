import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Application", 
    required: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "SAR" },
  paymentPlan: { 
    type: String, 
    enum: ["full", "installments"], 
    default: "full" 
  },
  status: { 
    type: String, 
    enum: ["pending", "submitted", "approved", "rejected"], 
    default: "pending" 
  },
  receiptImage: { type: String }, // Uploaded receipt image URL
  installments: [{
    amount: { type: Number, required: true },
    receiptImage: { type: String },
    status: { 
      type: String, 
      enum: ["pending", "submitted", "approved", "rejected"], 
      default: "pending" 
    },
    date: { type: Date, default: Date.now },
    uploadedAt: { type: Date },
    verifiedByAdmin: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNotes: { type: String }
  }],
  dueDate: { type: Date },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedByAdmin: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminNotes: { type: String },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
