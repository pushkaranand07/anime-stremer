const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors.map(e => ({
      field: e.path[0],
      message: e.message
    }));
    next(new ApiError(400, 'Validation Error', errors));
  }
};

module.exports = validate;
