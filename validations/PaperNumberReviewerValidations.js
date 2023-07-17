const Joi = require("joi");

const updateSheetStatusSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const addErrorReportSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  comment: Joi.string().max(225).required(),
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

const addErrorToPaperNumbersSchema = Joi.object({
  paperNumberErrors: Joi.array().items(
    Joi.object({
      id: Joi.string().guid().required(),
      isError: Joi.boolean().required(),
      errorReport: Joi.string().max(225).required().allow(null),
    })
  ),
});

const addRecheckCommentSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  recheckComment: Joi.string().max(225).required(),
});

const submitSheetToSupervisorSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const getErrorReportFilesSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
});

const getRecheckingCommentsSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
});

module.exports = {
  submitSheetToSupervisorSchema,
  addErrorToPaperNumbersSchema,
  addRecheckCommentSchema,
  updateSheetStatusSchema,
  addErrorReportSchema,
  getRecheckingCommentsSchema,
  getErrorReportFilesSchema,
};
