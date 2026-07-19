const User = require('../models/User');
const tokenUtils = require('../utils/tokenUtils');
const responseHandler = require('../utils/responseHandler');
const crypto = require('crypto');

// Cookie options for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Register User
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler.error(res, 'Email address already registered', 'CONFLICT', null, 409);
    }

    // Generate mock OTP (e.g. 123456 for easy local development, or random 6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Create User (isVerified is false by default, but true in development/test for easy testing)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed via pre-save hook
      otp,
      otpExpiry,
      isVerified: process.env.NODE_ENV !== 'production'
    });

    console.log(`✉️ Email Mock Service: Verification OTP for ${email} is ${otp}`);

    return responseHandler.success(
      res,
      'Registration successful. Please verify your email with the OTP sent.',
      {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 'Invalid email or password', 'UNAUTHORIZED', null, 401);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return responseHandler.error(res, 'Invalid email or password', 'UNAUTHORIZED', null, 401);
    }

    // Check if verified
    if (!user.isVerified) {
      return responseHandler.error(
        res,
        'Please verify your email address before logging in.',
        'FORBIDDEN',
        null,
        403
      );
    }

    // Generate Tokens
    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set Refresh Token in httpOnly Cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return responseHandler.success(res, 'Login successful', {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Tokens
 */
exports.refresh = async (req, res, next) => {
  try {
    // Read token from cookies (fallback to header if needed)
    const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      return responseHandler.error(res, 'Session expired or missing refresh token', 'UNAUTHORIZED', null, 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = tokenUtils.verifyRefreshToken(token);
    } catch (err) {
      return responseHandler.error(res, 'Invalid or expired session token', 'UNAUTHORIZED', null, 401);
    }

    // Find User
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return responseHandler.error(res, 'Session token is invalid or revoked', 'UNAUTHORIZED', null, 401);
    }

    // Generate new tokens
    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Reset cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return responseHandler.success(res, 'Access token refreshed successfully', {
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 */
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];
    
    if (token) {
      // Invalidate token in DB
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }

    // Clear client cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return responseHandler.success(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP / Email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    if (user.isVerified) {
      return responseHandler.error(res, 'Email address is already verified', 'BAD_REQUEST', null, 400);
    }

    // Validate OTP
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return responseHandler.error(res, 'Invalid or expired verification OTP', 'UNAUTHORIZED', null, 401);
    }

    // Update verification state
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return responseHandler.success(res, 'Email verified successfully. You can now login.');
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password (Request OTP)
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return success to avoid user enumeration attacks
      return responseHandler.success(res, 'If email exists, a password reset OTP has been sent.');
    }

    // Generate password reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    console.log(`✉️ Email Mock Service: Password reset OTP for ${email} is ${otp}`);

    return responseHandler.success(res, 'Password reset OTP has been sent to your email.');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Forgot Password OTP
 */
exports.verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    // Verify OTP
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return responseHandler.error(res, 'Invalid or expired OTP', 'UNAUTHORIZED', null, 401);
    }

    // Generate temporary password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save token as OTP temporarily for validation in next step
    user.otp = resetToken;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins reset limit
    await user.save();

    return responseHandler.success(res, 'OTP verified successfully', {
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    const user = await User.findOne({
      otp: resetToken,
      otpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return responseHandler.error(
        res,
        'Invalid or expired password reset request session',
        'UNAUTHORIZED',
        null,
        401
      );
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.refreshToken = null; // Revoke active sessions
    await user.save();

    return responseHandler.success(res, 'Password reset successfully. You can now login with your new password.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile (Authenticated)
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) {
      return responseHandler.error(res, 'User profile not found', 'NOT_FOUND', null, 404);
    }
    
    return responseHandler.success(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile (firstName, lastName)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return responseHandler.error(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    return responseHandler.success(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password (Authenticated)
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return responseHandler.error(res, 'Current password and new password are required', 'BAD_REQUEST', null, 400);
    }

    if (newPassword.length < 8) {
      return responseHandler.error(res, 'New password must be at least 8 characters', 'BAD_REQUEST', null, 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return responseHandler.error(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return responseHandler.error(res, 'Current password is incorrect', 'UNAUTHORIZED', null, 401);
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.refreshToken = null; // Revoke all sessions
    await user.save();

    return responseHandler.success(res, 'Password changed successfully. Please login again.');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User Account (Authenticated)
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return responseHandler.error(res, 'Password is required to delete account', 'BAD_REQUEST', null, 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return responseHandler.error(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return responseHandler.error(res, 'Password is incorrect', 'UNAUTHORIZED', null, 401);
    }

    // Delete all contacts for this user
    const Contact = require('../models/Contact');
    await Contact.deleteMany({ userId: req.user.id });

    // Delete all activity logs
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.deleteMany({ userId: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return responseHandler.success(res, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};
