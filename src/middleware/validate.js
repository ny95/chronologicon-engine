const createError = require('http-errors');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(createError(400, 'Validation failed', { details: result.error.flatten() }));
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = { validate };
