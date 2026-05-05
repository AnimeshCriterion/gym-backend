const repo = require('./attendance.repository');

const getAll = async (branchId, filters, page, limit) => {
  const [attendances, total] = await repo.findAll(branchId, filters, page, limit);
  return { attendances, total, page, limit };
};

const getMyHistory = async (userId, page, limit) => {
  const [attendances, total] = await repo.findUserHistory(userId, page, limit);
  return { attendances, total, page, limit };
};

const checkIn = async (userId, branchId, notes) => {
  const existing = await repo.findActiveCheckIn(userId, branchId);
  if (existing) throw Object.assign(new Error('Already checked in — please check out first'), { statusCode: 400 });
  return repo.checkIn(userId, branchId, notes);
};

const checkOut = async (userId, branchId) => {
  const record = await repo.findActiveCheckIn(userId, branchId);
  if (!record) throw Object.assign(new Error('No active check-in found for this branch'), { statusCode: 400 });
  return repo.checkOut(record.id);
};

module.exports = { getAll, getMyHistory, checkIn, checkOut };
