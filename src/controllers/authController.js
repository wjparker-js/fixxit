const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const logger = require('../config/logger');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: 'User registered successfully',
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
      logger.info('JWT token generated successfully:', { email });

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

module.exports = {
  register,
  login
};