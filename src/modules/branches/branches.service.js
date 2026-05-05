const repo = require('./branches.repository');

const notFound = () => Object.assign(new Error('Branch not found'), { statusCode: 404 });

const getAll = (organizationId) => repo.findAll(organizationId);

const getById = async (id, organizationId) => {
  const branch = await repo.findById(id, organizationId);
  if (!branch) throw notFound();
  return branch;
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
