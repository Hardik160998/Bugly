const prisma = require('../lib/db');
const { canCreateProject, canAddTeamMember } = require('../utils/planEnforcement');

// Helper: get all project IDs accessible by a user (owned + shared)
async function accessibleProjectIds(userId) {
    const [owned, memberships] = await Promise.all([
        prisma.project.findMany({ 
            where: { ownerId: userId }, 
            select: { id: true } 
        }),
        prisma.projectMember.findMany({ 
            where: { userId }, 
            select: { projectId: true } 
        }),
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

        const project = await prisma.project.create({ 
            data: { name, domain, ownerId },
            select: { id: true, name: true, domain: true }
        });
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Single optimized query using OR for ownership/membership and _count for efficiency
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ]
            },
            select: {
                id: true,
                name: true,
                domain: true,
                ownerId: true,
                createdAt: true,
                _count: { select: { bugs: true } },
                owner: { select: { id: true, name: true, email: true } },
                // Fetches a count of open bugs directly in the same query
                bugs: {
                    where: { status: 'Open' },
                    select: { id: true }
                }
            }
        });

        const result = projects.map(p => ({
            id: p.id,
            name: p.name,
            domain: p.domain,
            ownerId: p.ownerId,
            createdAt: p.createdAt,
            owner: p.owner,
            isOwner: p.ownerId === userId,
            _count: { bugs: p._count.bugs },
            _openCount: p.bugs.length,
        }));

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
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
        const project = await prisma.project.findUnique({ 
            where: { id },
            select: { id: true, name: true, domain: true, ownerId: true }
        });
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
        const project = await prisma.project.findFirst({ 
            where: { id, ownerId },
            select: { id: true }
        });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        
        // Multi-stage delete handled by Prisma transaction is safer/faster
        await prisma.$transaction([
            prisma.comment.deleteMany({ where: { bug: { projectId: id } } }),
            prisma.bug.deleteMany({ where: { projectId: id } }),
            prisma.projectMember.deleteMany({ where: { projectId: id } }),
            prisma.project.delete({ where: { id } }),
        ]);
        
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Define a reusable project accessibility filter
        const projectFilter = {
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } }
            ]
        };

        const [summary, projects, recentBugs] = await Promise.all([
            // Aggregated status counts across all accessible projects
            prisma.bug.groupBy({
                by: ['status'],
                where: { project: projectFilter },
                _count: { id: true }
            }),
            // Top 10 projects with bug counts
            prisma.project.findMany({
                where: projectFilter,
                select: { 
                    id: true, 
                    name: true, 
                    domain: true, 
                    _count: { select: { bugs: true } } 
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            // 5 most recent bug reports across projects
            prisma.bug.findMany({
                where: { project: projectFilter },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { 
                    id: true, 
                    title: true, 
                    status: true, 
                    createdAt: true, 
                    project: { select: { name: true } } 
                }
            })
        ]);

        const stats = {
            total: 0,
            open: 0,
            inProgress: 0,
            resolved: 0
        };

        summary.forEach(group => {
            const count = group._count.id;
            stats.total += count;
            if (group.status === 'Open') stats.open = count;
            if (group.status === 'In Progress') stats.inProgress = count;
            if (group.status === 'Resolved') stats.resolved = count;
        });

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json({ ...stats, projects, recentBugs });
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
