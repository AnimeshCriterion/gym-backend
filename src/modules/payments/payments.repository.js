const prisma = require('../../config/db');

const findAll = (organizationId, where = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const filter = { organizationId, ...where };
  return Promise.all([
    prisma.payment.findMany({
      where: filter,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { select: { id: true, status: true, plan: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where: filter }),
  ]);
};

const findById = (id, organizationId) =>
  prisma.payment.findFirst({ where: { id, organizationId }, include: { user: true, subscription: true } });

const create = (data) => prisma.payment.create({ data });

const update = (id, data) => prisma.payment.update({ where: { id }, data });

const getRevenueSummary = (organizationId, startDate, endDate) =>
  prisma.payment.aggregate({
    where: { organizationId, status: 'COMPLETED', paidAt: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    _count: true,
  });

module.exports = { findAll, findById, create, update, getRevenueSummary };
