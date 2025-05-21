/**
 * This file demonstrates how Sequelize's create method works
 * and shows the SQL it generates when creating a user.
 */

const { User } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

// Enable detailed SQL logging
sequelize.options.logging = (sql) => {
  console.log('\n----- GENERATED SQL -----');
  console.log(sql);
  console.log('------------------------\n');
};

/**
 * When User.create() is called, Sequelize:
 * 
 * 1. Validates the input data against model constraints
 * 2. Triggers any beforeCreate hooks (like password hashing)
 * 3. Generates and executes an INSERT SQL statement
 * 4. Returns the created model instance
 */
async function demonstrateUserCreate() {
  try {
    console.log('Creating a new user...');
    
    // This is what happens when User.create() is called in authController.js
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123' // Will be hashed by beforeCreate hook
    };
    
    console.log('\nInput data:', userData);
    
    // The create method will:
    // 1. Apply the beforeCreate hook (hash the password)
    // 2. Generate an INSERT SQL statement
    // 3. Execute the SQL against the database
    const user = await User.create(userData);
    
    console.log('\nUser created successfully!');
    console.log('\nReturned user object (password is now hashed):', user.toJSON());
    
    // The complete flow:
    console.log('\n----- COMPLETE FLOW -----');
    console.log('1. User.create({name, email, password}) is called');
    console.log('2. beforeCreate hook hashes the password');
    console.log('3. Sequelize generates SQL: INSERT INTO Users (...) VALUES (...)');
    console.log('4. SQL is executed against the database');
    console.log('5. New user record is created with a UUID');
    console.log('6. Sequelize returns the user object with all fields');
    console.log('-------------------------');
    
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', error.message);
    if (error.parent) {
      console.error('Database error:', error.parent.message);
    }
    return false;
  } finally {
    // Close the database connection
    try {
      console.log('Closing database connection...');
      await sequelize.close();
      console.log('Database connection closed successfully');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
    // Force exit if the process hangs
    setTimeout(() => {
      console.log('Forcing process exit after timeout');
      process.exit(0);
    }, 1000);
  }
}

// Run the demonstration
(async () => {
  console.log('Starting user creation demonstration...');
  try {
    await demonstrateUserCreate();
    console.log('Demonstration completed');
  } catch (error) {
    console.error('Demonstration failed:', error);
  }
})();

/**
 * To run this demonstration:
 * node src/examples/sequelizeCreateDemo.js
 * 
 * Expected output will show:
 * 1. The input data
 * 2. The generated SQL statement
 * 3. The returned user object with hashed password
 */