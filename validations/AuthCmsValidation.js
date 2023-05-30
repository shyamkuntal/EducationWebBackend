const Joi = require("joi");

const CmsLoginSchema = Joi.object({
  roleId: Joi.string().guid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().required(),
});

module.exports = { CmsLoginSchema };
