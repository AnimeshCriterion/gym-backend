const prisma = require('../../config/db');

const findAll = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    prisma.organization.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.organization.count(),
  ]);
};

const findById = (id) =>
  prisma.organization.findUnique({ where: { id }, include: { branches: true } });

const create = (data) => prisma.organization.create({ data });

const update = (id, data) => prisma.organization.update({ where: { id }, data });

const remove = (id) => prisma.organization.update({ where: { id }, data: { isActive: false } });

module.exports = { findAll, findById, create, update, remove };
