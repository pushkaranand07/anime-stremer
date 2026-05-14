/**
 * sanitize.middleware.js
 *
 * Replaces express-mongo-sanitize.
 * Recursively strips keys that start with '$' or contain '.'
 * from req.body and req.params — these are NoSQL injection vectors.
 *
 * IMPORTANT: Only KEY sanitization is needed for NoSQL injection prevention.
 * String VALUES are left untouched — a value can legitimately start with '$'.
 */

function sanitizeObject(obj) {
  const clean = {};
  for (const key of Object.keys(obj)) {
    // Drop keys starting with $ or containing . (NoSQL injection vectors)
    if (key.startsWith('$') || key.includes('.')) continue;

    const val = obj[key];
    // Recursively sanitize nested objects (but NOT arrays of primitives)
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeObject(val);
    } else if (Array.isArray(val)) {
      clean[key] = val.map(v => (v && typeof v === 'object' && !Array.isArray(v)) ? sanitizeObject(v) : v);
    } else {
      clean[key] = val; // Leave string/number/boolean values untouched
    }
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

  // For req.query: sanitize keys only (drop dangerous ones)
  if (req.query && typeof req.query === 'object') {
    const cleanQuery = {};
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      cleanQuery[key] = req.query[key]; // Values left untouched
    }
    // Reassign sanitized query
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.query[key];
      }
    }
  }

  next();
}

module.exports = {
  mongoSanitize
};
