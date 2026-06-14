const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const getMyNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [total, records] = await prisma.$transaction([
            prisma.notifications.count({ where: { user_id: req.user.id } }),
            prisma.notifications.findMany({
                where: { user_id: req.user.id },
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

const markAsRead = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const notification = await prisma.notifications.findUnique({
            where: { id }
        });

        if (!notification) {
            return next(new AppError('Notification not found.', 404));
        }

        if (notification.user_id !== req.user.id) {
            return next(new AppError('Unauthorized.', 403));
        }

        const updated = await prisma.notifications.update({
            where: { id },
            data: { is_read: true }
        });

        res.status(200).json({ status: 'success', data: updated });
    } catch (err) {
        next(err);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notifications.updateMany({
            where: { user_id: req.user.id, is_read: false },
            data: { is_read: true }
        });

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read.'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
