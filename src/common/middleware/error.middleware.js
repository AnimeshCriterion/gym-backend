const { error } = require('../utils/response');

const notFound = (req, res) => error(res, `Route ${req.originalUrl} not found`, 404);

const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return error(res, 'Validation failed', 400, err.issues);
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return error(res, `Duplicate value for ${field}`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404);
  }

  error(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

module.exports = { notFound, globalErrorHandler };
