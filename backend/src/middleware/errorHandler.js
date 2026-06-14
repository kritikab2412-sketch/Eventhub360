const logger = require('../utils/logger');

// Custom App Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log the error
    logger.error(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Handle Joi validation errors
    if (err.isJoi) {
        statusCode = 422;
        message = err.details ? err.details.map(d => d.message).join(', ') : err.message;
        return res.status(statusCode).json({
            status: 'fail',
            error: 'ValidationError',
            message
        });
    }

    // Handle Prisma specific errors (e.g. Unique constraint violation P2002)
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            statusCode = 400;
            const fields = err.meta ? err.meta.target : 'field';
            message = `Duplicate field value: Unique constraint failed on ${fields}`;
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        } else {
            statusCode = 400;
            message = `Database Error: ${err.message}`;
        }
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please log in again.';
    }

    res.status(statusCode).json({
        status: statusCode === 500 ? 'error' : 'fail',
        message
    });
};

module.exports = {
    AppError,
    errorHandler
};
