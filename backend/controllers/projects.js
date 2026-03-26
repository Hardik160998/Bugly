const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { canCreateProject, canAddTeamMember } = require('../utils/planEnforcement');

// Helper: get all project IDs accessible by a user (owned + shared)
async function accessibleProjectIds(userId) {
    const [owned, memberships] = await Promise.all([
        prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } }),
        prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } }),
    ]);
    return [...new Set([...owned.map(p => p.id), ...memberships.map(m => m.projectId)])];
}

exports.createProject = async (req, res) => {
    try {
        const { name, domain } = req.body;
        const ownerId = req.user.userId;
        if (!name || !domain) return res.status(400).json({ error: 'Name and domain are required' });

        if (!(await canCreateProject(ownerId))) {
            return res.status(403).json({ error: 'Project limit reached for your current plan. Please upgrade.' });
        }

        const project = await prisma.project.create({ data: { name, domain, ownerId } });
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        const ids = await accessibleProjectIds(userId);
        const [projects, openCounts] = await Promise.all([
            prisma.project.findMany({
                where: { id: { in: ids } },
                include: {
                    _count: { select: { bugs: true } },
                    owner: { select: { id: true, name: true, email: true } },
                }
            }),
            prisma.bug.groupBy({
                by: ['projectId'],
                where: { projectId: { in: ids }, status: 'Open' },
                _count: { id: true },
            }),
        ]);
        const openMap = Object.fromEntries(openCounts.map(r => [r.projectId, r._count.id]));
        const result = projects.map(p => ({
            ...p,
            isOwner: p.ownerId === userId,
            _openCount: openMap[p.id] ?? 0,
        }));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const ids = await accessibleProjectIds(userId);
        if (!ids.includes(id)) return res.status(404).json({ error: 'Project not found' });
        const project = await prisma.project.findUnique({ where: { id } });
        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.userId;
        const project = await prisma.project.findFirst({ where: { id, ownerId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        await prisma.comment.deleteMany({ where: { bug: { projectId: id } } });
        await prisma.bug.deleteMany({ where: { projectId: id } });
        await prisma.projectMember.deleteMany({ where: { projectId: id } });
        await prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const projectIds = await accessibleProjectIds(userId);

        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true, domain: true, _count: { select: { bugs: true } } }
        });

        const [total, open, inProgress, resolved] = await Promise.all([
            prisma.bug.count({ where: { projectId: { in: projectIds } } }),
            prisma.bug.count({ where: { projectId: { in: projectIds }, status: 'Open' } }),
            prisma.bug.count({ where: { projectId: { in: projectIds }, status: 'In Progress' } }),
            prisma.bug.count({ where: { projectId: { in: projectIds }, status: 'Resolved' } }),
        ]);

        const recentBugs = await prisma.bug.findMany({
            where: { projectId: { in: projectIds } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, title: true, status: true, createdAt: true, project: { select: { name: true } } }
        });

        res.json({ total, open, inProgress, resolved, projects, recentBugs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// Share project with a user by email
exports.shareProject = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.userId;
        const { email } = req.body;

        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Only owner can share
        const project = await prisma.project.findFirst({ where: { id, ownerId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const targetUser = await prisma.user.findUnique({ where: { email } });
        if (!targetUser) return res.status(404).json({ error: 'No user found with that email' });

        if (targetUser.id === ownerId) return res.status(400).json({ error: 'You already own this project' });

        const isAlreadyMember = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId: id, userId: targetUser.id } }
        });

        if (!isAlreadyMember) {
            if (!(await canAddTeamMember(id))) {
                return res.status(403).json({ error: 'Team member limit reached for this project. Please upgrade your plan.' });
            }
        }

        await prisma.projectMember.upsert({
            where: { projectId_userId: { projectId: id, userId: targetUser.id } },
            update: {},
            create: { projectId: id, userId: targetUser.id },
        });

        res.json({ message: `Project shared with ${targetUser.name}`, user: { id: targetUser.id, name: targetUser.name, email: targetUser.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to share project' });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.userId;
        const project = await prisma.project.findFirst({ where: { id, ownerId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const members = await prisma.projectMember.findMany({
            where: { projectId: id },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'asc' },
        });

        res.json(members.map(m => m.user));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const ownerId = req.user.userId;
        const project = await prisma.project.findFirst({ where: { id, ownerId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        await prisma.projectMember.deleteMany({ where: { projectId: id, userId } });
        res.json({ message: 'Member removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
};
