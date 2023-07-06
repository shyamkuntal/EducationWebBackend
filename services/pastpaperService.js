const { PastPaper } = require("../models/PastPaper");

const createPastPaper = async (
  paperNumber,
  googleLink,
  questionPdf,
  answerPdf,
  imagebanner,
  sheetId
) => {
  try {
    const pastPaper = await PastPaper.create({
      paperNumber,
      googleLink,
      questionPdf,
      answerPdf,
      imagebanner,
      sheetId,
    });

    return pastPaper;
  } catch (err) {
    throw err;
  }
};

const updatePastPaper = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedPastPaper = await PastPaper.update(dataToBeUpdated, whereQuery);

    return updatedPastPaper;
  } catch (err) {
    throw err;
  }
};

const findPastPaper = async (whereQuery) => {
  try {
    let pastPaper = await PastPaper.findAll(whereQuery);

    return pastPaper;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createPastPaper,
  updatePastPaper,
  findPastPaper,
};
