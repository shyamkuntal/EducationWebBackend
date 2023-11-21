const {
  PaperNumberSheet,
  PaperNumberSheetLog,
  PaperNumberSheetCheckList,
  SpamPaperNumberSheetRecheckComments,
  PaperNumber,
} = require("../models/PaperNumberSheet");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { User } = require("../models/User");
const CONSTANTS = require("../constants/constants");
const { s3Client } = require("../config/s3");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const findPaperNumberSheetByPk = async (paperNumberSheetId) => {
  try {
    let sheet = await PaperNumberSheet.findByPk(paperNumberSheetId);

    return sheet;
  } catch (err) {
    throw err;
  }
};

const createPaperNumberSheetLog = async (dataToBeCreated) => {
  try {
    let createSheetLog = await PaperNumberSheetLog.create(dataToBeCreated);
    return createSheetLog;
  } catch (err) {
    throw err;
  }
};

const uploadPaperNumberErrorReportFile = async (fileName, fileObj) => {
  try {
    const imageUploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileObj.buffer,
      Key: fileName,
      ContentType: fileObj.mimetype,
    };

    let fileUpload = await s3Client.send(new PutObjectCommand(imageUploadParams));

    if (fileUpload.$metadata.httpStatusCode === httpStatus.OK) {
      return fileName;
    } else {
      false;
    }
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

const updatePaperNumberSheet = async (dataToBeUpdated, whereQuery, options) => {
  try {
    if(options)
      whereQuery={...whereQuery,...options}

    let updateStatus = await PaperNumberSheet.update(dataToBeUpdated, whereQuery, options);

    return updateStatus;
  } catch (err) {
    throw err;
  }
};

const createRecheckComment = async (dataToBeCreated) => {
  try {
    let recheckComment = await SpamPaperNumberSheetRecheckComments.create(dataToBeCreated);

    return recheckComment;
  } catch (err) {
    throw err;
  }
};

const findRecheckingComments = async (paperNumberSheetId) => {
  try {
    let findRecheckComments = await SpamPaperNumberSheetRecheckComments.findOne({
      where: { paperNumberSheetId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return findRecheckComments;
  } catch (err) {
    throw err;
  }
};

const findSheetAndUser = async (paperNumberSheetId) => {
  try {
    let findSheet = PaperNumberSheet.findOne({
      where: { id: paperNumberSheetId },
      include: [
        { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
        { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
      ],
      raw: true,
      nest: true,
    });
    return findSheet;
  } catch (err) {
    throw err;
  }
};

const assignUserToSheetAndUpdateLifeCycleAndStatuses = async (
  paperNumberSheetId,
  userId,
  lifeCycleName,
  statusForSupervisor,
  statusForDownStreamUser
) => {
  try {
    if (lifeCycleName === CONSTANTS.roleNames.DataGenerator) {
      let assignSheetAndStatus = await PaperNumberSheet.update(
        {
          assignedToUserId: userId,
          dataGeneratorId: userId,
          lifeCycle: lifeCycleName,
          statusForSupervisor,
          statusForDataGenerator: statusForDownStreamUser,
        },
        { where: { id: paperNumberSheetId } }
      );
      return assignSheetAndStatus;
    }
    if (lifeCycleName === CONSTANTS.roleNames.Reviewer) {
      let assignSheetAndStatus = await PaperNumberSheet.update(
        {
          assignedToUserId: userId,
          reviewerId: userId,
          lifeCycle: lifeCycleName,
          statusForSupervisor,
          statusForReviewer: statusForDownStreamUser,
        },
        { where: { id: paperNumberSheetId } }
      );
      return assignSheetAndStatus;
    }
  } catch (err) {
    throw err;
  }
};

const updateSupervisorComments = async (paperNumberSheetId, Comment, user) => {
  if (user === CONSTANTS.roleNames.DataGenerator) {
    try {
      let updateComment = await PaperNumberSheet.update(
        {
          supervisorCommentToDataGenerator: Comment,
        },
        { where: { id: paperNumberSheetId } }
      );
      return updateComment;
    } catch (error) {
      throw error;
    }
  } else {
    try {
      let updateComment = await PaperNumberSheet.update(
        {
          supervisorCommentToReviewer: Comment,
        },
        { where: { id: paperNumberSheetId } }
      );
      return updateComment;
    } catch (error) {
      throw error;
    }
  }
};

const createSheetLog = async (paperNumberSheetId, assignee, assignedTo, logMessage) => {
  try {
    let createLog = await PaperNumberSheetLog.create({
      paperNumberSheetId,
      assignee,
      assignedTo,
      logMessage,
    });
    return createLog;
  } catch (err) {
    throw err;
  }
};

const findCheckList = async (paperNumberSheetId) => {
  try {
    let findCheckList = await PaperNumberSheetCheckList.findAll({
      paperNumberSheetId: paperNumberSheetId,
      raw: true,
    });
    return findCheckList;
  } catch (err) {
    throw err;
  }
};

const createSheetCheckList = async (paperNumberSheetId) => {
  try {
    let checkList = [
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem1 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem2 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem3 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem4 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem5 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem6 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem7 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem8 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem9 },
      { paperNumberSheetId: paperNumberSheetId, label: CONSTANTS.sheetCheckList.CheckListItem10 },
    ];
    let bulkCreateCheckList = await PaperNumberSheetCheckList.bulkCreate(checkList);
    return bulkCreateCheckList;
  } catch (err) {
    throw err;
  }
};

const findSheetLog = async (paperNumberSheetId) => {
  try {
    let sheetLog = await PaperNumberSheetLog.findAll({
      where: { paperNumberSheetId: paperNumberSheetId },
    });
    return sheetLog;
  } catch (err) {
    throw err;
  }
};

const findPaperNumberbyBoardSubBoardGradeSubject = async ({
  boardId,
  subBoardId,
  grade,
  subjectId,
}) => {
  try {
    let paperNumberSheetDetails = await PaperNumberSheet.findOne({
      where: {
        boardId,
        subBoardId,
        grade,
        subjectId,
        isSpam: false,
        isArchived: false,
        isPublished: true,
      },
    });

    // finding PaperNumber by pastPaperId
    let paperNumberDetails = [];
    if (paperNumberSheetDetails) {
      paperNumberDetails = await PaperNumber.findAll({
        where: {
          paperNumberSheetId: paperNumberSheetDetails.id,
          isArchive: false,
        },
      });
    }

    return paperNumberDetails;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findPaperNumberSheetByPk,
  findSheetAndUser,
  assignUserToSheetAndUpdateLifeCycleAndStatuses,
  updateSupervisorComments,
  createSheetLog,
  findCheckList,
  createSheetCheckList,
  createPaperNumberSheetLog,
  uploadPaperNumberErrorReportFile,
  updatePaperNumberSheet,
  createRecheckComment,
  findRecheckingComments,
  getFilesUrlFromS3,
  findSheetLog,
  findPaperNumberbyBoardSubBoardGradeSubject,
};
