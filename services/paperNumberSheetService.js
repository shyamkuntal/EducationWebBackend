const { PaperNumberSheet } = require("../models/PaperNumber");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const findPaperNumberSheetByPk = async (pk) => {
  try {
    let sheet = await PaperNumberSheet.findByPk(pk);

    return sheet;
  } catch (err) {
    throw err;
  }
};

const updatePNSheetStatusForSupervisorAndReviewer = async (
  sheetId,
  statusForSupervisor,
  statusForReviewer
) => {
  try {
    let updateStatus = await PaperNumberSheet.update(
      {
        statusForSupervisor: statusForSupervisor,
        statusForReviewer: statusForReviewer,
      },
      { where: { id: sheetId } }
    );

    return updateStatus;
  } catch (err) {
    throw err;
  }
};

module.exports = { findPaperNumberSheetByPk, updatePNSheetStatusForSupervisorAndReviewer };
