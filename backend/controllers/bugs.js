const prisma = require('../lib/db');
const { canCreateBug } = require('../utils/planEnforcement');

// Public route for the widget to report bugs
exports.createBug = async (req, res) => {
    try {
        const { projectId, title, description, screenshotData, url, browser, os, screen } = req.body;

        if (!projectId || !description) {
            return res.status(400).json({ error: 'Project ID and description are required' });
        }

        // Optimized check: only select id and ownerId to verify existence
        const project = await prisma.project.findUnique({ 
            where: { id: projectId },
            select: { id: true, ownerId: true }
        });
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
            },
            select: { id: true } // Widget only needs the new ID
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Optimized access check + data fetch in one go if possible
        const [projectInfo, bugs, total] = await Promise.all([
            prisma.project.findFirst({ 
                where: { 
                    id: projectId,
                    OR: [{ ownerId: userId }, { members: { some: { userId } } }]
                },
                select: { id: true } 
            }),
            prisma.bug.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    browser: true,
                    os: true
                }
            }),
            prisma.bug.count({ where: { projectId } })
        ]);

        if (!projectInfo) return res.status(403).json({ error: 'Access denied' });

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json({
            bugs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
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
            select: {
                id: true,
                projectId: true,
                title: true,
                description: true,
                status: true,
                screenshotData: true,
                url: true,
                browser: true,
                os: true,
                screen: true,
                createdAt: true,
                project: { 
                    select: { 
                        id: true, 
                        ownerId: true, 
                        name: true,
                        members: { where: { userId }, select: { id: true } }
                    } 
                },
                comments: { 
                    select: { id: true, message: true, createdAt: true, user: { select: { name: true } } }, 
                    orderBy: { createdAt: 'asc' } 
                },
                statusHistory: {
                    select: { id: true, fromStatus: true, toStatus: true, changedAt: true, user: { select: { id: true, name: true } } },
                    orderBy: { changedAt: 'asc' }
                }
            }
        });

        if (!bug) return res.status(404).json({ error: 'Bug not found' });

        // Combined authorization check
        const isOwner = bug.project.ownerId === userId;
        const isMember = bug.project.members.length > 0;
        
        if (!isOwner && !isMember) return res.status(403).json({ error: 'Access denied' });

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

         const bug = await prisma.bug.findUnique({ 
             where: { id: bugId }, 
             select: { id: true, status: true, projectId: true, project: { select: { ownerId: true } } } 
         });
         
         if (!bug) return res.status(404).json({ error: 'Bug not found' });
         
         if (bug.project.ownerId !== userId) {
             const member = await prisma.projectMember.findFirst({ 
                 where: { projectId: bug.projectId, userId },
                 select: { id: true }
             });
             if (!member) return res.status(403).json({ error: 'Access denied' });
         }

         const [updatedBug] = await prisma.$transaction([
             prisma.bug.update({ 
                 where: { id: bugId }, 
                 data: { status },
                 select: { id: true, status: true }
             }),
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

        const bug = await prisma.bug.findUnique({ 
            where: { id: bugId }, 
            select: { id: true, projectId: true, project: { select: { ownerId: true } } } 
        });
        
        if (!bug) return res.status(404).json({ error: 'Bug not found' });
        
        if (bug.project.ownerId !== userId) {
            const member = await prisma.projectMember.findFirst({ 
                where: { projectId: bug.projectId, userId },
                select: { id: true }
            });
            if (!member) return res.status(403).json({ error: 'Access denied' });
        }

        const comment = await prisma.comment.create({
            data: {
                bugId,
                userId,
                message
            },
            select: { id: true, message: true, createdAt: true, user: { select: { name: true } } }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
