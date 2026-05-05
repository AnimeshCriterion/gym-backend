const prisma = require('../../config/db');
const { PLATFORM_PLANS } = require('./platform.plans');

const getPlans = () => Object.values(PLATFORM_PLANS);

const getStatus = async (organizationId) => {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true, platformPlan: true, platformExpiresAt: true },
  });
  if (!org) throw Object.assign(new Error('Organization not found'), { statusCode: 404 });

  const plan = PLATFORM_PLANS[org.platformPlan];
  const now = new Date();
  const isActive = !org.platformExpiresAt || org.platformExpiresAt > now;
  const daysRemaining = org.platformExpiresAt
    ? Math.max(0, Math.ceil((org.platformExpiresAt - now) / 86400000))
    : null;

  return {
    organization: org.name,
    currentPlan: plan,
    platformExpiresAt: org.platformExpiresAt,
    isActive,
    daysRemaining,
    status: isActive ? 'ACTIVE' : 'EXPIRED',
  };
};

const subscribe = async (organizationId, planKey, transactionId) => {
  const plan = PLATFORM_PLANS[planKey];
  if (!plan || planKey === 'TRIAL') {
    throw Object.assign(new Error('Invalid plan. Choose BASIC or PRO'), { statusCode: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { platformExpiresAt: true, platformPlan: true },
  });

  // Extend from today or from current expiry (whichever is later) — rewards early renewal
  const base = org.platformExpiresAt && org.platformExpiresAt > new Date()
    ? org.platformExpiresAt
    : new Date();

  const newExpiry = new Date(base);
  newExpiry.setDate(newExpiry.getDate() + plan.durationDays);

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: { platformPlan: planKey, platformExpiresAt: newExpiry },
    select: { name: true, platformPlan: true, platformExpiresAt: true },
  });

  return {
    organization: updated.name,
    plan: PLATFORM_PLANS[updated.platformPlan],
    platformExpiresAt: updated.platformExpiresAt,
    transactionId: transactionId || null,
    message: `Subscribed to ${plan.name} until ${updated.platformExpiresAt.toDateString()}`,
  };
};

module.exports = { getPlans, getStatus, subscribe };
