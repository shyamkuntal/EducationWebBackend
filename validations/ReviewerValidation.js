const Joi = require("joi");

const getReviewerSheetsSchema = Joi.object({
    reviewerId: Joi.string().guid().required(),
});

const updateSheetStatusSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
});

const assignSupervisorUserToSheetSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
});

const reportErrorSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
    recheckComment: Joi.string().max(225).required(),
});

const getRecheckingComments = Joi.object({
    sheetId: Joi.string().guid().required(),
});

const updateInprogressTaskStatusSchema = Joi.object({
    sheetId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
});

const addErrorReportSchema = Joi.object({
    questionId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
    errorReport: Joi.string().max(225).required(),
    errorReportFile: Joi.object({
        fieldname: Joi.string(),
        originalname: Joi.string(),
        encoding: Joi.string(),
        mimetype: Joi.string(),
        buffer: Joi.any(),
        size: Joi.number(),
    }),
});


module.exports = {
    assignSupervisorUserToSheetSchema,
    updateSheetStatusSchema,
    reportErrorSchema,
    getRecheckingComments,
    getReviewerSheetsSchema,
    updateInprogressTaskStatusSchema,
    addErrorReportSchema
};
