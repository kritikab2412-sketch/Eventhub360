const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { value, error } = schema.validate(req[source], {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        });

        if (error) {
            // Joi error is caught by errorHandler middleware
            return next(error);
        }

        // Replace request payload with sanitized, validated values
        req[source] = value;
        next();
    };
};

module.exports = validate;
