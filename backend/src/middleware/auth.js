const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await prisma.users.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // Add user info to request
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified
        };
        
        next();
    } catch (err) {
        next(err);
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
