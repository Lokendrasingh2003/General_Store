/**
 * Security Middleware
 * Handles input sanitization, XSS prevention, and injection prevention
 */

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const DOMPurify = require('isomorphic-dompurify');
const { log } = require('../utils/logger');

/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by cleaning HTML/JavaScript
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    log.error('Input sanitization error', error, { path: req.path });
    next(error);
  }
};

/**
 * Recursively sanitize object values
 * @param {*} obj - Object to sanitize
 * @returns {*} Sanitized object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    // Sanitize string values to remove HTML/JS
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] });
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * MongoDB Injection Prevention Middleware
 * Prevents NoSQL injection attacks
 */
const preventMongoInjection = mongoSanitize({
  onSanitize: ({ req, key }) => {
    log.warn('Potential MongoDB injection attempt detected', {
      key,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }
});

/**
 * XSS Prevention Middleware
 * Additional XSS protection layer
 */
const preventXSS = xss();

/**
 * Validate email format
 * Prevents invalid email injection
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * Prevents URL injection
 */
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Prevents NoSQL Query Operator Injection
 * Blocks common MongoDB operators in user input
 */
const preventQueryOperatorInjection = (req, res, next) => {
  const blacklistedOperators = [
    '$ne',
    '$gt',
    '$gte',
    '$lt',
    '$lte',
    '$in',
    '$nin',
    '$and',
    '$or',
    '$not',
    '$nor',
    '$exists',
    '$type',
    '$regex',
    '$where',
    '$text',
    '$elemMatch',
    '$size',
    '$mod',
    '$geoWithin',
    '$geoIntersects'
  ];

  try {
    const checkObject = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        // Check if key starts with $ (MongoDB operator)
        if (key.startsWith('$')) {
          log.warn('MongoDB operator injection attempt detected', {
            operator: key,
            path: `${path}.${key}`,
            requestPath: req.path,
            method: req.method,
            ip: req.ip
          });

          throw new Error(`Invalid query operator: ${key}`);
        }

        // Recursively check nested objects
        if (typeof value === 'object' && value !== null) {
          checkObject(value, `${path}.${key}`);
        }
      }
    };

    checkObject(req.body);
    checkObject(req.query);

    next();
  } catch (error) {
    log.warn('Query operator injection blocked', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid request format',
      error: {
        code: 'INVALID_QUERY_OPERATOR',
        details: error.message
      }
    });
  }
};

/**
 * SQL Injection Prevention
 * Although using MongoDB, still prevent SQL patterns
 */
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\bselect\b|\bunion\b|\bwhere\b|\bor\b|\bdrop\b|\binsert\b|\bupdate\b|\bdelete\b|\bexec\b|\bexecute\b)/gi,
    /(\bscript\b|\bonload\b|\bonerror\b)/gi  // Also catch JS
  ];

  try {
    const checkForSQLPatterns = (str) => {
      if (typeof str !== 'string') return;

      for (const pattern of sqlPatterns) {
        // Only flag if multiple SQL keywords present or raw SQL attempts
        const matches = str.match(pattern) || [];
        if (matches.length > 2) {
          log.warn('Potential SQL injection attempt detected', {
            content: str.substring(0, 100),
            path: req.path,
            ip: req.ip
          });

          throw new Error('Invalid input format');
        }
      }
    };

    const checkObject = (obj) => {
      if (typeof obj === 'string') {
        checkForSQLPatterns(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        for (const value of Object.values(obj)) {
          checkObject(value);
        }
      }
    };

    checkObject(req.body);
    checkObject(req.query);

    next();
  } catch (error) {
    log.warn('SQL injection pattern blocked', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid request format',
      error: {
        code: 'INVALID_INPUT',
        details: 'Request contains prohibited patterns'
      }
    });
  }
};

/**
 * Path Traversal Prevention
 * Prevents directory traversal attacks (e.g., ../../etc/passwd)
 */
const preventPathTraversal = (req, res, next) => {
  const pathTraversalPattern = /\.\.[\/\\]/;

  try {
    const checkForPathTraversal = (str) => {
      if (typeof str === 'string' && pathTraversalPattern.test(str)) {
        log.warn('Path traversal attempt detected', {
          path: str,
          requestPath: req.path,
          ip: req.ip
        });

        throw new Error('Invalid path');
      }
    };

    const checkObject = (obj) => {
      if (typeof obj === 'string') {
        checkForPathTraversal(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        for (const value of Object.values(obj)) {
          checkObject(value);
        }
      }
    };

    checkObject(req.params);
    checkObject(req.query);
    checkObject(req.body);

    next();
  } catch (error) {
    log.warn('Path traversal blocked', {
      error: error.message,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid request',
      error: {
        code: 'INVALID_PATH',
        details: 'Path traversal detected'
      }
    });
  }
};

/**
 * Rate Limit Error Handler
 * Logs rate limit violations
 */
const handleRateLimitError = (req, res) => {
  log.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent')
  });

  return res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit?.resetTime
    }
  });
};

/**
 * CORS Security Configuration
 */
const getCorsOptions = () => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    // Allowed origins
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        log.warn('CORS request from unauthorized origin', {
          origin,
          allowedOrigins
        });

        callback(new Error('Not allowed by CORS'));
      }
    },

    // Allowed methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],

    // Expose headers to client
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Has-More',
      'Retry-After'
    ],

    // Credentials
    credentials: true,

    // Preflight cache
    maxAge: 86400, // 24 hours

    // Vary header for caching
    preflightContinue: false
  };
};

module.exports = {
  sanitizeInput,
  preventMongoInjection,
  preventXSS,
  preventQueryOperatorInjection,
  preventSQLInjection,
  preventPathTraversal,
  handleRateLimitError,
  validateEmail,
  validateUrl,
  getCorsOptions,
  sanitizeObject
};
