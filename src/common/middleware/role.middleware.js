const { error } = require('../utils/response');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401);
  if (!roles.includes(req.user.role)) return error(res, 'Forbidden: insufficient permissions', 403);
  next();
};

module.exports = { authorize };
