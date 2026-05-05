const prisma = require('../../config/db');

const findAll = (organizationId, where = {}) =>
  prisma.plan.findMany({ where: { organizationId, ...where }, orderBy: { createdAt: 'desc' } });

const findById = (id, organizationId) =>
  prisma.plan.findFirst({ where: { id, organizationId } });

const create = (data) => prisma.plan.create({ data });

const update = (id, data) => prisma.plan.update({ where: { id }, data });

const remove = (id) => prisma.plan.update({ where: { id }, data: { isActive: false } });

module.exports = { findAll, findById, create, update, remove };
