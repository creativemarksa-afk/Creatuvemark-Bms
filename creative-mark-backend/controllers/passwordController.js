import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

/**
 * @desc   Handle forgot password request
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // 2️⃣ Check if user exists (normalize email)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Send same message to avoid email enumeration
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    }

    // 3️⃣ Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 4️⃣ Save hashed token and expiration in DB
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // 5️⃣ Create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    // 6️⃣ Prepare professional email content with Tailwind CSS
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - CreativeMark</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'brand-dark': '#242021',
                            'brand-light': '#2a2422',
                            'brand-accent': '#ffd17a',
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 font-sans">
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-br from-brand-dark to-brand-light px-8 py-10 text-center relative">
                <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"%23ffd17a\" stroke-width=\"0.5\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>');"></div>
                <div class="relative z-10">
                    <div class="w-16 h-16 bg-brand-accent bg-opacity-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-bold text-brand-accent">
                        CM
                    </div>
                    <h1 class="text-white text-3xl font-bold mb-2">Password Reset Request</h1>
                    <p class="text-brand-accent text-lg">CreativeMark Business Management System</p>
                </div>
            </div>
            
            <!-- Content -->
            <div class="px-8 py-10">
                <div class="text-brand-dark text-xl font-semibold mb-5">
                    Hello ${user.fullName || 'Valued Client'},
                </div>
                
                <div class="text-gray-600 text-base mb-8 leading-relaxed">
                    We received a request to reset your password for your CreativeMark account. If you made this request, click the button below to reset your password.
                </div>
                
                <div class="text-center mb-8">
                    <a href="${resetLink}" class="inline-block bg-gradient-to-r from-brand-dark to-brand-light text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                        Reset My Password
                    </a>
                </div>
                
                <div class="bg-gray-50 border-l-4 border-brand-accent p-5 mb-8 rounded-r-lg">
                    <h3 class="text-brand-dark text-lg font-semibold mb-3 flex items-center">
                        🔒 Security Information
                    </h3>
                    <ul class="space-y-2">
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">✓</span>
                            This link will expire in 1 hour for your security
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">✓</span>
                            You can only use this link once
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">✓</span>
                            If you didn't request this, please ignore this email
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">✓</span>
                            Your password will remain unchanged until you click the link
                        </li>
                    </ul>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-8">
                    <h3 class="text-yellow-800 text-lg font-semibold mb-3 flex items-center">
                        ⚠️ Important Security Notice
                    </h3>
                    <p class="text-yellow-700 text-sm">
                        If you didn't request a password reset, please ignore this email. Your account remains secure and no changes have been made.
                    </p>
                </div>
                
                <div class="text-gray-600 text-base leading-relaxed">
                    <strong class="text-brand-dark">Having trouble with the button?</strong><br>
                    Copy and paste this link into your browser:<br>
                    <a href="${resetLink}" class="text-brand-dark break-all hover:text-brand-accent transition-colors">${resetLink}</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-8 py-8 text-center border-t border-gray-200">
                <p class="text-gray-600 text-sm mb-2">This email was sent from CreativeMark Business Management System</p>
                <p class="text-gray-600 text-sm mb-5">If you have any questions, please contact our support team</p>
                
                <div class="flex justify-center space-x-6 mb-5">
                    <a href="#" class="text-brand-dark text-sm hover:text-brand-accent transition-colors">Website</a>
                    <a href="#" class="text-brand-dark text-sm hover:text-brand-accent transition-colors">Support</a>
                    <a href="#" class="text-brand-dark text-sm hover:text-brand-accent transition-colors">Privacy Policy</a>
                </div>
                
                <div class="text-brand-dark font-semibold text-sm">
                    © 2024 CreativeMark. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // 7️⃣ Send email
    await sendEmail(user.email, "🔐 Password Reset Request - CreativeMark", html);

    return res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};

/**
 * @desc   Handle password reset
 * @route  POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    // 1️⃣ Validate input
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2️⃣ Hash the token to match stored value
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3️⃣ Find user with valid token (normalize email)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // 4️⃣ Set new password (let the pre-save hook handle hashing)
    user.passwordHash = newPassword;

    // 5️⃣ Clear reset fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Send confirmation email with Tailwind CSS
    const confirmationHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - CreativeMark</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'brand-dark': '#242021',
                            'brand-light': '#2a2422',
                            'brand-accent': '#ffd17a',
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gray-50 font-sans">
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-br from-green-500 to-teal-500 px-8 py-10 text-center">
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-bold text-white">
                    CM
                </div>
                <h1 class="text-white text-3xl font-bold mb-2">Password Reset Successful</h1>
                <p class="text-white text-opacity-90 text-lg">CreativeMark Business Management System</p>
            </div>
            
            <!-- Content -->
            <div class="px-8 py-10">
                <div class="text-brand-dark text-xl font-semibold mb-5">
                    Hello ${user.fullName || 'Valued Client'},
                </div>
                
                <div class="text-gray-600 text-base mb-8 leading-relaxed">
                    Your password has been successfully reset. You can now log in to your CreativeMark account using your new password.
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-5 mb-8">
                    <h3 class="text-green-800 text-lg font-semibold mb-3 flex items-center">
                        ✅ Password Reset Confirmed
                    </h3>
                    <p class="text-green-700 text-sm">
                        Your account password was changed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}. If you did not make this change, please contact our support team immediately.
                    </p>
                </div>
                
                <div class="bg-gray-50 border-l-4 border-brand-accent p-5 mb-8 rounded-r-lg">
                    <h3 class="text-brand-dark text-lg font-semibold mb-3 flex items-center">
                        🛡️ Security Tips
                    </h3>
                    <ul class="space-y-2">
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">•</span>
                            Use a strong, unique password
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">•</span>
                            Don't share your password with anyone
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">•</span>
                            Log out from shared devices
                        </li>
                        <li class="text-gray-600 flex items-start">
                            <span class="text-brand-accent font-bold mr-2">•</span>
                            Enable two-factor authentication if available
                        </li>
                    </ul>
                </div>
                
                <div class="text-gray-600 text-base leading-relaxed">
                    <strong class="text-brand-dark">Need help?</strong><br>
                    If you have any questions or concerns, please don't hesitate to contact our support team.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-8 py-8 text-center border-t border-gray-200">
                <p class="text-gray-600 text-sm mb-2">This email was sent from CreativeMark Business Management System</p>
                <p class="text-gray-600 text-sm mb-5">If you have any questions, please contact our support team</p>
                
                <div class="text-brand-dark font-semibold text-sm">
                    © 2024 CreativeMark. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send confirmation email
    try {
        await sendEmail(user.email, "✅ Password Reset Successful - CreativeMark", confirmationHtml);
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the password reset if email fails
    }

    return res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    return res.status(500).json({ message: "Unable to reset password. Try again later." });
  }
};
