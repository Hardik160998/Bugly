const prisma = require('../lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ 
            where: { email },
            select: { id: true }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
            select: { id: true, name: true, email: true }
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.userId;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const existing = await prisma.user.findFirst({ 
            where: { email, NOT: { id: userId } },
            select: { id: true }
        });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: { id: true, name: true, email: true, plan: true }
        });

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
};

exports.getProfileStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [user, ownedProjects, sharedMemberships] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, createdAt: true, plan: true }
            }),
            prisma.project.findMany({ 
                where: { ownerId: userId }, 
                select: { id: true, name: true, domain: true, createdAt: true } 
            }),
            prisma.projectMember.findMany({ 
                where: { userId }, 
                select: { 
                    projectId: true, 
                    project: { select: { id: true, name: true, domain: true, createdAt: true } } 
                } 
            }),
        ]);

        const allProjectIds = [
            ...ownedProjects.map(p => p.id),
            ...sharedMemberships.map(m => m.projectId),
        ];

        // Optimized batch stats using groupBy
        const [bugSummary, userActivities, statusChangesCount, commentsCount] = await Promise.all([
            // Counts per project and per status in one go
            prisma.bug.groupBy({
                by: ['projectId', 'status'],
                where: { projectId: { in: allProjectIds } },
                _count: { id: true }
            }),
            // Recent activity limited
            prisma.bugStatusHistory.findMany({
                where: { userId },
                orderBy: { changedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    fromStatus: true,
                    toStatus: true,
                    changedAt: true,
                    bug: { select: { id: true, title: true } }
                }
            }),
            // Specific user counts
            prisma.bugStatusHistory.count({ where: { userId } }),
            prisma.comment.count({ where: { userId } })
        ]);

        // Process bugSummary efficiently in-memory
        const projectMap = {};
        const globalStats = { total: 0, open: 0, resolved: 0, closed: 0, inProgress: 0 };

        bugSummary.forEach(group => {
            const pid = group.projectId;
            const status = group.status;
            const count = group._count.id;

            if (!projectMap[pid]) projectMap[pid] = { total: 0, open: 0, resolved: 0 };
            projectMap[pid].total += count;
            if (status === 'Open') projectMap[pid].open = count;
            if (status === 'Resolved') projectMap[pid].resolved = count;

            globalStats.total += count;
            if (status === 'Open') globalStats.open += count;
            if (status === 'Resolved') globalStats.resolved += count;
            if (status === 'Closed') globalStats.closed += count;
            if (status === 'In Progress') globalStats.inProgress += count;
        });

        const projectBreakdown = ownedProjects.map(p => ({
            ...p,
            isOwner: true,
            total: projectMap[p.id]?.total || 0,
            open: projectMap[p.id]?.open || 0,
            resolved: projectMap[p.id]?.resolved || 0
        }));

        const sharedBreakdown = sharedMemberships.map(m => ({
            ...m.project,
            isOwner: false,
            total: projectMap[m.projectId]?.total || 0,
            open: projectMap[m.projectId]?.open || 0,
            resolved: projectMap[m.projectId]?.resolved || 0
        }));

        const resolutionRate = globalStats.total > 0 
            ? Math.round(((globalStats.resolved + globalStats.closed) / globalStats.total) * 100) 
            : 0;

        const PLAN_LIMITS = require('../config/plans');
        const planName = user.plan || 'free';
        
        const diffDays = Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const trialDaysRemaining = Math.max(0, 14 - diffDays);
        const isTrialExpired = planName === 'free' && diffDays >= 14;

        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59');
        res.json({
            user,
            stats: { 
                totalBugs: globalStats.total, 
                openBugs: globalStats.open, 
                resolvedBugs: globalStats.resolved, 
                closedBugs: globalStats.closed, 
                inProgressBugs: globalStats.inProgress, 
                statusChanges: statusChangesCount, 
                commentsMade: commentsCount, 
                resolutionRate 
            },
            projects: [...projectBreakdown, ...sharedBreakdown],
            recentActivity: userActivities,
            plan: {
              name: planName,
              limits: PLAN_LIMITS[planName],
              trial: { isExpired: isTrialExpired, daysRemaining: trialDaysRemaining }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile stats' });
    }
};
