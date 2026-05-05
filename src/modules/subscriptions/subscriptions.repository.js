const prisma = require('../../config/db');

const findAll = (organizationId, where = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const filter = { organizationId, ...where };
  return Promise.all([
    prisma.subscription.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        plan: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.count({ where: filter }),
  ]);
};

const findById = (id, organizationId) =>
  prisma.subscription.findFirst({
    where: { id, organizationId },
    include: { user: true, plan: true, branch: true, payments: true, renewalLogs: true },
  });

const findByUserId = (userId, organizationId) =>
  prisma.subscription.findMany({
    where: { userId, organizationId },
    include: { plan: true, branch: true, payments: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });

const findExpiredAutoRenewable = () =>
  prisma.subscription.findMany({
    where: { status: 'ACTIVE', autoRenew: true, endDate: { lte: new Date() } },
    include: { plan: true, user: { select: { id: true, organizationId: true } } },
  });

const findExpiredFrozen = () =>
  prisma.subscription.findMany({
    where: { status: 'FROZEN', freezeEnd: { lte: new Date() } },
  });

const create = (data) => prisma.subscription.create({ data });

const update = (id, data) => prisma.subscription.update({ where: { id }, data });

const createRenewalLog = (data) => prisma.subscriptionRenewalLog.create({ data });

module.exports = { findAll, findById, findByUserId, findExpiredAutoRenewable, findExpiredFrozen, create, update, createRenewalLog };
