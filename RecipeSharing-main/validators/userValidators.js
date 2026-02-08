const Joi = require("joi");

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional()
}).min(1);

module.exports = { updateProfileSchema };
