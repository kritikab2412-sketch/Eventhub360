const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// Get comprehensive dashboard charts data
const getReportStats = async (req, res, next) => {
    try {
        // 1. Department wise count
        const depts = await prisma.departments.findMany({
            include: {
                _count: {
                    select: { employee_profiles: true }
                }
            }
        });
        const departmentWiseCount = depts.map(d => ({
            department: d.department_name,
            count: d._count.employee_profiles
        }));

        // 2. Asset status distributions
        const assetGroups = await prisma.assets.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        const assetStatusCount = assetGroups.map(g => ({
            status: g.status,
            count: g._count.id
        }));

        // 3. Asset type distribution
        const assetTypes = await prisma.assets.groupBy({
            by: ['asset_type'],
            _count: { id: true }
        });
        const assetTypeCount = assetTypes.map(t => ({
            type: t.asset_type,
            count: t._count.id
        }));

        // 4. Leave applications monthly trends (last 12 months)
        const allLeaves = await prisma.leave_applications.findMany({
            select: {
                from_date: true,
                status: true
            }
        });
        const leaveTrend = {};
        allLeaves.forEach(l => {
            const date = new Date(l.from_date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!leaveTrend[key]) {
                leaveTrend[key] = { Pending: 0, Approved: 0, Rejected: 0 };
            }
            const status = l.status.includes('Approved') ? 'Approved' : l.status.includes('Rejected') ? 'Rejected' : 'Pending';
            leaveTrend[key][status] = (leaveTrend[key][status] || 0) + 1;
        });
        const leaveTrendData = Object.keys(leaveTrend).sort().map(k => ({
            month: k,
            ...leaveTrend[k]
        }));

        // 5. Monthly hiring trend (based on profile created_at)
        const allProfiles = await prisma.employee_profiles.findMany({
            select: { created_at: true }
        });
        const hiringTrend = {};
        allProfiles.forEach(p => {
            if (p.created_at) {
                const date = new Date(p.created_at);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                hiringTrend[key] = (hiringTrend[key] || 0) + 1;
            }
        });
        const hiringTrendData = Object.keys(hiringTrend).sort().map(k => ({
            month: k,
            count: hiringTrend[k]
        }));

        res.status(200).json({
            status: 'success',
            data: {
                departmentWiseCount,
                assetStatusCount,
                assetTypeCount,
                leaveTrendData,
                hiringTrendData
            }
        });
    } catch (err) {
        next(err);
    }
};

// Export employees as CSV
const exportEmployeesCSV = async (req, res, next) => {
    try {
        const data = await prisma.employee_summary.findMany();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=employees_report.csv');

        const csvRows = [];
        const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Phone', 'Salary'];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            csvRows.push([
                row.employee_id,
                `"${(row.name || '').replace(/"/g, '""')}"`,
                `"${(row.email || '').replace(/"/g, '""')}"`,
                row.role,
                `"${(row.department_name || '').replace(/"/g, '""')}"`,
                `"${(row.designation || '').replace(/"/g, '""')}"`,
                `"${(row.phone || '').replace(/"/g, '""')}"`,
                row.salary ? row.salary.toString() : '0'
            ].join(','));
        });

        res.status(200).send(csvRows.join('\n'));
    } catch (err) {
        next(err);
    }
};

// Export leaves as CSV
const exportLeavesCSV = async (req, res, next) => {
    try {
        const data = await prisma.leave_summary_view.findMany();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leaves_report.csv');

        const csvRows = [];
        const headers = ['Leave ID', 'Employee Name', 'Leave Type', 'From Date', 'To Date', 'Total Days', 'Status', 'Reason', 'Applied At'];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            csvRows.push([
                row.leave_id,
                `"${(row.employee_name || '').replace(/"/g, '""')}"`,
                `"${(row.leave_name || '').replace(/"/g, '""')}"`,
                row.from_date.toISOString().split('T')[0],
                row.to_date.toISOString().split('T')[0],
                row.total_days,
                row.status,
                `"${(row.reason || '').replace(/"/g, '""')}"`,
                row.created_at.toISOString()
            ].join(','));
        });

        res.status(200).send(csvRows.join('\n'));
    } catch (err) {
        next(err);
    }
};

// Export assets as CSV
const exportAssetsCSV = async (req, res, next) => {
    try {
        const data = await prisma.asset_summary_view.findMany();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=assets_report.csv');

        const csvRows = [];
        const headers = ['Asset ID', 'Asset Code', 'Asset Name', 'Asset Type', 'Status', 'Allocated To', 'Allocated Date', 'Return Date'];
        csvRows.push(headers.join(','));

        data.forEach(row => {
            csvRows.push([
                row.asset_id,
                `"${(row.asset_code || '').replace(/"/g, '""')}"`,
                `"${(row.asset_name || '').replace(/"/g, '""')}"`,
                `"${(row.asset_type || '').replace(/"/g, '""')}"`,
                row.asset_status,
                `"${(row.allocated_to_name || '').replace(/"/g, '""')}"`,
                row.allocated_date ? row.allocated_date.toISOString().split('T')[0] : '',
                row.return_date ? row.return_date.toISOString().split('T')[0] : ''
            ].join(','));
        });

        res.status(200).send(csvRows.join('\n'));
    } catch (err) {
        next(err);
    }
};

// Get audit logs (Admin only)
const getAuditLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [total, records] = await prisma.$transaction([
            prisma.audit_logs.count(),
            prisma.audit_logs.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
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

module.exports = {
    getReportStats,
    exportEmployeesCSV,
    exportLeavesCSV,
    exportAssetsCSV,
    getAuditLogs
};
