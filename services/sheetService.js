const { Op, Sequelize } = require("sequelize");
const { Sheet, SheetLog, SpamSheetRecheckComments, SheetCheckList } = require("../models/Sheet.js");
const { User } = require("../models/User.js");
const CONSTANTS = require("../constants/constants.js");
const { s3Client } = require("../config/s3.js");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const httpStatus = require("http-status");
require("dotenv").config();

const findSheet = async (sheetId) => {
  try {
    let findSheet = Sheet.findOne({
      where: { id: sheetId },
      raw: true,
    });

    return findSheet;
  } catch (err) {
    throw err;
  }
};
const findSheetAndUser = async (sheetId) => {
  try {
    let findSheet = Sheet.findOne({
      where: { id: sheetId },
      include: [
        {
          model: User,
          as: "supervisor",
        },
      ],
      raw: true,
      nest: true,
    });

    return findSheet;
  } catch (err) {
    throw err;
  }
};

const checkSheetAssignmentId = async (sheetId, userId) => {
  try {
    let checkId = await Sheet.findOne({
      where: { [Op.and]: [{ id: sheetId }, { assignedToUserId: userId }] },
      raw: true,
    });

    return checkId;
  } catch (err) {
    throw err;
  }
};

const updateSheet = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedSheet = await Sheet.update(dataToBeUpdated, whereQuery);

    return updatedSheet;
  } catch (err) {
    throw err;
  }
};

const updateSupervisorComments = async (sheetId, comment, user) => {
  if (user === CONSTANTS.roleNames.PastPaper) {
    try {
      let updateComment = await Sheet.update(
        {
          supervisorCommentToPastPaper: comment,
        },
        { where: { id: sheetId } }
      );
      return updateComment;
    } catch (error) {
      throw error;
    }
  } else {
    try {
      let updateComment = await Sheet.update(
        {
          supervisorCommentToReviewer: comment,
        },
        { where: { id: sheetId } }
      );
      return updateComment;
    } catch (error) {
      throw error;
    }
  }
};

const assignSupervisorToSheetAndUpdateStatus = async (sheetId, userId, statusForSupervisor) => {
  try {
    let assignSheetAndStatus = await Sheet.update(
      {
        assignedToUserId: userId,
        statusForSupervisor,
      },
      { where: { id: sheetId } }
    );

    return assignSheetAndStatus;
  } catch (error) {
    throw err;
  }
};

const findSheetInSheetStatus = async (sheetId) => {
  try {
    let findSheet = await SheetStatus.findOne({
      where: { sheetId: sheetId },
    });
    return findSheet;
  } catch (err) {
    throw err;
  }
};

const createSheetLog = async (sheetId, assignee, assignedTo, logMessage) => {
  try {
    let createLog = await SheetLog.create({
      sheetId,
      assignee,
      assignedTo,
      logMessage,
    });

    return createLog;
  } catch (err) {
    throw err;
  }
};

const findSheetLog = async (sheetId) => {
  try {
    let sheetLog = await SheetLog.findAll({
      where: { sheetId: sheetId },
    });
    return sheetLog;
  } catch (err) {
    throw err;
  }
};

const uploadErrorReportFile = async (fileName, fileObj) => {
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

const addRecheckError = async (sheetId, recheckComment) => {
  try {
    let createRecheckComment = await SpamSheetRecheckComments.create({
      sheetId: sheetId,
      reviewerRecheckComment: recheckComment,
    });
    return createRecheckComment;
  } catch (err) {
    throw err;
  }
};

const findRecheckingComments = async (sheetId) => {
  try {
    let findRecheckComments = await SpamSheetRecheckComments.findOne({
      where: { sheetId: sheetId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return findRecheckComments;
  } catch (err) {
    throw err;
  }
};

const findCheckList = async (sheetId) => {
  try {
    let findCheckList = await SheetCheckList.findAll({
      sheetId: sheetId,
      raw: true,
    });
    return findCheckList;
  } catch (err) {
    throw err;
  }
};

const createSheetCheckList = async (sheetId) => {
  try {
    let checkList = [
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem1 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem2 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem3 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem4 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem5 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem6 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem7 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem8 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem9 },
      { sheetId: sheetId, label: CONSTANTS.sheetCheckList.CheckListItem10 },
    ];

    let bulkCreateCheckList = await SheetCheckList.bulkCreate(checkList);
    return bulkCreateCheckList;
  } catch (err) {
    throw err;
  }
};

const getFilesUrlFromS3 = async (fileName) => {
  try {
    console.log(fileName);
    let getFilesParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    const getAnsPaperCommand = new GetObjectCommand(getFilesParams);

    const fileUrl = await getSignedUrl(s3Client, getAnsPaperCommand, {
      expiresIn: 3600,
    });

    return fileUrl;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findSheet,
  findSheetAndUser,
  checkSheetAssignmentId,
  updateSheet,
  assignSupervisorToSheetAndUpdateStatus,
  findSheetInSheetStatus,
  createSheetLog,
  uploadErrorReportFile,
  addRecheckError,
  findRecheckingComments,
  createSheetCheckList,
  findCheckList,
  findSheetLog,
  updateSupervisorComments,
  getFilesUrlFromS3,
};
