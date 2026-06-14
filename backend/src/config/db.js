const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' }
    ]
});

// Log raw database queries via Winston
prisma.$on('query', (e) => {
    logger.info(`Prisma Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
});

module.exports = prisma;
