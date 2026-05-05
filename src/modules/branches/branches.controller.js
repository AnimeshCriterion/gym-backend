const branchesService = require('./branches.service');
const { success } = require('../../common/utils/response');
const { createBranchSchema, updateBranchSchema } = require('./branches.validation');

const getAll = async (req, res, next) => {
  try {
    success(res, await branchesService.getAll(req.user.organizationId));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    success(res, await branchesService.getById(req.params.id, req.user.organizationId));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const branch = await branchesService.create(createBranchSchema.parse(req.body), req.user.organizationId);
    success(res, branch, 'Branch created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const branch = await branchesService.update(req.params.id, updateBranchSchema.parse(req.body), req.user.organizationId);
    success(res, branch, 'Branch updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await branchesService.remove(req.params.id, req.user.organizationId);
    success(res, null, 'Branch deactivated');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
