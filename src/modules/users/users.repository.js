const prisma = require('../../config/db');

const SAFE_SELECT = {
  id: true, name: true, email: true, phone: true, role: true,
  isActive: true, branchId: true, profilePicUrl: true,
  dateOfBirth: true, gender: true, address: true, emergencyContact: true,
  trainerId: true, createdAt: true, updatedAt: true,
  branch: { select: { id: true, name: true } },
};

const findAll = (organizationId, where = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const filter = { organizationId, ...where };
  return Promise.all([
    prisma.user.findMany({ where: filter, skip, take: limit, select: SAFE_SELECT, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where: filter }),
  ]);
};

const findById = (id, organizationId) =>
  prisma.user.findFirst({
    where: { id, organizationId },
    include: {
      branch: true,
      subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const create = (data) => prisma.user.create({ data, select: { ...SAFE_SELECT, passwordHash: false } });

const update = (id, data) => prisma.user.update({ where: { id }, data, select: SAFE_SELECT });

const remove = (id) => prisma.user.update({ where: { id }, data: { isActive: false }, select: SAFE_SELECT });

module.exports = { findAll, findById, findByEmail, create, update, remove };
