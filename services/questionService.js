const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");
const { generateFileName, s3Client } = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const httpStatus = require("http-status");

const createQuestion = async (dataToBeCreated,options) => {
  try {
    console.log(dataToBeCreated);
    let createQuestion = await Question.create(dataToBeCreated,options);

    return createQuestion;
  } catch (err) {
    throw err;
  }
};




























































async function uploadFile(fileObj) {
  try {
    const fileName = process.env.AWS_BUCKET_QUESTIONS_FILE_FOLDER + "/" + generateFileName(fileObj.originalname);

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

module.exports = { createQuestion, uploadFile };
