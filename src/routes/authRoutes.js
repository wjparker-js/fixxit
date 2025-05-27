const express = require('express');
const { register, login, updateUser, deleteUser, suspendUser, getUsers, verifyEmail } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/refresh', require('../controllers/authController').refreshToken);
router.get('/verify-email', verifyEmail);

module.exports = router;