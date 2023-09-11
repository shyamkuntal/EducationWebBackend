const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");
const { FillTextDropDownOption } = require("../models/FillDropDownOption");
const { ApiError } = require("../middlewares/apiError");
const httpStatus = require("http-status");
const { generateFileName, s3Client } = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const db = require("../config/database");

const createQuestion = async (dataToBeCreated, options) => {
  try {
    console.log(dataToBeCreated);
    let createQuestion = await Question.create(dataToBeCreated, options);

    return createQuestion;
  } catch (err) {
    throw err;
  }
};

const checkFillDropDownOptions = async (questionId) => {
  try {
    let options = await FillTextDropDownOption.findAll({ where: { questionId }, raw: true });

    if (options.length > 10) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only 10 options allowed per question!");
    }
  } catch (err) {
    throw err;
  }
};

const getQuestionsDetailsById = async (questionId) => {
  try {
    let questionDetails = await Question.findOne({ where: { id: questionId }, raw: true });
    return questionDetails;
  } catch (err) {
    throw err;
  }
};
































async function uploadFile(fileObj) {
  try {
    const fileName = process.env.AWS_BUCKET_QUESTIONS_FILE_FOLDER + "/" + generateFileName(fileObj.filename);
    console.log(fileObj)
    const mimeType = fileObj.mimetype;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileObj.buffer,
      Key: fileName,
      ContentType: mimeType,
    };

    const fileUpload = await s3Client.send(new PutObjectCommand(uploadParams));

    if (fileUpload.$metadata.httpStatusCode === httpStatus.OK) {
      return fileName;
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}

async function updateQuestion(questionId, updatedData) {
  try {
   
    const question = await Question.findByPk(questionId);

    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }

    await question.update(updatedData);

    return question;
  } catch (err) {
    throw err;
  }
}

async function DeleteQues(questionId)  {

  const t = await db.transaction();
  try {
    const question = await Question.findByPk(questionId);
    if (!question) {
      await t.rollback();
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Question not found' });
    }

    await question.destroy({ transaction: t });

    await t.commit();

    res.status(httpStatus.OK).send("Question Deleted Successfully");
  } catch (err) {
    console.error(err);
    await t.rollback();
    next(err);
  }
}


module.exports = { createQuestion, checkFillDropDownOptions, getQuestionsDetailsById, uploadFile, DeleteQues, updateQuestion };
