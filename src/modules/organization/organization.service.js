const repo = require('./organization.repository');

const notFound = () => Object.assign(new Error('Organization not found'), { statusCode: 404 });

const getAll = async (page, limit) => {
  const [orgs, total] = await repo.findAll(page, limit);
  return { orgs, total, page, limit };
};

const getById = async (id) => {
  const org = await repo.findById(id);
  if (!org) throw notFound();
  return org;
};

const create = (data) => repo.create(data);

const update = async (id, data) => {
  await getById(id);
  return repo.update(id, data);
};

const remove = async (id) => {
  await getById(id);
  return repo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
