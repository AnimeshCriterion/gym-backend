const repo = require('./payments.repository');

const notFound = () => Object.assign(new Error('Payment not found'), { statusCode: 404 });

const getAll = async (organizationId, filters, page, limit) => {
  const [payments, total] = await repo.findAll(organizationId, filters, page, limit);
  return { payments, total, page, limit };
};

const getById = async (id, organizationId) => {
  const payment = await repo.findById(id, organizationId);
  if (!payment) throw notFound();
  return payment;
};

const create = (data, organizationId) => repo.create({ ...data, organizationId });

const updateStatus = async (id, data, organizationId) => {
  await getById(id, organizationId);
  const update = { status: data.status };
  if (data.transactionId) update.transactionId = data.transactionId;
  if (data.status === 'COMPLETED') update.paidAt = data.paidAt || new Date();
  return repo.update(id, update);
};

const getRevenueSummary = async (organizationId, startDate, endDate) => {
  const result = await repo.getRevenueSummary(organizationId, startDate, endDate);
  return {
    totalRevenue: result._sum.amount || 0,
    totalTransactions: result._count,
    period: { startDate, endDate },
  };
};

module.exports = { getAll, getById, create, updateStatus, getRevenueSummary };
