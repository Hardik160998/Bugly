const express = require('express');
const projectsController = require('../controllers/projects');
const bugsController = require('../controllers/bugs');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = function projectRoutes(dashboardCors) {
    const router = express.Router();

    router.options('/', dashboardCors);
    router.options('/stats', dashboardCors);
    router.options('/:id', dashboardCors);
    router.options('/:id/bugs', dashboardCors);
    router.options('/:id/members', dashboardCors);
    router.options('/:id/members/:userId', dashboardCors);

    router.get('/stats', dashboardCors, authMiddleware, projectsController.getStats);
    router.post('/', dashboardCors, authMiddleware, projectsController.createProject);
    router.get('/', dashboardCors, authMiddleware, projectsController.getProjects);
    router.get('/:id', dashboardCors, authMiddleware, projectsController.getProjectById);
    router.delete('/:id', dashboardCors, authMiddleware, projectsController.deleteProject);
    router.get('/:projectId/bugs', dashboardCors, authMiddleware, bugsController.getBugsByProject);

    // Sharing
    router.post('/:id/members', dashboardCors, authMiddleware, projectsController.shareProject);
    router.get('/:id/members', dashboardCors, authMiddleware, projectsController.getMembers);
    router.delete('/:id/members/:userId', dashboardCors, authMiddleware, projectsController.removeMember);

    return router;
};
