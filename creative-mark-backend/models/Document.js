import mongoose from "mongoose";

const ApplicationDocumentSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    type: { 
      type: String, 
      enum: ["passport", "idCard", "saudiPartnerIqama", "commercial_registration", "financial_statement", "articles_of_association", "other"],
      required: true,
    },
    fileUrl: { type: String, required: true }, // S3 / Cloud / Local
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  }, { timestamps: true });
  
  export default mongoose.models.ApplicationDocument || mongoose.model("ApplicationDocument", ApplicationDocumentSchema);
  