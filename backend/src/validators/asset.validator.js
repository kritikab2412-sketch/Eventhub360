const Joi = require('joi');

const assetSchema = Joi.object({
    asset_code: Joi.string().max(50).required(),
    asset_name: Joi.string().max(200).required(),
    asset_type: Joi.string().max(100).required(),
    purchase_date: Joi.date().iso().allow(null, ''),
    purchase_cost: Joi.number().positive().allow(null, ''),
    status: Joi.string().valid('Available', 'Allocated', 'Damaged', 'Lost').default('Available')
});

const allocateAssetSchema = Joi.object({
    asset_id: Joi.number().integer().required(),
    employee_id: Joi.number().integer().required(),
    remarks: Joi.string().max(500).allow('', null)
});

const returnAssetSchema = Joi.object({
    status: Joi.string().valid('Available', 'Damaged', 'Lost').default('Available'),
    remarks: Joi.string().max(500).allow('', null)
});

module.exports = {
    assetSchema,
    allocateAssetSchema,
    returnAssetSchema
};
