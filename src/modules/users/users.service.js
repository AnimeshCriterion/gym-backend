const bcrypt = require('bcrypt');
const repo = require('./users.repository');

const notFound = () => Object.assign(new Error('User not found'), { statusCode: 404 });

const getAll = async (organizationId, filters, page, limit) => {
  const [users, total] = await repo.findAll(organizationId, filters, page, limit);
  return { users, total, page, limit };
};

const getById = async (id, organizationId) => {
  const user = await repo.findById(id, organizationId);
  if (!user) throw notFound();
  return user;
};

const create = async (data, organizationId) => {
  if (await repo.findByEmail(data.email)) {
    throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  }
  const { password, ...rest } = data;
  const passwordHash = await bcrypt.hash(password, 12);
  return repo.create({ ...rest, passwordHash, organizationId });
};

const update = async (id, data, organizationId) => {
  await getById(id, organizationId);
  return repo.update(id, data);
};

const remove = async (id, organizationId) => {
  await getById(id, organizationId);
  return repo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
