const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const assignPaperNumberSheetToSupervisorSchema = Joi.object({
    paperNumberSheetId: Joi.string().guid().required(),
    dataGeneratorId: Joi.string().guid().required(),
});

const assignTopicTaskToSupervisorSchema = Joi.object({
    topicTaskId: Joi.string().guid().required(),
    dataGeneratorId: Joi.string().guid().required(),
});

  module.exports = {
    assignPaperNumberSheetToSupervisorSchema,
    assignTopicTaskToSupervisorSchema,
  };
  