const express = require('express');
const rateLimit = require('express-rate-limit');
const bugsController = require('../controllers/bugs');
const authMiddleware = require('../middleware/authMiddleware');

const bugSubmitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many bug reports submitted. Please try again later.' },
});

module.exports = function bugRoutes(dashboardCors, widgetCors) {
    const router = express.Router();

    // Preflight for public widget routes
    router.options('/', widgetCors);

    // Preflight for protected dashboard routes
    router.options('/:bugId', dashboardCors);
    router.options('/:bugId/status', dashboardCors);
    router.options('/:bugId/comments', dashboardCors);

    // Public widget routes
    router.post('/', widgetCors, bugSubmitLimiter, bugsController.createBug);

    // Protected dashboard routes
    router.get('/:bugId', dashboardCors, authMiddleware, bugsController.getBugById);
    router.patch('/:bugId/status', dashboardCors, authMiddleware, bugsController.updateBugStatus);
    router.post('/:bugId/comments', dashboardCors, authMiddleware, bugsController.addComment);

    return router;
};
