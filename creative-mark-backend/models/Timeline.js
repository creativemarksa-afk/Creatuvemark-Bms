import mongoose from "mongoose";

const ApplicationTimelineSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "approved",
        "in_process",
        "completed",
        "rejected",
      ],
      required: true,
    },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Staff/Employee

    // ✅ Progress bar field
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0, // start at 0 when submitted
    },
  },
  { timestamps: true }
);

export default mongoose.models.ApplicationTimeline ||
  mongoose.model("ApplicationTimeline", ApplicationTimelineSchema);
