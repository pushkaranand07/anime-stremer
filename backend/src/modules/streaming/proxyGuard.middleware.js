const ApiError = require('../../utils/ApiError');

/**
 * Allowlisted hostname patterns for the proxy endpoint.
 * This is the permanent SSRF and open-proxy defense.
 * Update this list when integrating new streaming providers.
 */
const ALLOWED_HOSTNAME_PATTERNS = [
  // Anime streaming CDNs
  /\.hianime\./i,
  /\.animixplay\./i,
  /\.gogoanime\./i,
  /\.animekai\./i,
  /\.animepahe\./i,
  /\.crunchyroll\./i,
  /\.kickassanime\./i,
  // Generic CDN infrastructure
  /\.akamaized\.net$/i,
  /\.fastly\.net$/i,
  /\.cloudfront\.net$/i,
  /\.cdn\.net$/i,
  /\.biananset\.net$/i,
  /\.netmagcdn\.com$/i,
  /\.megacloud\.tv$/i,
  /\.rapid-cloud\./i,
];

/**
 * Private/internal IP ranges that must never be proxied (SSRF prevention).
 */
const BLOCKED_HOSTS = [
  '127.', '10.', '192.168.', '0.0.0.0',
  '169.254.', '::1', 'localhost',
  // 172.16.0.0 – 172.31.255.255
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.`),
];

/**
 * Middleware that validates proxy target URLs.
 * Prevents SSRF attacks and restricts the proxy to known CDN hostnames.
 * This replaces JWT auth on the proxy route — it's a whitelist, not an identity check.
 */
function proxyGuard(req, res, next) {
  const rawUrl = req.query.url;

  if (!rawUrl) {
    return next(new ApiError(400, 'url query parameter is required'));
  }

  let targetUrl;
  try {
    targetUrl = new URL(decodeURIComponent(rawUrl));
  } catch {
    return next(new ApiError(400, 'Invalid proxy URL format'));
  }

  // Only allow HTTP(S) protocols
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return next(new ApiError(403, `Protocol not allowed: ${targetUrl.protocol}`));
  }

  const hostname = targetUrl.hostname.toLowerCase();

  // Block private/internal IPs
  const isBlocked = BLOCKED_HOSTS.some(prefix =>
    hostname.startsWith(prefix) || hostname === prefix.replace(/\.$/, '')
  );
  if (isBlocked) {
    return next(new ApiError(403, 'Proxying internal addresses is not permitted'));
  }

  // Allow only known CDN hostnames
  const isAllowed = ALLOWED_HOSTNAME_PATTERNS.some(pattern => pattern.test(hostname));
  if (!isAllowed) {
    return next(new ApiError(403, `Proxy target not in allowlist: ${hostname}`));
  }

  next();
}

module.exports = { proxyGuard };
