const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

// === Department Controller ===
const getDepartments = async (req, res, next) => {
    try {
        const cachedDepts = cache.get('departments_list');
        if (cachedDepts) {
            return res.status(200).json({ status: 'success', data: cachedDepts });
        }
        
        const depts = await prisma.departments.findMany({
            orderBy: { department_name: 'asc' }
        });
        
        cache.set('departments_list', depts);
        res.status(200).json({ status: 'success', data: depts });
    } catch (err) {
        next(err);
    }
};

const createDepartment = async (req, res, next) => {
    try {
        const { department_name } = req.body;
        const newDept = await prisma.departments.create({
            data: { department_name }
        });
        cache.del('departments_list');
        res.status(201).json({ status: 'success', data: newDept });
    } catch (err) {
        next(err);
    }
};

// === Skills Controller ===
const getSkills = async (req, res, next) => {
    try {
        const cachedSkills = cache.get('skills_list');
        if (cachedSkills) {
            return res.status(200).json({ status: 'success', data: cachedSkills });
        }
        
        const skills = await prisma.skills.findMany({
            orderBy: { skill_name: 'asc' }
        });
        
        cache.set('skills_list', skills);
        res.status(200).json({ status: 'success', data: skills });
    } catch (err) {
        next(err);
    }
};

const createSkill = async (req, res, next) => {
    try {
        const { skill_name } = req.body;
        const newSkill = await prisma.skills.create({
            data: { skill_name }
        });
        cache.del('skills_list');
        res.status(201).json({ status: 'success', data: newSkill });
    } catch (err) {
        next(err);
    }
};

// === Employee Controller ===
const getEmployees = async (req, res, next) => {
    try {
        // Query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const deptId = req.query.department_id ? parseInt(req.query.department_id) : null;
        const sortBy = req.query.sortBy || 'name'; // 'name', 'salary', 'created_at'
        const sortOrder = req.query.sortOrder || 'asc'; // 'asc', 'desc'

        // Construct where clauses
        const whereClause = {
            users: {}
        };
        
        if (search) {
            whereClause.OR = [
                { designation: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { users: { name: { contains: search, mode: 'insensitive' } } },
                { users: { email: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (deptId) {
            whereClause.department_id = deptId;
        }

        // Sorting configuration
        let orderByClause = {};
        if (sortBy === 'name') {
            orderByClause = { users: { name: sortOrder } };
        } else if (sortBy === 'salary') {
            orderByClause = { salary: sortOrder };
        } else {
            orderByClause = { created_at: sortOrder };
        }

        // Fetch counts and records
        const [total, records] = await prisma.$transaction([
            prisma.employee_profiles.count({ where: whereClause }),
            prisma.employee_profiles.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: orderByClause,
                include: {
                    users: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    departments: true,
                    employee_skills: {
                        include: { skills: true }
                    }
                }
            })
        ]);

        res.status(200).json({
            status: 'success',
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: records
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const emp = await prisma.employee_profiles.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, name: true, email: true, role: true, verified: true }
                },
                departments: true,
                employee_images: true,
                employee_skills: {
                    include: { skills: true }
                }
            }
        });

        if (!emp) {
            return next(new AppError('Employee profile not found.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: emp
        });
    } catch (err) {
        next(err);
    }
};

const updateEmployeeProfile = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { phone, address, designation, salary, department_id, skills } = req.body;

        // Check if employee exists
        const emp = await prisma.employee_profiles.findUnique({
            where: { id }
        });
        if (!emp) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const updated = await prisma.$transaction(async (tx) => {
            // 1. Update basic profile
            const profile = await tx.employee_profiles.update({
                where: { id },
                data: {
                    phone,
                    address,
                    designation,
                    salary,
                    department_id
                }
            });

            // 2. Update skills list (Many-to-Many)
            if (skills !== undefined) {
                // Clear old skills
                await tx.employee_skills.deleteMany({
                    where: { employee_id: id }
                });

                // Add new skills links
                if (skills && skills.length > 0) {
                    const skillData = skills.map(sid => ({
                        employee_id: id,
                        skill_id: sid
                    }));
                    await tx.employee_skills.createMany({
                        data: skillData
                    });
                }
            }

            return profile;
        });

        res.status(200).json({
            status: 'success',
            message: 'Employee profile updated successfully.',
            data: updated
        });
    } catch (err) {
        next(err);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        const emp = await prisma.employee_profiles.findUnique({
            where: { id }
        });
        if (!emp) {
            return next(new AppError('Employee profile not found.', 404));
        }

        // Delete user (cascades profile deletion)
        await prisma.users.delete({
            where: { id: emp.user_id }
        });

        res.status(200).json({
            status: 'success',
            message: 'Employee deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
};

const uploadFiles = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        const emp = await prisma.employee_profiles.findUnique({
            where: { id }
        });
        if (!emp) {
            return next(new AppError('Employee profile not found.', 404));
        }

        if (!req.files || req.files.length === 0) {
            return next(new AppError('Please upload at least one file.', 400));
        }

        // Save uploaded files to employee_images table
        const fileRecords = req.files.map(file => ({
            employee_id: id,
            image_url: `/uploads/${file.filename}`,
            file_type: file.fieldname // e.g. 'profile_photo', 'resume'
        }));

        await prisma.employee_images.createMany({
            data: fileRecords
        });

        res.status(200).json({
            status: 'success',
            message: 'Files uploaded and attached to employee profile successfully.',
            files: fileRecords
        });
    } catch (err) {
        next(err);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const [empCount, deptCount, skillCount, imgCount, leaveCount] = await prisma.$transaction([
            prisma.employee_profiles.count(),
            prisma.departments.count(),
            prisma.skills.count(),
            prisma.employee_images.count(),
            prisma.leave_applications.count({ where: { status: 'Pending' } })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalEmployees: empCount,
                totalDepartments: deptCount,
                totalSkills: skillCount,
                totalUploadedImages: imgCount,
                pendingLeaves: leaveCount
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
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
};
