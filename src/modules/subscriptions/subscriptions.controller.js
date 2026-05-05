const subscriptionsService = require('./subscriptions.service');
const { success, paginated } = require('../../common/utils/response');
const { createSubscriptionSchema, freezeSchema, updateAutoRenewSchema } = require('./subscriptions.validation');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.branchId) filters.branchId = req.query.branchId;

    const { subscriptions, total } = await subscriptionsService.getAll(req.user.organizationId, filters, page, limit);
    paginated(res, subscriptions, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    success(res, await subscriptionsService.getById(req.params.id, req.user.organizationId));
  } catch (err) { next(err); }
};

const getMySubscriptions = async (req, res, next) => {
  try {
    success(res, await subscriptionsService.getMySubscriptions(req.user.id, req.user.organizationId));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const sub = await subscriptionsService.create(createSubscriptionSchema.parse(req.body), req.user.organizationId);
    success(res, sub, 'Subscription created', 201);
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    success(res, await subscriptionsService.cancel(req.params.id, req.user.organizationId), 'Subscription cancelled');
  } catch (err) { next(err); }
};

const freeze = async (req, res, next) => {
  try {
    const sub = await subscriptionsService.freeze(req.params.id, freezeSchema.parse(req.body), req.user.organizationId);
    success(res, sub, 'Subscription frozen');
  } catch (err) { next(err); }
};

const setAutoRenew = async (req, res, next) => {
  try {
    const { autoRenew } = updateAutoRenewSchema.parse(req.body);
    const sub = await subscriptionsService.setAutoRenew(req.params.id, autoRenew, req.user.organizationId);
    success(res, sub, `Auto-renew ${autoRenew ? 'enabled' : 'disabled'}`);
  } catch (err) { next(err); }
};

const unfreeze = async (req, res, next) => {
  try {
    const sub = await subscriptionsService.unfreeze(req.params.id, req.user.organizationId);
    success(res, sub, 'Subscription unfrozen');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getMySubscriptions, create, cancel, freeze, unfreeze, setAutoRenew };
