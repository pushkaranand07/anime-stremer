const ApiError = require('../utils/ApiError');

/**
 * Body validation middleware using Zod schemas.
 * Uses safeParse (idiomatic Zod) instead of parse + try/catch.
 * Sets req.body to the parsed/coerced data so controllers get clean input.
 */
const validate = (schema) => {
  if (!schema || typeof schema.safeParse !== 'function') {
    throw new Error('validate() called with an invalid schema. Check your imports.');
  }

  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data; // Use the parsed (coerced/trimmed) data going forward
      return next();
    }

    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return next(new ApiError(400, 'Validation failed', errors));
  };
};

/**
 * Query parameter validation middleware using Zod schemas.
 * Same pattern as validate() but operates on req.query.
 */
const validateQuery = (schema) => {
  if (!schema || typeof schema.safeParse !== 'function') {
    throw new Error('validateQuery() requires a Zod schema');
  }

  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (result.success) {
      req.query = result.data;
      return next();
    }

    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return next(new ApiError(400, 'Invalid query parameters', errors));
  };
};

module.exports = validate;
module.exports.validate = validate;
module.exports.validateQuery = validateQuery;
