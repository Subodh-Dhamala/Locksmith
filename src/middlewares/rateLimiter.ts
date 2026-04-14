import rateLimit from 'express-rate-limit';

//strict -login + forgot password
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//loose limiter — general routes 
export const looseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: {
    status: 'error',
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});