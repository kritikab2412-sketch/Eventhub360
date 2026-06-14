const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    departmentSchema,
    skillSchema,
    employeeProfileSchema
} = require('../validators/employee.validator');
const {
    getDepartments,
    createDepartment,
    getSkills,
    createSkill,
    getEmployees,
    getEmployeeById,
    updateEmployeeProfile,
    deleteEmployee,
    uploadFiles,
    getDashboardStats
} = require('../controllers/employee.controller');

// Department Masters
router.get('/departments', protect, getDepartments);
router.post('/departments', protect, restrictTo('admin', 'hr'), validate(departmentSchema), createDepartment);

// Skill Masters
router.get('/skills', protect, getSkills);
router.post('/skills', protect, restrictTo('admin', 'hr'), validate(skillSchema), createSkill);

// Dashboard Statistics
router.get('/stats', protect, getDashboardStats);

// Employee CRUD
router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, restrictTo('admin', 'hr', 'manager'), validate(employeeProfileSchema), updateEmployeeProfile);
router.delete('/:id', protect, restrictTo('admin'), deleteEmployee);

// Image/Document upload
router.post('/:id/upload', protect, upload.array('files', 5), uploadFiles);

module.exports = router;
