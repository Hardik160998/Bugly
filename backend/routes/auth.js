const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = function authRoutes(dashboardCors) {
    const router = express.Router();
    router.options('/register', dashboardCors);
    router.options('/login', dashboardCors);
    router.options('/profile', dashboardCors);
    router.options('/profile/stats', dashboardCors);
    router.post('/register', dashboardCors, authController.register);
    router.post('/login', dashboardCors, authController.login);
    router.patch('/profile', dashboardCors, authMiddleware, authController.updateProfile);
    router.get('/profile/stats', dashboardCors, authMiddleware, authController.getProfileStats);
    return router;
};
