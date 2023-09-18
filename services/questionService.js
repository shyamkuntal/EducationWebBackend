const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");
const { FillTextDropDownOption } = require("../models/FillDropDownOption");
const { ApiError } = require("../middlewares/apiError");
const httpStatus = require("http-status");
const { generateFileName, s3Client } = require("../config/s3");
const { PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const db = require("../config/database");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { MatchQuestionPair } = require("../models/MatchQuestionPair");

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

    if (options.length >= 10) {
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

const deleteQuestion = async (whereQuery, options) => {
  try {
    if (whereQuery.where) {
      let deletedQuestion = await Question.destroy(whereQuery, options);

      return deletedQuestion;
    }
  } catch (err) {
    throw err;
  }
};

const editQuestion = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let question = await Question.update(dataToBeUpdated, whereQuery, options);

    return question;
  } catch (err) {
    throw err;
  }
};

const checkMatchQuestionPairs = async (questionId) => {
  try {
    let options = await MatchQuestionPair.findAll({ where: { questionId }, raw: true });

    if (options.length >= 20) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only 20 pairs allowed per question!");
    }
  } catch (err) {
    throw err;
  }
};

const deleteS3File = async (fileObj) => {
  try {
    let deleteFileParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileObj.fileName,
    };
    await s3Client.send(new DeleteObjectCommand(deleteFileParams));
  } catch (err) {
    throw err;
  }
};

function determineFileType(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();

  if (fileExtension.match(/(jpg|jpeg|png|gif)/)) {
    return "image";
  } else if (fileExtension.match(/(mp4|avi|mkv)/)) {
    return "video";
  } else if (fileExtension.match(/(mp3|wav)/)) {
    return "audio";
  } else if (fileExtension.match(/(html)/)) {
    return "simulation";
  } else {
    return "other";
  }
}

function getFolderName(fileType) {
  switch (fileType) {
    case "image":
      return process.env.AWS_QUESTIONS_IMAGES_FOLDER_NAME;
    case "video":
      return process.env.AWS_QUESTIONS_VIDEO_FOLDER_NAME;
    case "audio":
      return process.env.AWS_QUESTIONS_AUDIO_FOLDER_NAME;
    case "simulation":
      return process.env.AWS_QUESTIONS_SIMULATION_FOLDER_NAME;
    default:
      return "other";
  }
}

async function uploadFileToS3(fileObj) {
  try {
    const fileType = determineFileType(fileObj.originalname);
    const folderName = getFolderName(fileType);

    const fileName = folderName + "/" + generateFileName(fileObj.originalname);
    const mimeType = fileObj.mimetype;

    const uploadParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Body: fileObj.buffer,
      Key: fileName,
      ContentType: mimeType,
      ContentEncoding: "base64",
      ACL: "public-read",
    };

    const fileUpload = await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_QUESTIONS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;

    if (fileUpload.$metadata.httpStatusCode === httpStatus.OK) {
      return { fileName: fileName, fileUrl: fileUrl };
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}

async function deleteFileFromS3(fileName) {
  try {
    let filename = fileName.split("/")[1]
    const fileType = determineFileType(filename);
    const folderName = getFolderName(fileType);
    
    const listParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Prefix: `${folderName}/`,
    };
    const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
    const fileKey = listResponse.Contents.find((obj) => obj.Key === fileName);
    
    if (!fileKey) {
      return { message: "File not found" };
    }

    const deleteParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Key: fileName,
    };

    const result = await s3Client.send(new DeleteObjectCommand(deleteParams));

    if (result.$metadata.httpStatusCode === httpStatus.NO_CONTENT) {
      return { message: "File deleted successfully" };
    } else {
      return null;
    }
  } catch (err) {
    console.log(err)
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

async function DeleteQues(questionId) {
  const t = await db.transaction();
  try {
    const question = await Question.findByPk(questionId);
    if (!question) {
      await t.rollback();
      return res.status(httpStatus.NOT_FOUND).json({ message: "Question not found" });
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

module.exports = {
  createQuestion,
  checkFillDropDownOptions,
  getQuestionsDetailsById,
  uploadFileToS3,
  deleteQuestion,
  editQuestion,
  deleteS3File,
  checkMatchQuestionPairs,
  updateQuestion,
  DeleteQues,
  deleteFileFromS3,
};
