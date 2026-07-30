import rateLimit from 'express-rate-limit'

config = {
    windowMs: 1000 * 60,
    message: {
        error: "Too many requests. Please try again later."
    }
};

export const limiter = rateLimit(config);