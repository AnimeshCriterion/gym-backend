const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { error } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access token required', 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Access token expired', 401);
    return error(res, 'Invalid access token', 401);
  }
};

module.exports = { authenticate };
