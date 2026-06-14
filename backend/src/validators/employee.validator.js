const Joi = require('joi');

const departmentSchema = Joi.object({
    department_name: Joi.string().min(2).max(100).required()
});

const skillSchema = Joi.object({
    skill_name: Joi.string().min(1).max(100).required()
});

const employeeProfileSchema = Joi.object({
    phone: Joi.string().regex(/^\+?[0-9\s\-]{8,20}$/).allow('', null),
    address: Joi.string().max(500).allow('', null),
    designation: Joi.string().max(100).allow('', null),
    salary: Joi.number().min(0).allow(null),
    department_id: Joi.number().integer().allow(null),
    skills: Joi.array().items(Joi.number().integer()).allow(null)
});

module.exports = {
    departmentSchema,
    skillSchema,
    employeeProfileSchema
};
