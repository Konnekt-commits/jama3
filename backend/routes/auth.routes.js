const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
