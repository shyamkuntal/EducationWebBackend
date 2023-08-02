const { PastPaper } = require("../models/PastPaper");
const CONSTANTS = require("../constants/constants");
const { s3Client } = require("../config/s3");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

const getFilesUrlFromS3 = async (fileName) => {
  try {
    let getFilesParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    const getFileCommand = new GetObjectCommand(getFilesParams);

    const fileUrl = await getSignedUrl(s3Client, getFileCommand, {
      expiresIn: 3600,
    });

    return fileUrl;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createPastPaper,
  updatePastPaper,
  findPastPaper,
  getFilesUrlFromS3,
};
