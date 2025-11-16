const joi = require('joi');
const validateRegistration = (data) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().min(6).required(),
        email: joi.string().email().required()
    });
    return schema.validate(data);
}

module.exports = {
    validateRegistration
};