const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PLAN_LIMITS = require('../config/plans');

const TRIAL_DAYS = 14;

/**
 * Checks if a user's free trial has expired.
 */
function isTrialExpired(user) {
  if (user.plan && user.plan !== 'free') return false;
  
  const createdAt = new Date(user.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > TRIAL_DAYS;
}

/**
 * Checks if a user has reached their project limit.
 */
async function canCreateProject(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, createdAt: true }
  });
  
  if (!user) return false;
  
  // If free plan, check trial
  if ((!user.plan || user.plan === 'free') && isTrialExpired(user)) {
    return false;
  }

  const plan = user.plan || 'free';
  const limit = PLAN_LIMITS[plan].maxProjects;
  
  if (limit === Infinity) return true;
  
  const count = await prisma.project.count({
    where: { ownerId: userId }
  });
  
  return count < limit;
}

/**
 * Checks if a project owner has reached their team member limit for a specific project.
 */
async function canAddTeamMember(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: { select: { plan: true } } }
  });
  
  if (!project) return false;
  
  const plan = project.owner.plan || 'free';
  const limit = PLAN_LIMITS[plan].maxTeamMembers;
  
  if (limit === Infinity) return true;
  
  const count = await prisma.projectMember.count({
    where: { projectId }
  });
  
  // +1 because owner is not in ProjectMember but counts as a member? 
  // Actually usually owner is not counted in seats in some tools. 
  // Let's say maxTeamMembers is additional seats.
  
  return count < limit;
}

/**
 * Checks if a project has reached its monthly bug report limit.
 */
async function canCreateBug(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: { select: { plan: true } } }
  });
  
  if (!project) return false;
  
  const plan = project.owner.plan || 'free';
  const limit = PLAN_LIMITS[plan].maxBugsPerMonth;
  
  if (limit === Infinity) return true;
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const count = await prisma.bug.count({
    where: {
      projectId,
      createdAt: { gte: startOfMonth }
    }
  });
  
  return count < limit;
}

module.exports = {
  canCreateProject,
  canAddTeamMember,
  canCreateBug
};
