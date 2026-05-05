const service = require('./platform.service');
const { success } = require('../../common/utils/response');
const { z } = require('zod');

const subscribeSchema = z.object({
  plan: z.enum(['BASIC', 'PRO']),
  transactionId: z.string().optional(),
});

const getPlans = (req, res) => success(res, service.getPlans(), 'Available platform plans');

const getStatus = async (req, res, next) => {
  try {
    success(res, await service.getStatus(req.user.organizationId), 'Platform status');
  } catch (err) { next(err); }
};

const subscribe = async (req, res, next) => {
  try {
    const { plan, transactionId } = subscribeSchema.parse(req.body);
    const result = await service.subscribe(req.user.organizationId, plan, transactionId);
    success(res, result, result.message);
  } catch (err) { next(err); }
};

module.exports = { getPlans, getStatus, subscribe };
