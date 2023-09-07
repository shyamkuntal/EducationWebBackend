const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");

const createQuestion = async (dataToBeCreated) => {
  try {
    console.log(dataToBeCreated);
    let createQuestion = await Question.create(dataToBeCreated);

    return createQuestion;
  } catch (err) {
    throw err;
  }
};

module.exports = { createQuestion };
