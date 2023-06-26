const { PastPaper } = require("../models/PastPaper");

const createPastPaper = async (
  paperNumber,
  googleLink,
  questionPdf,
  answerPdf,
  imagebanner,
  sheetId,
) => {
  try {
    const pastPaper = await PastPaper.create({
        paperNumber,
        googleLink,
        questionPdf,
        answerPdf,
        imagebanner,
        sheetId
    });

    return pastPaper;
  } catch (err) {
    throw err;
  }
};

module.exports = {
    createPastPaper,
  };
  