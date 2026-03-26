const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();
const { canCreateBug } = require('../utils/planEnforcement');

// Public route for the widget to report bugs
exports.createBug = async (req, res) => {
    try {
        const { projectId, title, description, screenshotData, url, browser, os, screen } = req.body;

        if (!projectId || !description) {
            return res.status(400).json({ error: 'Project ID and description are required' });
        }

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (!(await canCreateBug(projectId))) {
            return res.status(403).json({ error: 'Monthly bug report limit reached for this project. Please contact the project owner.' });
        }

        const bug = await prisma.bug.create({
            data: {
                projectId,
                title: title || 'New Bug Report',
                description,
                screenshotData: screenshotData || null,
                url,
                browser,
                os,
                screen
            }
        });

        res.status(201).json(bug);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create bug report' });
    }
};

// Protected routes for dashboard

exports.getBugsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;

        // Allow owner or shared member
        const [owned, member] = await Promise.all([
            prisma.project.findFirst({ where: { id: projectId, ownerId: userId } }),
            prisma.projectMember.findFirst({ where: { projectId, userId } }),
        ]);

        if (!owned && !member) return res.status(403).json({ error: 'Access denied' });

        const bugs = await prisma.bug.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(bugs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bugs' });
    }
};

exports.getBugById = async (req, res) => {
    try {
        const { bugId } = req.params;
        const userId = req.user.userId;

        const bug = await prisma.bug.findUnique({
            where: { id: bugId },
            include: {
                project: true,
                comments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
                statusHistory: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { changedAt: 'asc' }
                }
            }
        });

        if (!bug) return res.status(404).json({ error: 'Bug not found' });

        const member = await prisma.projectMember.findFirst({ where: { projectId: bug.projectId, userId } });
        if (bug.project.ownerId !== userId && !member) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(bug);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bug details' });
    }
};

exports.updateBugStatus = async (req, res) => {
    try {
         const { bugId } = req.params;
         const { status } = req.body;
         const userId = req.user.userId;

         const bug = await prisma.bug.findUnique({ where: { id: bugId }, include: { project: true } });
         if (!bug) return res.status(404).json({ error: 'Bug not found' });
         const member = await prisma.projectMember.findFirst({ where: { projectId: bug.projectId, userId } });
         if (bug.project.ownerId !== userId && !member) {
             return res.status(403).json({ error: 'Access denied' });
         }

         const [updatedBug] = await prisma.$transaction([
             prisma.bug.update({ where: { id: bugId }, data: { status } }),
             prisma.bugStatusHistory.create({
                 data: { bugId, userId, fromStatus: bug.status, toStatus: status }
             })
         ]);

         res.json(updatedBug);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update bug' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { bugId } = req.params;
        const { message } = req.body;
        const userId = req.user.userId;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        const bug = await prisma.bug.findUnique({ where: { id: bugId }, include: { project: true } });
        if (!bug) return res.status(404).json({ error: 'Bug not found' });
        const member = await prisma.projectMember.findFirst({ where: { projectId: bug.projectId, userId } });
        if (bug.project.ownerId !== userId && !member) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const comment = await prisma.comment.create({
            data: {
                bugId,
                userId,
                message
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
