const CONSTANTS = require("../../constants/constants.js");
const httpStatus = require("http-status");
const { createSheetSchema } = require("../../validations/SheetManagementValidations.js");
const { SheetManagement } = require("../../models/SheetManagement.js");

const SheetManagementController = {
  async createSheet(req, res, next) {
    try {
      let values = await createSheetSchema.validateAsync(req.body);

      console.log(values);

      let sheet = await SheetManagement.create(values);

      res.status(httpStatus.OK).send(sheet);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SheetManagementController;
