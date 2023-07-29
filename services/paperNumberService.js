const { PaperNumber } = require("../models/PaperNumberSheet");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { Sequelize } = require("sequelize");

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

const findDistinctPaperNumbers = async () => {
  try {
    // let paperNumbers = await PaperNumber.findAll({
    //   attributes: [
    //     [Sequelize.literal('DISTINCT "PaperNumber"."paperNumber"'), "PaperNumber.paperNumber"],
    //   ],
    // });

    // let paperNumbers = await PaperNumber.findAll({
    //   attributes: ["paperNumber"],
    //   distinct: true,
    // });

    // let paperNumbers = PaperNumber.aggregate("paperNumber", "DISTINCT", { plain: false });

    // let paperNumbers = await PaperNumber.findAll({
    //   attributes: ["paperNumber"],
    //   group: ["paperNumber"],
    // });

    let paperNumbers = await PaperNumber.findAll({ attributes: ["id", "paperNumber"] });

    return paperNumbers;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findPaperNumberByPk,
  findPaperNumber,
  updatePaperNumber,
  findDistinctPaperNumbers,
};
