const Joi = require("joi");

const CmsLoginSchema = Joi.object({
  roleId: Joi.string().guid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().required(),
});

const CmsSendResetPasswordEmailSchema = Joi.object({
  toEmail: Joi.string().email().required(),
});

const CmsResetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().required(),
});
   
module.exports = {
  CmsLoginSchema,
  CmsSendResetPasswordEmailSchema,
  CmsResetPasswordSchema,
};
