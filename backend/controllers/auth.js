const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.userId;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const existing = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: { id: true, name: true, email: true, plan: true }
        });

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

exports.getProfileStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true, plan: true }
        });

        // Projects owned + shared
        const [ownedProjects, sharedMemberships] = await Promise.all([
            prisma.project.findMany({ where: { ownerId: userId }, select: { id: true, name: true, domain: true, createdAt: true } }),
            prisma.projectMember.findMany({ where: { userId }, include: { project: { select: { id: true, name: true, domain: true, createdAt: true } } } }),
        ]);

        const allProjectIds = [
            ...ownedProjects.map(p => p.id),
            ...sharedMemberships.map(m => m.projectId),
        ];

        // Bug stats across all accessible projects
        const [totalBugs, openBugs, resolvedBugs, closedBugs, inProgressBugs] = await Promise.all([
            prisma.bug.count({ where: { projectId: { in: allProjectIds } } }),
            prisma.bug.count({ where: { projectId: { in: allProjectIds }, status: 'Open' } }),
            prisma.bug.count({ where: { projectId: { in: allProjectIds }, status: 'Resolved' } }),
            prisma.bug.count({ where: { projectId: { in: allProjectIds }, status: 'Closed' } }),
            prisma.bug.count({ where: { projectId: { in: allProjectIds }, status: 'In Progress' } }),
        ]);

        // Status changes made by this user
        const statusChanges = await prisma.bugStatusHistory.count({ where: { userId } });
        const resolvedByUser = await prisma.bugStatusHistory.count({ where: { userId, toStatus: 'Resolved' } });

        // Comments made by this user
        const commentsMade = await prisma.comment.count({ where: { userId } });

        // Recent activity by this user
        const recentActivity = await prisma.bugStatusHistory.findMany({
            where: { userId },
            orderBy: { changedAt: 'desc' },
            take: 5,
            include: { bug: { select: { id: true, title: true } } }
        });

        // Per-project bug breakdown
        const projectBreakdown = await Promise.all(
            ownedProjects.map(async (p) => {
                const [total, open, resolved] = await Promise.all([
                    prisma.bug.count({ where: { projectId: p.id } }),
                    prisma.bug.count({ where: { projectId: p.id, status: 'Open' } }),
                    prisma.bug.count({ where: { projectId: p.id, status: 'Resolved' } }),
                ]);
                return { ...p, total, open, resolved, isOwner: true };
            })
        );
        const sharedBreakdown = await Promise.all(
            sharedMemberships.map(async (m) => {
                const p = m.project;
                const [total, open, resolved] = await Promise.all([
                    prisma.bug.count({ where: { projectId: p.id } }),
                    prisma.bug.count({ where: { projectId: p.id, status: 'Open' } }),
                    prisma.bug.count({ where: { projectId: p.id, status: 'Resolved' } }),
                ]);
                return { ...p, total, open, resolved, isOwner: false };
            })
        );

        const resolutionRate = totalBugs > 0 ? Math.round(((resolvedBugs + closedBugs) / totalBugs) * 100) : 0;

        const PLAN_LIMITS = require('../config/plans');
        const planName = user.plan || 'free';
        
        // Trial calculation
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const diffTime = now - createdAt;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const trialDaysRemaining = Math.max(0, 14 - diffDays);
        const isTrialExpired = planName === 'free' && diffDays >= 14;

        res.json({
            user,
            stats: { totalBugs, openBugs, resolvedBugs, closedBugs, inProgressBugs, statusChanges, resolvedByUser, commentsMade, resolutionRate },
            projects: [...projectBreakdown, ...sharedBreakdown],
            recentActivity,
            plan: {
              name: planName,
              limits: PLAN_LIMITS[planName],
              trial: {
                isExpired: isTrialExpired,
                daysRemaining: trialDaysRemaining,
              }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile stats' });
    }
};
