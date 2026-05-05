const paymentsService = require('./payments.service');
const { success, paginated } = require('../../common/utils/response');
const { createPaymentSchema, updateStatusSchema } = require('./payments.validation');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.method) filters.method = req.query.method;

    const { payments, total } = await paymentsService.getAll(req.user.organizationId, filters, page, limit);
    paginated(res, payments, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    success(res, await paymentsService.getById(req.params.id, req.user.organizationId));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const payment = await paymentsService.create(createPaymentSchema.parse(req.body), req.user.organizationId);
    success(res, payment, 'Payment recorded', 201);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const payment = await paymentsService.updateStatus(req.params.id, updateStatusSchema.parse(req.body), req.user.organizationId);
    success(res, payment, 'Payment status updated');
  } catch (err) { next(err); }
};

const getRevenueSummary = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(1));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    success(res, await paymentsService.getRevenueSummary(req.user.organizationId, startDate, endDate));
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStatus, getRevenueSummary };
