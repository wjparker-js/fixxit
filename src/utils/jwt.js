const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = '6b9283070bdd7bebf2b45b221d503d7668de39cf0a790a6d44e8e05027e20b38';

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

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };