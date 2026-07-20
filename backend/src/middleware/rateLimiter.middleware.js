import rateLimit from "express-rate-limit";

// Global Rate Limiter: Applies to all general API requests
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per 15 minutes
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false,  // Disable legacy headers
});

// Authentication Limiter: Strict limit for login & signup to secure against brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/signup requests per 15 minutes
  message: {
    message: "Too many authentication attempts from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message Limiter: Limits spamming chat messages (both direct and group)
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 message sends per minute
  message: {
    message: "You are sending messages too fast. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
