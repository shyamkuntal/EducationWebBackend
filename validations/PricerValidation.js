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

module.exports = {
    assignSupervisorUserToSheetSchema,
    updateSheetStatusSchema,
    reportErrorSchema,
    getRecheckingComments,
    getPricerSheetsSchema,
};
