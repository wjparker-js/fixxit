const bcrypt = require('bcryptjs');
const { User, Tenant, UserTenant } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../config/logger');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const speakeasy = require('speakeasy');
const redisClient = require('../services/redisClient');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, emailVerificationToken });
    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
    } catch (emailErr) {
      logger.error('Error sending verification email:', emailErr);
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const originalLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Login attempt initiated for email:', email);
    
    const user = await User.findOne({ where: { email } });
    logger.info('User lookup result:', { email, found: !!user });
    
    if (!user) {
      logger.warn('Login failed: User not found:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      logger.info('Password verification completed:', { email, isValid: isValidPassword });
      
      if (!isValidPassword) {
        logger.warn('Login failed: Invalid password:', { email });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      logger.error('bcrypt comparison error:', { error: bcryptError.message, email });
      return res.status(500).json({ message: 'Error during authentication' });
    }

    try {
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      logger.info('JWT and refresh token generated successfully:', { email });

      // Store refresh token in Redis with user ID as value
      await redisClient.set(`refreshToken:${refreshToken}`, user.id, { EX: 7 * 24 * 60 * 60 });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (tokenError) {
      logger.error('JWT token generation error:', { error: tokenError.message, email });
      return res.status(500).json({ message: 'Error generating authentication token' });
    }
  } catch (error) {
    logger.error('Unexpected login error:', { error: error.message });
    res.status(500).json({ message: 'An unexpected error occurred during login' });
  }
};

const login = async (req, res) => {
  await originalLogin(req, res);
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }
  } catch (e) { logger.error('Error updating lastLogin:', e); }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      logger.warn('Invalid refresh token:', err.message);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    // Check if refresh token exists in Redis
    const redisUserId = await redisClient.get(`refreshToken:${refreshToken}`);
    if (!redisUserId || redisUserId !== payload.id) {
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newAccessToken = generateToken(user);
    res.json({ token: newAccessToken });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await redisClient.del(`refreshToken:${refreshToken}`);
      res.clearCookie('refreshToken');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email: userEmail } = req.params;
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ name, email, role, isActive });
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, 
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: false });
    
    res.json({
      message: 'User suspended successfully',
      user: {
        id: user.id,
        isActive: false
      }
    });
  } catch (error) {
    logger.error('Suspend user error:', error);
    res.status(500).json({ message: 'Error suspending user' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    });
    
    res.json({
      message: 'Users retrieved successfully',
      users
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token missing' });
    }
    const user = await User.findOne({ where: { emailVerificationToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'If that email is registered, a password reset link has been sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailErr) {
      logger.error('Error sending password reset email:', emailErr);
    }
    res.status(200).json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

const enableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is already enabled' });
    }
    const secret = speakeasy.generateSecret({ name: `Fixxit (${user.email})` });
    user.mfaSecret = secret.base32;
    await user.save();
    res.json({
      message: 'MFA secret generated. Scan the QR code with your authenticator app.',
      otpauth_url: secret.otpauth_url
    });
  } catch (error) {
    logger.error('Enable MFA error:', error);
    res.status(500).json({ message: 'Error enabling MFA' });
  }
};

const verifyMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    const user = await User.findByPk(userId);
    if (!user || !user.mfaSecret) {
      return res.status(404).json({ message: 'User or MFA secret not found' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });
    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }
    user.mfaEnabled = true;
    await user.save();
    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    logger.error('Verify MFA error:', error);
    res.status(500).json({ message: 'Error verifying MFA' });
  }
};

const disableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.mfaEnabled = false;
    user.mfaSecret = null;
    await user.save();
    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    logger.error('Disable MFA error:', error);
    res.status(500).json({ message: 'Error disabling MFA' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'mfaSecret', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const deactivateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = false;
    await user.save();
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    logger.error('Deactivate profile error:', error);
    res.status(500).json({ message: 'Error deactivating account' });
  }
};

const listTenants = async (req, res) => {
  try {
    const userTenants = await UserTenant.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [{ model: Tenant }]
    });
    const tenants = userTenants.map(ut => ut.Tenant);
    res.json({ tenants });
  } catch (error) {
    logger.error('List tenants error:', error);
    res.status(500).json({ message: 'Error fetching tenants' });
  }
};

const switchTenant = async (req, res) => {
  try {
    const { tenantId } = req.body;
    const userTenant = await UserTenant.findOne({
      where: { userId: req.user.id, tenantId, isActive: true }
    });
    if (!userTenant) {
      return res.status(403).json({ message: 'Access to tenant denied' });
    }
    const user = await User.findByPk(req.user.id);
    user.activeTenantId = tenantId;
    await user.save();
    res.json({ message: 'Tenant switched successfully', activeTenantId: tenantId });
  } catch (error) {
    logger.error('Switch tenant error:', error);
    res.status(500).json({ message: 'Error switching tenant' });
  }
};

const trackActivity = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.lastActivity = new Date();
      await user.save();
    }
  } catch (e) { logger.error('Error updating lastActivity:', e); }
  next();
};

module.exports = {
  register,
  login,
  updateUser,
  deleteUser,
  suspendUser,
  getUsers,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  enableMfa,
  verifyMfa,
  disableMfa,
  logout,
  getProfile,
  updateProfile,
  deactivateProfile,
  listTenants,
  switchTenant,
  trackActivity
};

// Export for testing
exports.register = register;