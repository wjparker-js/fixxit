const express = require('express');
const { register, login, updateUser, deleteUser, suspendUser, getUsers } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/suspend', suspendUser);

module.exports = router;