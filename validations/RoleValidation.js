const Joi = require("joi");

const findRoleByNameSchema = Joi.object({
  roleName: Joi.string().max(50).required(),
});

module.exports = {
  findRoleByNameSchema,
};
