const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
    assetSchema,
    allocateAssetSchema,
    returnAssetSchema
} = require('../validators/asset.validator');
const {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    allocateAsset,
    returnAsset,
    getMyAssets
} = require('../controllers/asset.controller');

// Get current user's allocated assets
router.get('/my', protect, getMyAssets);

// General assets listing and details (restricted to admin, hr, manager)
router.get('/', protect, restrictTo('admin', 'hr', 'manager'), getAssets);
router.get('/:id', protect, restrictTo('admin', 'hr', 'manager'), getAssetById);

// Asset CRUD
router.post('/', protect, restrictTo('admin', 'hr'), validate(assetSchema), createAsset);
router.put('/:id', protect, restrictTo('admin', 'hr'), validate(assetSchema), updateAsset);
router.delete('/:id', protect, restrictTo('admin'), deleteAsset);

// Allocations & Returns
router.post('/allocate', protect, restrictTo('admin', 'hr', 'manager'), validate(allocateAssetSchema), allocateAsset);
router.post('/:id/return', protect, restrictTo('admin', 'hr', 'manager'), validate(returnAssetSchema), returnAsset);

module.exports = router;
