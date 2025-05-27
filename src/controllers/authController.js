const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../config/logger');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

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

const login = async (req, res) => {
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
    // Optionally: check if token is blacklisted or revoked
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

module.exports = {
  register,
  login,
  updateUser,
  deleteUser,
  suspendUser,
  getUsers,
  refreshToken,
  verifyEmail
};