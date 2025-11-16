const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required(),
    mediaIds: Joi.array(),
    title: Joi.string().max(255),
  });

  return schema.validate(data);
};

module.exports = { validateCreatePost };