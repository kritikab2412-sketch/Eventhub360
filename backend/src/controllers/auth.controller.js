const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const sendEmail = require('../utils/mailer');
const logger = require('../utils/logger');

const signToken = (id, secret, expiresIn) => {
    return jwt.sign({ id }, secret, { expiresIn });
};

const signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { email }
        });
        if (existingUser) {
            return next(new AppError('Email already registered', 400));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create User
        // Prisma transaction to create user and empty employee profile (defaults)
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    verified: false,
                    verification_token: verificationToken
                }
            });
            
            // Create empty profile
            await tx.employee_profiles.create({
                data: {
                    user_id: user.id,
                    address: '',
                    phone: '',
                    designation: 'Trainee',
                    salary: 0
                }
            });
            
            return user;
        });

        // Send verification email
        const verifyUrl = `http://localhost:3000/verify/${verificationToken}`;
        const message = `Welcome to i-SOFTZONE. Please verify your email by clicking the link: ${verifyUrl}`;
        const html = `
            <h3>Email Verification</h3>
            <p>Welcome, ${name}! Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" style="background:#4285f4; color:#fff; padding:10px 15px; text-decoration:none; border-radius:5px;">Activate Account</a>
        `;
        
        try {
            await sendEmail({
                email,
                subject: 'Activate Your Account - Enterprise Portal',
                message,
                html
            });
        } catch (mailErr) {
            logger.error(`Failed to send verification email: ${mailErr.message}`);
        }

        res.status(201).json({
            status: 'success',
            message: 'Registration successful! Please check your email to verify your account.'
        });
    } catch (err) {
        next(err);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await prisma.users.findFirst({
            where: { verification_token: token }
        });

        if (!user) {
            return next(new AppError('Invalid or expired verification token.', 400));
        }

        // Update user to verified
        await prisma.users.update({
            where: { id: user.id },
            data: {
                verified: true,
                verification_token: null
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Your email has been verified! You can now log in.'
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Incorrect email or password.', 401));
        }

        // Check verification
        if (!user.verified) {
            return next(new AppError('Your account has not been verified yet. Please check your email.', 403));
        }

        // Generate Tokens
        const accessToken = signToken(user.id, process.env.JWT_SECRET, '15m');
        const refreshToken = signToken(user.id, process.env.JWT_REFRESH_SECRET, '30d');

        // Save refresh token to DB
        await prisma.users.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken }
        });

        res.status(200).json({
            status: 'success',
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return next(new AppError('Refresh token is required.', 400));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Find user
        const user = await prisma.users.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.refresh_token !== token) {
            return next(new AppError('Invalid refresh token.', 401));
        }

        // Issue new tokens
        const newAccessToken = signToken(user.id, process.env.JWT_SECRET, '15m');
        const newRefreshToken = signToken(user.id, process.env.JWT_REFRESH_SECRET, '30d');

        // Update DB
        await prisma.users.update({
            where: { id: user.id },
            data: { refresh_token: newRefreshToken }
        });

        res.status(200).json({
            status: 'success',
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        next(new AppError('Invalid or expired refresh token. Please login again.', 401));
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return next(new AppError('No user found with that email address.', 404));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Save token to DB
        await prisma.password_reset.create({
            data: {
                user_id: user.id,
                token: resetToken,
                expires_at: expiresAt
            }
        });

        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Please click on the link to reset your password. It will expire in 15 minutes: ${resetUrl}`;
        const html = `
            <h3>Reset Password</h3>
            <p>You requested a password reset. Click the button below to reset it:</p>
            <a href="${resetUrl}" style="background:#ff5959; color:#fff; padding:10px 15px; text-decoration:none; border-radius:5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email,
                subject: 'Password Reset Request',
                message,
                html
            });
        } catch (mailErr) {
            logger.error(`Failed to send password reset email: ${mailErr.message}`);
        }

        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to your email.'
        });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const record = await prisma.password_reset.findFirst({
            where: {
                token,
                expires_at: { gt: new Date() }
            }
        });

        if (!record) {
            return next(new AppError('Invalid or expired reset token.', 400));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and delete reset record
        await prisma.$transaction([
            prisma.users.update({
                where: { id: record.user_id },
                data: { password: hashedPassword }
            }),
            prisma.password_reset.delete({
                where: { id: record.id }
            })
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful! You can now log in with your new password.'
        });
    } catch (err) {
        next(err);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const profileSummary = await prisma.employee_summary.findFirst({
            where: { email: req.user.email }
        });
        
        if (!profileSummary) {
            return next(new AppError('Profile summary not found.', 404));
        }
        
        res.status(200).json({
            status: 'success',
            data: profileSummary
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signup,
    verifyEmail,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    getProfile
};
