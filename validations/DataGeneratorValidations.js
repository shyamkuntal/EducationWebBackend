const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const assignSheetToSupervisorSchema = Joi.object({
    paperNumberSheetId: Joi.string().guid().required(),
    dataGeneratorId: Joi.string().guid().required(),
});

  module.exports = {
    assignSheetToSupervisorSchema,
  };
  