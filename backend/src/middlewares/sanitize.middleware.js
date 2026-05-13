/**
 * sanitize.middleware.js
 *
 * Replaces express-mongo-sanitize.
 * Recursively strips keys that start with '$' or contain '.'
 * from req.body and req.params — without touching req.query directly.
 * For req.query, we sanitize values only (keys are controlled by the URL router).
 */

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Remove $ prefix and dot notation from string values
    return value.replace(/^\$/, '').replace(/\./g, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
}

function sanitizeObject(obj) {
  const clean = {};
  for (const key of Object.keys(obj)) {
    // Drop keys starting with $ or containing . (NoSQL injection vectors)
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = sanitizeValue(obj[key]);
  }
  return clean;
}

function mongoSanitize(req, res, next) {
  // Sanitize body (safe to reassign — Express sets this as a writable property)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize params (also writable)
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  // For req.query: DO NOT reassign the object reference.
  // Instead sanitize values in-place, which is safe.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeValue(req.query[key]);
    }
  }

  next();
}

module.exports = {
  mongoSanitize
};
