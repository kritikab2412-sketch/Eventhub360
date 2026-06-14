const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const getLeaveTypes = async (req, res, next) => {
    try {
        const types = await prisma.leave_types.findMany();
        res.status(200).json({ status: 'success', data: types });
    } catch (err) {
        next(err);
    }
};

const getMyLeaveBalances = async (req, res, next) => {
    try {
        // Find employee profile
        const profile = await prisma.employee_profiles.findUnique({
            where: { user_id: req.user.id }
        });
        
        if (!profile) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const balances = await prisma.leave_balance.findMany({
            where: { employee_id: profile.id },
            include: { leave_types: true }
        });

        res.status(200).json({ status: 'success', data: balances });
    } catch (err) {
        next(err);
    }
};

const applyLeave = async (req, res, next) => {
    try {
        const { leave_type_id, from_date, to_date, reason } = req.body;

        // Find employee profile
        const profile = await prisma.employee_profiles.findUnique({
            where: { user_id: req.user.id }
        });
        if (!profile) {
            return next(new AppError('Employee profile not found.', 404));
        }

        // Calculate total days
        const from = new Date(from_date);
        const to = new Date(to_date);
        const timeDiff = to.getTime() - from.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        if (totalDays <= 0) {
            return next(new AppError('Invalid date range selected.', 400));
        }

        // Check leave balance
        const balance = await prisma.leave_balance.findUnique({
            where: {
                employee_id_leave_type_id: {
                    employee_id: profile.id,
                    leave_type_id
                }
            }
        });

        if (!balance || balance.available_days < totalDays) {
            return next(new AppError(`Insufficient leave balance. Available: ${balance ? balance.available_days : 0} days. Required: ${totalDays} days.`, 400));
        }

        // Create application and approval history inside a transaction
        const application = await prisma.$transaction(async (tx) => {
            const app = await tx.leave_applications.create({
                data: {
                    employee_id: profile.id,
                    leave_type_id,
                    from_date: from,
                    to_date: to,
                    total_days: totalDays,
                    reason,
                    status: 'Pending'
                }
            });

            await tx.approval_history.create({
                data: {
                    leave_id: app.id,
                    approved_by: req.user.id,
                    action: 'Apply',
                    remarks: 'Applied by employee'
                }
            });

            // Trigger notification for managers and HR
            const managersAndHR = await tx.users.findMany({
                where: {
                    role: { in: ['manager', 'hr', 'admin'] }
                }
            });

            const notificationsData = managersAndHR.map(u => ({
                user_id: u.id,
                title: 'New Leave Application',
                message: `Employee ${req.user.name} applied for leave from ${from_date} to ${to_date}.`
            }));

            await tx.notifications.createMany({
                data: notificationsData
            });

            return app;
        });

        res.status(201).json({
            status: 'success',
            message: 'Leave application submitted successfully.',
            data: application
        });
    } catch (err) {
        next(err);
    }
};

const getLeaveRequests = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        // Role-based visibility
        if (req.user.role === 'employee') {
            const profile = await prisma.employee_profiles.findUnique({
                where: { user_id: req.user.id }
            });
            if (!profile) {
                return next(new AppError('Profile not found.', 404));
            }
            whereClause.employee_id = profile.id;
        } else if (req.user.role === 'manager') {
            // Manager sees profiles of their department
            const profile = await prisma.employee_profiles.findUnique({
                where: { user_id: req.user.id }
            });
            // If manager has department, filter leaves by department
            if (profile && profile.department_id) {
                whereClause.employee_profiles = {
                    department_id: profile.department_id
                };
            }
        }

        const [total, records] = await prisma.$transaction([
            prisma.leave_applications.count({ where: whereClause }),
            prisma.leave_applications.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    employee_profiles: {
                        include: {
                            users: {
                                select: { id: true, name: true, email: true }
                            },
                            departments: true
                        }
                    },
                    leave_types: true,
                    approval_history: {
                        include: {
                            users: {
                                select: { name: true, role: true }
                            }
                        },
                        orderBy: { created_at: 'desc' }
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

const reviewLeave = async (req, res, next) => {
    try {
        const leaveId = parseInt(req.params.id);
        const { status, remarks } = req.body;

        const application = await prisma.leave_applications.findUnique({
            where: { id: leaveId },
            include: {
                employee_profiles: {
                    include: { users: true }
                }
            }
        });

        if (!application) {
            return next(new AppError('Leave application not found.', 404));
        }

        // Validate workflow transitions
        // 1. Rejected can be set by Manager/HR/Admin.
        // 2. Approved by Manager can be set by Manager.
        // 3. Approved (final) can be set by HR or Admin.
        if (status === 'Approved by Manager' && req.user.role !== 'manager' && req.user.role !== 'admin') {
            return next(new AppError('Only managers can give initial department approval.', 403));
        }
        if (status === 'Approved' && req.user.role !== 'hr' && req.user.role !== 'admin') {
            return next(new AppError('Only HR or Admin can give final leave approval.', 403));
        }

        const reviewed = await prisma.$transaction(async (tx) => {
            // If final approval, deduct available leave days
            if (status === 'Approved' && application.status !== 'Approved') {
                const balance = await tx.leave_balance.findUnique({
                    where: {
                        employee_id_leave_type_id: {
                            employee_id: application.employee_id,
                            leave_type_id: application.leave_type_id
                        }
                    }
                });

                if (!balance || balance.available_days < application.total_days) {
                    throw new AppError('Insufficient leave balance for final approval.', 400);
                }

                // Deduct balance
                await tx.leave_balance.update({
                    where: { id: balance.id },
                    data: {
                        available_days: balance.available_days - application.total_days
                    }
                });
            }

            // Update status
            const updatedApp = await tx.leave_applications.update({
                where: { id: leaveId },
                data: { status }
            });

            // Write history log
            await tx.approval_history.create({
                data: {
                    leave_id: leaveId,
                    approved_by: req.user.id,
                    action: status,
                    remarks: remarks || `${status} by ${req.user.role}`
                }
            });

            // Create notification for employee
            await tx.notifications.create({
                data: {
                    user_id: application.employee_profiles.user_id,
                    title: `Leave Request ${status}`,
                    message: `Your leave request from ${application.from_date.toISOString().split('T')[0]} to ${application.to_date.toISOString().split('T')[0]} has been ${status.toLowerCase()}. Remarks: ${remarks || 'None'}`
                }
            });

            return updatedApp;
        });

        res.status(200).json({
            status: 'success',
            message: `Leave application status updated to ${status}.`,
            data: reviewed
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getLeaveTypes,
    getMyLeaveBalances,
    applyLeave,
    getLeaveRequests,
    reviewLeave
};
