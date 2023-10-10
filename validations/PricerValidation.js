const Joi = require("joi");

const getPricerSheetsSchema = Joi.object({
    pricerId: Joi.string().guid().required(),
});

const updateSheetStatusSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    pricerId: Joi.string().guid().required(),
});

const assignSupervisorUserToSheetSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    pricerId: Joi.string().guid().required(),
});

const reportErrorSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    pricerId: Joi.string().guid().required(),
    recheckComment: Joi.string().max(225).required(),
});

const getRecheckingComments = Joi.object({
    sheetId: Joi.string().guid().required(),
});

const updateInprogressTaskStatusSchema = Joi.object({
    topicTaskId: Joi.string().guid().required(),
    pricerId: Joi.string().guid().required(),
});

const updatePriceInQuestionSchema = Joi.object({
    priceForTeacher: Joi.number().required(),
    priceForStudent: Joi.number().required(),
    isCheckedByPricer: Joi.boolean().required()
});

module.exports = {
    assignSupervisorUserToSheetSchema,
    updateSheetStatusSchema,
    reportErrorSchema,
    getRecheckingComments,
    getPricerSheetsSchema,
    updateInprogressTaskStatusSchema,
    updatePriceInQuestionSchema
};
