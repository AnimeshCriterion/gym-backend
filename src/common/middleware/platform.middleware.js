const prisma = require('../../config/db');

// Roles that bypass platform billing (members/trainers use the app freely)
const EXEMPT_ROLES = ['SUPER_ADMIN', 'MEMBER', 'TRAINER'];

const requireActivePlatform = async (req, res, next) => {
  if (!req.user || EXEMPT_ROLES.includes(req.user.role)) return next();
  if (!req.user.organizationId) return next();

  const org = await prisma.organization.findUnique({
    where: { id: req.user.organizationId },
    select: { platformPlan: true, platformExpiresAt: true, isActive: true },
  });

  if (!org || !org.isActive) {
    return res.status(403).json({ success: false, message: 'Organization not found or inactive' });
  }

  if (org.platformExpiresAt && org.platformExpiresAt < new Date()) {
    return res.status(402).json({
      success: false,
      message: `Your ${org.platformPlan === 'TRIAL' ? 'free trial' : 'subscription'} has expired. Subscribe to continue using the platform.`,
      data: {
        expiredPlan: org.platformPlan,
        expiredAt: org.platformExpiresAt,
        subscribeAt: '/api/v1/platform/subscribe',
        viewPlansAt: '/api/v1/platform/plans',
      },
    });
  }

  next();
};

module.exports = { requireActivePlatform };
