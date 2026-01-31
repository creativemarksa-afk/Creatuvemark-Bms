import mongoose from "mongoose";

const DailyReportSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    tasksCompleted: { type: String, required: true },
    issues: { type: String },
    nextPlans: { type: String },
    attachments: [
      {
        url: String,
        publicId: String,
        name: String,
        size: Number,
        mimeType: String,
      },
    ],
  },
  { timestamps: true }
);

DailyReportSchema.index({ employee: 1, date: -1 });

export default mongoose.models.DailyReport || mongoose.model("DailyReport", DailyReportSchema);


