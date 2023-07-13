const { PaperNumber } = require("../models/PaperNumber");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const findPaperNumberByPk = async (paperNumberId) => {
  try {
    let paperNUmber = PaperNumber.findByPk(paperNumberId);

    return paperNUmber;
  } catch (err) {
    throw err;
  }
};

const findPaperNumber = async (whereQuery) => {
  try {
    let paperNUmber = PaperNumber.findAll(whereQuery);

    return paperNUmber;
  } catch (err) {
    throw err;
  }
};

const updatePaperNumber = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedPaperNumber = await PaperNumber.update(dataToBeUpdated, whereQuery);

    return updatedPaperNumber;
  } catch (err) {
    throw err;
  }
};

module.exports = { findPaperNumberByPk, findPaperNumber, updatePaperNumber };
