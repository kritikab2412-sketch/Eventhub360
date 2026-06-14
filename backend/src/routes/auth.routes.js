const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require('../validators/auth.validator');
const {
    signup,
    verifyEmail,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    getProfile
} = require('../controllers/auth.controller');

router.post('/signup', validate(signupSchema), signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/profile', protect, getProfile);

module.exports = router;
