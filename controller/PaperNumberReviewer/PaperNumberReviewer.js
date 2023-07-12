const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { updateSheetStatusSchema } = require("../../validations/PaperNumberReviewerValidations.js");
const CONSTANTS = require("../../constants/constants.js");

const PaperNumberReviewerController = {
  async UpdateInprogressSheetStatus(req, res, next) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.paperNumberSheetService.findPaperNumberSheetByPk(values.sheetId);
      console.log("=====>sheet", sheet);

      if (sheet) {
        let assignedTo = sheet.assignedToUserId;
        let lifeCycle = sheet.lifeCycle;
        let previousStatus = sheet.statusForReviewer;
        console.log("=================>", lifeCycle);

        // Checking if sheet is assigned to current reviewer

        if (assignedTo === values.reviewerId && lifeCycle === CONSTANTS.roleNames.Reviewer) {
          if (previousStatus !== CONSTANTS.sheetStatuses.InProgress) {
            let statusToBeUpdated = {
              statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
              statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
            };

            let updateInprogressStatus =
              await services.paperNumberSheetService.updatePNSheetStatusForSupervisorAndReviewer(
                sheet.id,
                statusToBeUpdated.statusForSupervisor,
                statusToBeUpdated.statusForReviewer
              );

            if (updateInprogressStatus.length > 0) {
              res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
            }
          } else {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Current sheet status is already Inprogress",
            });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Invalid reviewer id or sheet life cycle" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PaperNumberReviewerController;
