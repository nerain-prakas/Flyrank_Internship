const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', requireAuth, authController.logout);
router.get('/protected/profile', requireAuth, authController.profile);
router.get('/protected/dashboard', requireAuth, authController.dashboard);

module.exports = router;