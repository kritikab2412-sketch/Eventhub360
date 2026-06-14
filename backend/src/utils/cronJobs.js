const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const logger = require('./logger');

const setupCronJobs = () => {
    // 1. Database Backup Job: runs every day at midnight (0 0 * * *)
    // For testing and demonstration, let's run it at midnight, and also log its setup.
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info('Starting scheduled database backup...');
            const backupDir = path.join(__dirname, '../../backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }

            // Fetch core data to back up as JSON
            const users = await prisma.users.findMany({
                select: { id: true, name: true, email: true, role: true }
            });
            const depts = await prisma.departments.findMany();
            const skills = await prisma.skills.findMany();

            const backupData = {
                timestamp: new Date().toISOString(),
                users,
                departments: depts,
                skills
            };

            const filename = `backup_${Date.now()}.json`;
            fs.writeFileSync(path.join(backupDir, filename), JSON.stringify(backupData, null, 2));
            logger.info(`Scheduled backup completed. Saved as ${filename}`);
        } catch (err) {
            logger.error(`Database backup failed: ${err.message}`);
        }
    });

    // 2. Pending Leaves Reminder Job: runs every morning at 8:00 AM (0 8 * * *)
    cron.schedule('0 8 * * *', async () => {
        try {
            logger.info('Running daily check for pending leaves...');
            const pendingCount = await prisma.leave_applications.count({
                where: { status: 'Pending' }
            });

            if (pendingCount > 0) {
                // Find all HRs and Admins
                const adminsAndHR = await prisma.users.findMany({
                    where: {
                        role: { in: ['admin', 'hr'] }
                    }
                });

                const notificationData = adminsAndHR.map(u => ({
                    user_id: u.id,
                    title: 'Daily Pending Leaves Reminder',
                    message: `System Alert: There are currently ${pendingCount} pending leave applications waiting for review.`
                }));

                await prisma.notifications.createMany({
                    data: notificationData
                });
                logger.info(`Daily leave notification sent to ${adminsAndHR.length} admin/HR users.`);
            }
        } catch (err) {
            logger.error(`Failed to execute daily leave reminder: ${err.message}`);
        }
    });

    logger.info('Cron jobs initialized successfully.');
};

module.exports = setupCronJobs;
