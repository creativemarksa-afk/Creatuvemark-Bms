import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Generate JWT Token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

/**
 * @desc    Register a new Client (public)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      phoneCountryCode,
      nationality,
      residencyStatus,
      password,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 1️⃣ Generate verification token
    const verificationToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 2️⃣ Create unverified user
    const user = new User({
      fullName,
      email: normalizedEmail,
      phone,
      phoneCountryCode: phoneCountryCode || "+966",
      nationality,
      residencyStatus,
      passwordHash: password,
      role: "client",
      isVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour
    });

    await user.save();

    // 3️⃣ Prepare verification link
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    // 4️⃣ Send email asynchronously (non-blocking)
    await sendEmail(
      normalizedEmail,
      `Welcome to ${process.env.BRAND_NAME} - Verify Your Email`,
      `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
            <div style="background: #242021; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffd17a; font-size: 28px;">Welcome to CreativeMark!</h1>
              <p style="margin: 12px 0 0; color: #ffd17a; opacity: 0.8;">Verify your email to get started</p>
            </div>
            <div style="padding: 40px 20px;">
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
              <p style="margin: 0 0 30px; color: #666; line-height: 1.6;">
                Thank you for joining CreativeMark. Please verify your email address to complete your registration.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyLink}" style="display: inline-block; padding: 16px 40px; background: #242021; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
              </div>
              <p style="margin: 30px 0 0; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #666; word-break: break-all;">
                Or copy this link: ${verifyLink}
              </p>
              <div style="margin: 30px 0; padding: 16px; background: #fff3cd; border-left: 4px solid #ffd17a; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⏰ <strong>This link expires in 1 hour.</strong>
                </p>
              </div>
              <p style="margin: 30px 0 0; color: #999; font-size: 13px;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Best regards,<br><strong style="color: #242021;">CreativeMark Team</strong>
              </p>
              <p style="margin: 20px 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} CreativeMark. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    // 5️⃣ Send instant response to frontend
    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified. You can now log in.",
        alreadyVerified: true,
      });
    }

    // Check if token expired manually (optional)
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Verification link expired" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Send verification email
export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isVerified)
      return res.json({ success: true, message: "Email already verified" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Update user with new verification token
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail(
      email,
      `Verify Your Email - ${process.env.BRAND_NAME}`,
      `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
            
            <!-- Header -->
            <div style="background: #242021; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffd17a; font-size: 28px;">Verify Your Email</h1>
              <p style="margin: 12px 0 0; color: #ffd17a; opacity: 0.8;">New verification link requested</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 20px;">
              <p style="margin: 0 0 20px; color: #333; font-size: 16px;">Hi <strong>${
                user.fullName
              }</strong>,</p>
              
              <p style="margin: 0 0 30px; color: #666; line-height: 1.6;">
                You requested a new verification link for your CreativeMark account. Click the button below to verify your email.
              </p>

              <!-- Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyLink}" 
                   style="display: inline-block; padding: 16px 40px; background: #242021; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Verify Email
                </a>
              </div>

              <!-- Alternative Link -->
              <p style="margin: 30px 0 0; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 13px; color: #666; word-break: break-all;">
                Or copy this link: ${verifyLink}
              </p>

              <!-- Warning -->
              <div style="margin: 30px 0; padding: 16px; background: #fff3cd; border-left: 4px solid #ffd17a; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⏰ <strong>This link expires in 1 hour.</strong>
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #999; font-size: 13px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Best regards,<br><strong style="color: #242021;">CreativeMark Team</strong>
              </p>
              <p style="margin: 20px 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} CreativeMark. All rights reserved.
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    );

    res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Send verification email error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Register Admin (protected, main office only)
 * @route   POST /api/auth/register-admin
 * @access  Private (Admin only)
 */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const token = generateToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // must be HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-domain in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // Ensure cookie is available for all paths
      domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode,
        nationality: user.nationality,
        residencyStatus: user.residencyStatus,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (req, res) => {
  try {
    // Clear the token cookie by setting it to expire immediately
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // must be HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allow cross-domain cookies
      maxAge: 0, // Expire immediately
      path: "/", // Ensure cookie is available for all paths
      domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout",
    });
  }
};

/**
 * @desc    Create new user (Employee, Partner, or Admin)
 * @route   POST /api/auth/create-user
 * @access  Private (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Handle both JSON and FormData
    const parseData = (data) => {
      const parsed = {};
      for (const [key, value] of Object.entries(data)) {
        // Handle arrays (skills, permissions, specializations, etc.)
        if (
          typeof value === "string" &&
          (value.startsWith("[") || value.startsWith("{"))
        ) {
          try {
            parsed[key] = JSON.parse(value);
          } catch (e) {
            parsed[key] = value;
          }
        } else {
          parsed[key] = value;
        }
      }
      return parsed;
    };

    const formData = parseData(req.body);

    const {
      fullName,
      email,
      phone,
      phoneCountryCode,
      password,
      role,
      nationality,
      residencyStatus,
      address,
      profilePicture,
      bio,
      autoApprove,
      // Employee fields
      position,
      department,
      hireDate,
      permissions,
      workLocation,
      emergencyContact,
      skills,
      // Admin fields
      accessLevel,
    } = formData;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and role are required",
      });
    }

    // Validate role
    if (!["employee", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be employee or admin",
      });
    }

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Generate unique ID based on role
    const uniqueId = await User.generateUniqueId(role);

    // Prepare user data
    const userData = {
      fullName,
      email: normalizedEmail,
      phone,
      phoneCountryCode: phoneCountryCode || "+966",
      passwordHash: password,
      role,
      nationality,
      residencyStatus,
      address,
      profilePicture,
      bio,
      isActive: true,
      isVerified: autoApprove || false, // Auto-verify if admin chooses to skip email verification
    };

    // Add role-specific details
    if (role === "employee") {
      userData.employeeDetails = {
        employeeId: uniqueId,
        position,
        department,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        permissions: permissions || [],
        workLocation,
        emergencyContact,
        skills: skills || [],
      };
    } else if (role === "admin") {
      userData.adminDetails = {
        adminId: uniqueId,
        permissions: permissions || [],
        accessLevel: accessLevel || "admin",
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully${autoApprove ? ' and auto-approved' : '. Email verification sent'}`,
      data: userResponse,
      autoApproved: autoApprove || false,
    });
  } catch (error) {
    console.error("Create User Error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    console.log('🚀 Backend: Starting profile update...');
    console.log('📊 Backend: User ID:', req.user.id);
    console.log('📊 Backend: Request body:', req.body);
    console.log('📊 Backend: Request file:', req.file);

    const userId = req.user.id;

    // Handle both JSON and FormData
    const parseData = (data) => {
      const parsed = {};
      for (const [key, value] of Object.entries(data)) {
        // Handle arrays (skills, permissions, specializations, etc.)
        if (
          typeof value === "string" &&
          (value.startsWith("[") || value.startsWith("{"))
        ) {
          try {
            parsed[key] = JSON.parse(value);
          } catch (e) {
            parsed[key] = value;
          }
        } else {
          parsed[key] = value;
        }
      }
      return parsed;
    };

    const formData = parseData(req.body);
    console.log('📊 Backend: Parsed form data:', formData);

    // Handle profile picture upload
    let profilePictureUrl = null;
    if (req.file) {
      // File was uploaded via multer and saved to Cloudinary
      profilePictureUrl = req.file.path;
      console.log("Profile picture uploaded to Cloudinary:", profilePictureUrl);
    }

    const {
      fullName,
      email,
      phone,
      phoneCountryCode,
      nationality,
      address,
      bio,
      profilePicture,
      // Employee fields
      position,
      department,
      hireDate,
      permissions,
      workLocation,
      emergencyContact,
      skills,
      // Admin fields
      accessLevel,
    } = formData;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update basic user information
    const updateData = {
      fullName: fullName || user.fullName,
      email: email ? email.toLowerCase().trim() : user.email,
      phone: phone || user.phone,
      phoneCountryCode: phoneCountryCode || user.phoneCountryCode,
      nationality: nationality || user.nationality,
      address: address || user.address,
      bio: bio || user.bio,
      profilePicture:
        profilePictureUrl || profilePicture || user.profilePicture,
    };

    // Update role-specific details based on user role
    if (user.role === "employee") {
      updateData.employeeDetails = {
        ...user.employeeDetails,
        position: position || user.employeeDetails?.position,
        department: department || user.employeeDetails?.department,
        hireDate: hireDate
          ? new Date(hireDate)
          : user.employeeDetails?.hireDate,
        permissions: permissions || user.employeeDetails?.permissions || [],
        workLocation: workLocation || user.employeeDetails?.workLocation,
        emergencyContact:
          emergencyContact || user.employeeDetails?.emergencyContact,
        skills: skills || user.employeeDetails?.skills || [],
      };
    } else if (user.role === "admin") {
      updateData.adminDetails = {
        ...user.adminDetails,
        permissions: permissions || user.adminDetails?.permissions || [],
        accessLevel: accessLevel || user.adminDetails?.accessLevel || "admin",
      };
    }

    // Update the user
    console.log('📊 Backend: Update data:', updateData);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    console.log('✅ Backend: User updated successfully:', updatedUser);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/auth/update-settings
 * @access  Private
 */
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update settings
    user.settings = {
      ...user.settings,
      ...settingsData,
    };

    await user.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: user.settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Delete user by ID (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { id } = req.params;
    const { deletedBy } = req.body;

    // Validate required fields
    if (!deletedBy) {
      return res.status(400).json({
        success: false,
        message: "Deleted by user ID is required",
      });
    }

    // Validate user ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Find user to ensure it exists
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Verify the user deleting has permission (admin)
    const deletingUser = await User.findById(deletedBy);
    if (!deletingUser || deletingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only admin can delete users",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    // Emit notification if needed (optional)
    const io = req.app.get("io");
    if (io) {
      // You can add notification logic here if needed
      console.log(
        `User ${userToDelete.fullName} deleted by ${deletingUser.fullName}`
      );
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        userId: id,
        deletedUser: {
          name: userToDelete.fullName,
          email: userToDelete.email,
          role: userToDelete.role,
        },
        deletedBy: deletingUser.fullName,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
