const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxProjects: 1,
    maxBugsPerMonth: 20,
    maxTeamMembers: 0,
  },
  starter: {
    name: 'Starter',
    maxProjects: 3,
    maxBugsPerMonth: 500,
    maxTeamMembers: 3,
  },
  pro: {
    name: 'Pro',
    maxProjects: 15,
    maxBugsPerMonth: Infinity,
    maxTeamMembers: 10,
  },
  agency: {
    name: 'Agency',
    maxProjects: Infinity,
    maxBugsPerMonth: Infinity,
    maxTeamMembers: Infinity,
  },
};

module.exports = PLAN_LIMITS;
