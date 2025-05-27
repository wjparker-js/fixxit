const express = require('express');
const { register, login, updateUser, deleteUser, suspendUser, getUsers, verifyEmail } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/refresh', require('../controllers/authController').refreshToken);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/reset-password', require('../controllers/authController').resetPassword);
router.post('/mfa/enable', authenticate, require('../controllers/authController').enableMfa);
router.post('/mfa/verify', authenticate, require('../controllers/authController').verifyMfa);
router.post('/mfa/disable', authenticate, require('../controllers/authController').disableMfa);
router.post('/logout', authenticate, require('../controllers/authController').logout);
router.get('/users/profile', authenticate, require('../controllers/authController').getProfile);
router.put('/users/profile', authenticate, require('../controllers/authController').updateProfile);
router.delete('/users/profile', authenticate, require('../controllers/authController').deactivateProfile);
router.get('/users/tenants', authenticate, require('../controllers/authController').listTenants);
router.post('/users/switch-tenant', authenticate, require('../controllers/authController').switchTenant);

module.exports = router;