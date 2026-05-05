const attendanceService = require('./attendance.service');
const { success, paginated } = require('../../common/utils/response');

const requireBranchId = (req, next) => {
  const id = req.query.branchId || req.body.branchId || req.user.branchId;
  if (!id) { next(Object.assign(new Error('branchId is required'), { statusCode: 400 })); return null; }
  return id;
};

const getAll = async (req, res, next) => {
  try {
    const branchId = requireBranchId(req, next);
    if (!branchId) return;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {};
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.date) {
      const d = new Date(req.query.date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filters.checkInAt = { gte: d, lt: next };
    }

    const { attendances, total } = await attendanceService.getAll(branchId, filters, page, limit);
    paginated(res, attendances, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getMyHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { attendances, total } = await attendanceService.getMyHistory(req.user.id, page, limit);
    paginated(res, attendances, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const checkIn = async (req, res, next) => {
  try {
    const branchId = req.body.branchId || req.user.branchId;
    if (!branchId) return next(Object.assign(new Error('branchId is required'), { statusCode: 400 }));
    const record = await attendanceService.checkIn(req.user.id, branchId, req.body.notes);
    success(res, record, 'Checked in successfully', 201);
  } catch (err) { next(err); }
};

const checkOut = async (req, res, next) => {
  try {
    const branchId = req.body.branchId || req.user.branchId;
    if (!branchId) return next(Object.assign(new Error('branchId is required'), { statusCode: 400 }));
    const record = await attendanceService.checkOut(req.user.id, branchId);
    success(res, record, 'Checked out successfully');
  } catch (err) { next(err); }
};

module.exports = { getAll, getMyHistory, checkIn, checkOut };
