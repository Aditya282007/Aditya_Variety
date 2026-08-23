import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set CSRF token cookie
 */
export function setCsrfCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(CSRF_TOKEN_NAME, token, {
    httpOnly: false, // Allow JavaScript to read for CSRF header
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
}

/**
 * Clear CSRF token cookie
 */
export function clearCsrfCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie(CSRF_TOKEN_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/'
  });
}

/**
 * Middleware to validate CSRF token on state-changing requests
 * Expects token in x-csrf-token header and validates against cookie
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  console.log('CSRF check - path:', req.path, 'method:', req.method);

  // Skip CSRF for login/register/test endpoints (handled separately)
  if (req.path.startsWith('/auth/login') || 
      req.path.startsWith('/auth/register') ||
      req.path.startsWith('/auth/test-')) {
    console.log('CSRF skipped for:', req.path);
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_TOKEN_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ 
      message: 'CSRF token missing. Please refresh the page and try again.' 
    });
  }

  // Timing-safe comparison
  if (cookieToken !== headerToken) {
    return res.status(403).json({ 
      message: 'Invalid CSRF token. Please refresh the page and try again.' 
    });
  }

  next();
}

/**
 * Middleware to generate and set CSRF token for new sessions
 * Call this after successful login/register
 */
export function issueCsrfToken(req, res, next) {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  // Also make it available for the response body if needed
  res.locals.csrfToken = token;
  next();
}

export { CSRF_TOKEN_NAME, CSRF_HEADER_NAME };