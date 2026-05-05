const usersService = require('./users.service');
const { success, paginated } = require('../../common/utils/response');
const { createUserSchema, updateUserSchema } = require('./users.validation');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.branchId) filters.branchId = req.query.branchId;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.trainerId) filters.trainerId = req.query.trainerId;
    // Trainers can only see members assigned to them
    if (req.user.role === 'TRAINER') filters.trainerId = req.user.id;

    const { users, total } = await usersService.getAll(req.user.organizationId, filters, page, limit);
    paginated(res, users, { total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id, req.user.organizationId);
    if (req.user.role === 'TRAINER' && user.trainerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: not your member' });
    }
    success(res, user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const user = await usersService.create(createUserSchema.parse(req.body), req.user.organizationId);
    success(res, user, 'User created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await usersService.update(req.params.id, updateUserSchema.parse(req.body), req.user.organizationId);
    success(res, user, 'User updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await usersService.remove(req.params.id, req.user.organizationId);
    success(res, null, 'User deactivated');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
