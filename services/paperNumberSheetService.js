const {
  PaperNumberSheet,
  PaperNumberSheetLog,
  PaperNumberSheetCheckList,
} = require("../models/PaperNumber");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { User } = require("../models/User");
const CONSTANTS = require("../constants/constants");

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
    const errorImageKey =
      process.env.AWS_BUCKET_PAPERNUMBER_ERROR_REPORT_IMAGES_FOLDER + "/" + fileName;

    const imageUploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileObj.buffer,
      Key: errorImageKey,
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

const updatePaperNumberSheet = async (dataToBeUpdated, whereQuery) => {
  try {
    let updateStatus = await PaperNumberSheet.update(dataToBeUpdated, whereQuery);

    return updateStatus;
  } catch (err) {
    throw err;
  }
};

const findSheetAndUser = async (paperNumberSheetId) => {
  try {
    let findSheet = PaperNumberSheet.findOne({
      where: { id: paperNumberSheetId },
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

const updateSupervisorComments = async (paperNumberSheetId, comment, user) => {
  if (user === CONSTANTS.roleNames.PastPaper) {
    try {
      let updateComment = await PaperNumberSheet.update(
        {
          supervisorCommentToDataGenerator: comment,
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
          supervisorCommentToReviewer: comment,
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
};
