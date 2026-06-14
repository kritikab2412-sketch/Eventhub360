const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// Get all assets with searching, filtering, and pagination
const getAssets = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const type = req.query.type || '';
        const status = req.query.status || '';

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (type) {
            whereClause.asset_type = type;
        }

        if (search) {
            whereClause.OR = [
                { asset_name: { contains: search, mode: 'insensitive' } },
                { asset_code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [total, records] = await prisma.$transaction([
            prisma.assets.count({ where: whereClause }),
            prisma.assets.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
                include: {
                    asset_allocations: {
                        where: { status: 'Active' },
                        include: {
                            employee_profiles: {
                                include: {
                                    users: {
                                        select: { name: true, email: true }
                                    }
                                }
                            }
                        }
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

// Get single asset details with logs & active allocations
const getAssetById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const asset = await prisma.assets.findUnique({
            where: { id },
            include: {
                asset_allocations: {
                    include: {
                        employee_profiles: {
                            include: {
                                users: {
                                    select: { name: true, email: true }
                                }
                            }
                        },
                        users: {
                            select: { name: true, role: true }
                        }
                    },
                    orderBy: { allocated_date: 'desc' }
                },
                asset_history: {
                    include: {
                        users: {
                            select: { name: true, role: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!asset) {
            return next(new AppError('Asset not found.', 404));
        }

        res.status(200).json({ status: 'success', data: asset });
    } catch (err) {
        next(err);
    }
};

// Create a new asset
const createAsset = async (req, res, next) => {
    try {
        const { asset_code, asset_name, asset_type, purchase_date, purchase_cost, status } = req.body;

        // Check if code exists
        const existing = await prisma.assets.findUnique({ where: { asset_code } });
        if (existing) {
            return next(new AppError('Asset code already exists.', 400));
        }

        const newAsset = await prisma.$transaction(async (tx) => {
            const asset = await tx.assets.create({
                data: {
                    asset_code,
                    asset_name,
                    asset_type,
                    purchase_date: purchase_date ? new Date(purchase_date) : null,
                    purchase_cost: purchase_cost ? parseFloat(purchase_cost) : null,
                    status: status || 'Available'
                }
            });

            // Log history
            await tx.asset_history.create({
                data: {
                    asset_id: asset.id,
                    action: 'Created',
                    remarks: `Asset registered in system with status: ${status || 'Available'}`,
                    created_by: req.user.id
                }
            });

            return asset;
        });

        res.status(201).json({ status: 'success', data: newAsset });
    } catch (err) {
        next(err);
    }
};

// Update asset details
const updateAsset = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { asset_code, asset_name, asset_type, purchase_date, purchase_cost, status } = req.body;

        const asset = await prisma.assets.findUnique({ where: { id } });
        if (!asset) {
            return next(new AppError('Asset not found.', 404));
        }

        // Check code uniqueness if changing
        if (asset_code && asset_code !== asset.asset_code) {
            const existing = await prisma.assets.findUnique({ where: { asset_code } });
            if (existing) {
                return next(new AppError('Asset code already exists.', 400));
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.assets.update({
                where: { id },
                data: {
                    asset_code: asset_code || undefined,
                    asset_name: asset_name || undefined,
                    asset_type: asset_type || undefined,
                    purchase_date: purchase_date ? new Date(purchase_date) : undefined,
                    purchase_cost: purchase_cost ? parseFloat(purchase_cost) : undefined,
                    status: status || undefined
                }
            });

            let remarksParts = [];
            if (status && status !== asset.status) {
                remarksParts.push(`status changed from ${asset.status} to ${status}`);
            }
            if (asset_name && asset_name !== asset.asset_name) {
                remarksParts.push(`name updated`);
            }

            await tx.asset_history.create({
                data: {
                    asset_id: id,
                    action: 'Updated',
                    remarks: remarksParts.length > 0 ? `Asset details updated: ${remarksParts.join(', ')}` : 'Asset metadata updated',
                    created_by: req.user.id
                }
            });

            return up;
        });

        res.status(200).json({ status: 'success', data: updated });
    } catch (err) {
        next(err);
    }
};

// Delete asset
const deleteAsset = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const asset = await prisma.assets.findUnique({
            where: { id },
            include: {
                asset_allocations: {
                    where: { status: 'Active' }
                }
            }
        });

        if (!asset) {
            return next(new AppError('Asset not found.', 404));
        }

        // Do not allow deleting if allocated
        if (asset.asset_allocations.length > 0) {
            return next(new AppError('Cannot delete asset. It is currently allocated to an employee.', 400));
        }

        await prisma.assets.delete({ where: { id } });

        res.status(200).json({
            status: 'success',
            message: 'Asset deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
};

// Allocate asset to an employee
const allocateAsset = async (req, res, next) => {
    try {
        const { asset_id, employee_id, remarks } = req.body;

        const asset = await prisma.assets.findUnique({ where: { id: asset_id } });
        if (!asset) {
            return next(new AppError('Asset not found.', 404));
        }

        if (asset.status !== 'Available') {
            return next(new AppError(`Asset is not available. Current status: ${asset.status}`, 400));
        }

        const employee = await prisma.employee_profiles.findUnique({
            where: { id: employee_id },
            include: { users: true }
        });
        if (!employee) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const allocation = await prisma.$transaction(async (tx) => {
            // Update asset status
            await tx.assets.update({
                where: { id: asset_id },
                data: { status: 'Allocated' }
            });

            // Create allocation
            const alloc = await tx.asset_allocations.create({
                data: {
                    asset_id,
                    employee_id,
                    allocated_by: req.user.id,
                    allocated_date: new Date(),
                    status: 'Active'
                }
            });

            // Log history
            await tx.asset_history.create({
                data: {
                    asset_id,
                    action: 'Assigned',
                    remarks: remarks || `Allocated to ${employee.users.name}`,
                    created_by: req.user.id
                }
            });

            // Send notification to employee
            await tx.notifications.create({
                data: {
                    user_id: employee.user_id,
                    title: 'Asset Allocated',
                    message: `A new asset (${asset.asset_name} - ${asset.asset_code}) has been allocated to you.`
                }
            });

            return alloc;
        });

        res.status(201).json({
            status: 'success',
            message: 'Asset allocated successfully.',
            data: allocation
        });
    } catch (err) {
        next(err);
    }
};

// Return asset
const returnAsset = async (req, res, next) => {
    try {
        const assetId = parseInt(req.params.id);
        const { status, remarks } = req.body; // status: Available, Damaged, Lost

        const asset = await prisma.assets.findUnique({ where: { id: assetId } });
        if (!asset) {
            return next(new AppError('Asset not found.', 404));
        }

        // Find active allocation
        const activeAllocation = await prisma.asset_allocations.findFirst({
            where: {
                asset_id: assetId,
                status: 'Active'
            },
            include: {
                employee_profiles: true
            }
        });

        if (!activeAllocation) {
            return next(new AppError('No active allocation found for this asset.', 404));
        }

        const returned = await prisma.$transaction(async (tx) => {
            // Update allocation
            await tx.asset_allocations.update({
                where: { id: activeAllocation.id },
                data: {
                    status: 'Returned',
                    return_date: new Date()
                }
            });

            // Update asset status
            const newStatus = status || 'Available';
            const updatedAsset = await tx.assets.update({
                where: { id: assetId },
                data: { status: newStatus }
            });

            // Log history
            await tx.asset_history.create({
                data: {
                    asset_id: assetId,
                    action: 'Returned',
                    remarks: remarks || `Returned. Condition: ${newStatus}`,
                    created_by: req.user.id
                }
            });

            // Notification for employee
            if (activeAllocation.employee_profiles && activeAllocation.employee_profiles.user_id) {
                await tx.notifications.create({
                    data: {
                        user_id: activeAllocation.employee_profiles.user_id,
                        title: 'Asset Returned',
                        message: `The asset (${asset.asset_name} - ${asset.asset_code}) has been marked as returned (${newStatus}).`
                    }
                });
            }

            return updatedAsset;
        });

        res.status(200).json({
            status: 'success',
            message: 'Asset marked as returned.',
            data: returned
        });
    } catch (err) {
        next(err);
    }
};

// Get assets allocated to current user
const getMyAssets = async (req, res, next) => {
    try {
        const profile = await prisma.employee_profiles.findUnique({
            where: { user_id: req.user.id }
        });

        if (!profile) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const allocations = await prisma.asset_allocations.findMany({
            where: {
                employee_id: profile.id,
                status: 'Active'
            },
            include: {
                assets: true
            }
        });

        res.status(200).json({
            status: 'success',
            data: allocations
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    allocateAsset,
    returnAsset,
    getMyAssets
};
