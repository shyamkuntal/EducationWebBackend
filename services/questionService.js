const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");

const createQuestion = async (dataToBeCreated,options) => {
  try {
    console.log(dataToBeCreated);
    let createQuestion = await Question.create(dataToBeCreated,options);

    return createQuestion;
  } catch (err) {
    throw err;
  }
};

module.exports = { createQuestion };
