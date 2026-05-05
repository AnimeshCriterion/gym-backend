const morgan = require('morgan');

const httpLogger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = { httpLogger };
