const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const logger = require('./utils/logger');
const prisma = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const setupCronJobs = require('./utils/cronJobs');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const leaveRoutes = require('./routes/leave.routes');
const assetRoutes = require('./routes/asset.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Centralized Health Check Endpoint
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: 'success',
            message: 'Server is healthy.',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (err) {
        logger.error(`Health check database failure: ${err.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Server health degraded: Database is unreachable.',
            error: err.message
        });
    }
});

// API Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);

// Fallback for 404 routes
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.originalUrl} not found.`
    });
});

//Centralized error handling middleware (must be mounted last)
app.use(errorHandler);

// Start the server and cron jobs
const server = app.listen(PORT, () => {
    logger.info(`Enterprise Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    setupCronJobs();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Closing HTTP server and database connections...');
    server.close(async () => {
        await prisma.$disconnect();
        logger.info('HTTP server and database connections closed.');
        process.exit(0);
    });
});

module.exports = app;
