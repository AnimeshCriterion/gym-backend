const orgService = require('./organization.service');
const { success, paginated } = require('../../common/utils/response');
const { createOrgSchema, updateOrgSchema } = require('./organization.validation');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { orgs, total } = await orgService.getAll(page, limit);
    paginated(res, orgs, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    success(res, await orgService.getById(req.params.id));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const org = await orgService.create(createOrgSchema.parse(req.body));
    success(res, org, 'Organization created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const org = await orgService.update(req.params.id, updateOrgSchema.parse(req.body));
    success(res, org, 'Organization updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await orgService.remove(req.params.id);
    success(res, null, 'Organization deactivated');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
