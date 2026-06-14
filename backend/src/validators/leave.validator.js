const Joi = require('joi');

const applyLeaveSchema = Joi.object({
    leave_type_id: Joi.number().integer().required(),
    from_date: Joi.date().iso().required(),
    to_date: Joi.date().iso().greater(Joi.ref('from_date')).required(),
    reason: Joi.string().min(5).max(1000).required()
});

const reviewLeaveSchema = Joi.object({
    status: Joi.string().valid('Approved by Manager', 'Approved', 'Rejected').required(),
    remarks: Joi.string().max(500).allow('', null)
});

module.exports = {
    applyLeaveSchema,
    reviewLeaveSchema
};
