const prisma = require('../../config/db');

const findAll = (branchId, where = {}, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const filter = { branchId, ...where };
  return Promise.all([
    prisma.attendance.findMany({
      where: filter,
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { checkInAt: 'desc' },
    }),
    prisma.attendance.count({ where: filter }),
  ]);
};

const findUserHistory = (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    prisma.attendance.findMany({
      where: { userId },
      skip,
      take: limit,
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { checkInAt: 'desc' },
    }),
    prisma.attendance.count({ where: { userId } }),
  ]);
};

const findActiveCheckIn = (userId, branchId) =>
  prisma.attendance.findFirst({ where: { userId, branchId, checkOutAt: null }, orderBy: { checkInAt: 'desc' } });

const checkIn = (userId, branchId, notes) =>
  prisma.attendance.create({ data: { userId, branchId, notes } });

const checkOut = (id) =>
  prisma.attendance.update({ where: { id }, data: { checkOutAt: new Date() } });

module.exports = { findAll, findUserHistory, findActiveCheckIn, checkIn, checkOut };
