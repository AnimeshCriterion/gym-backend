const prisma = require('../../config/db');

const findAll = (organizationId) =>
  prisma.branch.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });

const findById = (id, organizationId) =>
  prisma.branch.findFirst({ where: { id, organizationId } });

const create = (data) => prisma.branch.create({ data });

const update = (id, data) => prisma.branch.update({ where: { id }, data });

const remove = (id) => prisma.branch.update({ where: { id }, data: { isActive: false } });

module.exports = { findAll, findById, create, update, remove };
