const { createClient } = require('redis');
const logger = require('../config/logger');

let redisClient = null;

// Only create and connect Redis client if not in test environment
if (process.env.NODE_ENV !== 'test') {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', err => logger.error('Redis Client Error', err));

  (async () => {
    try {
      await redisClient.connect();
      logger.info('Redis connection established successfully');
    } catch (err) {
      logger.error('Failed to connect to Redis', err);
      // In production, you might want to exit or implement a retry strategy
      // For now, we'll just log the error.
    }
  })();
}

module.exports = redisClient; 