const plansService = require('./plans.service');
const { success } = require('../../common/utils/response');
const { createPlanSchema, updatePlanSchema } = require('./plans.validation');

const getAll = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.branchId) filters.branchId = req.query.branchId;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    success(res, await plansService.getAll(req.user.organizationId, filters));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    success(res, await plansService.getById(req.params.id, req.user.organizationId));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const plan = await plansService.create(createPlanSchema.parse(req.body), req.user.organizationId);
    success(res, plan, 'Plan created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const plan = await plansService.update(req.params.id, updatePlanSchema.parse(req.body), req.user.organizationId);
    success(res, plan, 'Plan updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await plansService.remove(req.params.id, req.user.organizationId);
    success(res, null, 'Plan deactivated');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
