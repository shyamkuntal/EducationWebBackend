const { PastPaper } = require("../models/PastPaper");

const createPastPaper = async (
  paperNumber,
  googleLink,
  imagebanner,
  answerPdf,
  questionPdf,
  sheetId,
) => {
  try {
    const pastPaper = await PastPaper.create({
        paperNumber,
        googleLink,
        imagebanner,
        answerPdf,
        questionPdf,
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
  