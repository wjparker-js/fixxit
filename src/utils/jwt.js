const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateToken = (user) => {
  logger.info('Attempting to generate JWT token for user:', { email: user.email });

  try {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    logger.info('JWT token generated successfully');
    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', { error: error.message });
    throw new Error(`JWT token generation failed: ${error.message}`);
  }
};

const generateRefreshToken = (user) => {
  logger.info('Generating refresh token for user:', { email: user.email });
  try {
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    logger.info('Refresh token generated successfully');
    return refreshToken;
  } catch (error) {
    logger.error('Error generating refresh token:', { error: error.message });
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken };