const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
    applyLeaveSchema,
    reviewLeaveSchema
} = require('../validators/leave.validator');
const {
    getLeaveTypes,
    getMyLeaveBalances,
    applyLeave,
    getLeaveRequests,
    reviewLeave
} = require('../controllers/leave.controller');

// Leave types
router.get('/types', protect, getLeaveTypes);

// Leave balance for current employee
router.get('/balances', protect, getMyLeaveBalances);

// Apply for leave
router.post('/apply', protect, validate(applyLeaveSchema), applyLeave);

// List leave requests (filters based on role)
router.get('/requests', protect, getLeaveRequests);

// Approve / reject leave request
router.put('/review/:id', protect, restrictTo('admin', 'hr', 'manager'), validate(reviewLeaveSchema), reviewLeave);

module.exports = router;
