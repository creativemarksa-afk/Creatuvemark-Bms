import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Client

    serviceType: {
      type: String,
      enum: [
        "commercial",
        "engineering",
        "real_estate",
        "industrial",
        "agricultural",
        "service",
        "advertising",
      ],
      required: true,
    },

    externalCompaniesCount: { type: Number, default: 0 },
    externalCompaniesDetails: [
      {
        companyName: { type: String },
        country: { type: String },
        crNumber: { type: String }, // Commercial Registration
        sharePercentage: { type: Number },
      },
    ],

    projectEstimatedValue: { type: Number }, // Real estate case

    familyMembers: [
      {
        name: { type: String },
        relation: { type: String, enum: ["spouse", "child", "parent", "other"] },
        passportNo: { type: String },
      },
    ],

    needVirtualOffice: { type: Boolean, default: false },
    companyArrangesExternalCompanies: { type: Boolean, default: false },

    // Status Workflow
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "in_process", "completed", "rejected"],
      default: "submitted",
      index: true,
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,

    // Assigned employees
    assignedEmployees: [
      {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        task: String,
        assignedAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

// Virtuals
ApplicationSchema.virtual("documents", {
  ref: "ApplicationDocument",
  localField: "_id",
  foreignField: "applicationId",
});

ApplicationSchema.virtual("timeline", {
  ref: "ApplicationTimeline",
  localField: "_id",
  foreignField: "applicationId",
});

ApplicationSchema.virtual("payment", {
  ref: "Payment",
  localField: "_id",
  foreignField: "applicationId",
  justOne: true,
});

ApplicationSchema.set("toJSON", { virtuals: true });
ApplicationSchema.set("toObject", { virtuals: true });

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
