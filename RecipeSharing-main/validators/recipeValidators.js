const Joi = require("joi");

const recipeCreateSchema = Joi.object({
  title: Joi.string().max(80).required(),
  description: Joi.string().max(400).allow("").optional(),
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).required(),
  steps: Joi.array().items(Joi.string().min(1)).min(1).required(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
  imageUrl: Joi.string().uri().allow("").optional(),
  isPublic: Joi.boolean().optional()
})
  .unknown(true);

const recipeUpdateSchema = Joi.object({
  title: Joi.string().max(80).optional(),
  description: Joi.string().max(400).allow("").optional(),
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  steps: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
  imageUrl: Joi.string().uri().allow("").optional(),
  isPublic: Joi.boolean().optional()
})
  .min(1)
  .unknown(true);

module.exports = { recipeCreateSchema, recipeUpdateSchema };
