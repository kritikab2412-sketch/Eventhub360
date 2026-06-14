const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
    getReportStats,
    exportEmployeesCSV,
    exportLeavesCSV,
    exportAssetsCSV,
    getAuditLogs
} = require('../controllers/report.controller');

// Dashboard statistics for reporting (HR, admin, manager)
router.get('/stats', protect, restrictTo('admin', 'hr', 'manager'), getReportStats);

// Report exports as CSV (HR and admin only)
router.get('/export/employees', protect, restrictTo('admin', 'hr'), exportEmployeesCSV);
router.get('/export/leaves', protect, restrictTo('admin', 'hr'), exportLeavesCSV);
router.get('/export/assets', protect, restrictTo('admin', 'hr'), exportAssetsCSV);

// Audit logs (Admin only)
router.get('/audit-logs', protect, restrictTo('admin'), getAuditLogs);

module.exports = router;
