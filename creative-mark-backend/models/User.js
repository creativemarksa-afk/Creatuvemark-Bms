import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, index: true },
  phone: { type: String, trim: true },
  phoneCountryCode: { type: String, trim: true, default: "+966" },
  nationality: { type: String },
  residencyStatus: { 
    type: String, 
    enum: ["saudi", "gulf", "premium", "foreign"], 
  },
  passwordHash: { type: String, required: true }, // 🔐 Hashed password
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  // Email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },

  // Profile picture
  profilePicture: { type: String }, // URL to profile picture

  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Role-based system
  role: {
    type: String,
    enum: ["client", "employee", "admin"],
    default: "client",
    index: true
  },

  // Employee-specific fields
  employeeDetails: {
    employeeId: { type: String, unique: true, sparse: true }, // Unique employee ID
    position: String,
    department: { 
      type: String, 
      enum: [
        "Administration", "Human Resources", "Finance", "Operations", 
        "IT", "Legal", "Marketing", "Sales", "Customer Service"
      ] 
    },
    salary: Number,
    hireDate: Date,
    manager: String,
    permissions: [String],
    workLocation: String,
    emergencyContact: String,
    skills: [String],
  },

  // Admin-specific fields
  adminDetails: {
    adminId: { type: String, unique: true, sparse: true }, // Unique admin ID
    permissions: [String],
    accessLevel: { 
      type: String, 
      enum: ["admin", "supervisor", "manager", "employee"] 
    },
  },

  // Bio and additional info
  bio: String,

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/**
 * 🔐 Pre-save hook → hash password if changed
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ Compare entered password with stored hash
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

/**
 * Generate unique ID for different user types
 */
UserSchema.statics.generateUniqueId = async function (role) {
  const prefix = role === 'employee' ? 'CR' : 'AD';
  let counter = 1;
  let uniqueId;

  do {
    const randomNum = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
    uniqueId = `${prefix}-${randomNum}`;

    // Check if this ID already exists
    const existingUser = await this.findOne({
      $or: [
        { 'employeeDetails.employeeId': uniqueId },
        { 'adminDetails.adminId': uniqueId }
      ]
    });

    if (!existingUser) break;
    counter++;
  } while (counter < 100); // Prevent infinite loop

  return uniqueId;
};

// Virtual: applications submitted by this user (if client)
UserSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
