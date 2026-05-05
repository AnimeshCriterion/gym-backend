const repo = require('./plans.repository');

const notFound = () => Object.assign(new Error('Plan not found'), { statusCode: 404 });

const getAll = (organizationId, filters) => repo.findAll(organizationId, filters);

const getById = async (id, organizationId) => {
  const plan = await repo.findById(id, organizationId);
  if (!plan) throw notFound();
  return plan;
};

const create = (data, organizationId) => repo.create({ ...data, organizationId });

const update = async (id, data, organizationId) => {
  await getById(id, organizationId);
  return repo.update(id, data);
};

const remove = async (id, organizationId) => {
  await getById(id, organizationId);
  return repo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
