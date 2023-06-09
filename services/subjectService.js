const { Op, Sequelize } = require("sequelize");
const { Subject, subjectName, SubjectLevel } = require("../models/Subject");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const createSubject = async ({
  boardId,
  subBoardId,
  grade,
  subjectNameId,
  subjectImage,
}) => {
  try {
    let subject = await Subject.create({
      boardId,
      subBoardId,
      grade,
      subjectNameId,
      subjectImage,
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

const createSubjectName = async (subjectNameValue) => {
  try {
    let subjectNameid = await subjectName.create({
      subjectName: subjectNameValue,
    });

    return subjectNameid;
  } catch (err) {
    throw err;
  }
};

const findBySubjectNameInUniqueSubjectNames = async (subjectNameValue) => {
  try {
    let subjectNameExists = await subjectName.findOne({
      where: { subjectName: subjectNameValue },
      raw: true,
    });

    return subjectNameExists;
  } catch (err) {
    throw err;
  }
};

const bulkCreateSubjectLevels = async (SubjectLevels) => {
  try {
    let subjectLevels = await SubjectLevel.bulkCreate(SubjectLevels);

    return subjectLevels;
  } catch (err) {
    throw err;
  }
};

const findSubjectByIds = async (boardId, subBoardId, grade, subjectNameId) => {
  try {
    let subject = await Subject.findOne({
      where: { boardId, subBoardId, grade, subjectNameId },
      attributes: ["id"],
      raw: true,
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

const getSubjectBySubjectNameId = async (subjectNameId) => {
  try {
    let subject = Subject.findOne({
      where: { subjectNameId: subjectNameId },
      raw: true,
    });

    return subject;
  } catch (err) {
    throw err;
  }
};

const getSubjectNames = async () => {
  try {
    let subjectNames = await subjectName.findAll({
      attributes: ["id", "subjectName"],
    });
    return subjectNames;
  } catch (err) {
    throw err;
  }
};

const findSubjectDetailsByBoardSubBoardGrade = async (
  boardId,
  subBoardId,
  grade
) => {
  try {
    let subjectDetails = await Subject.findAll({
      where: { boardId, subBoardId: subBoardId, grade },
      attributes: ["id", "boardId", "subBoardId", "grade", "subjectNameId"],
      include: [
        { model: subjectName },
        { model: SubjectLevel, where: { isArchived: false }, required: false },
      ],
    });

    return subjectDetails;
  } catch (err) {
    throw err;
  }
};

const updateSubjectLevels = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedSubject = await SubjectLevel.update(dataToBeUpdated, whereQuery);
    return updatedSubject;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  createSubject,
  bulkCreateSubjectLevels,
  findSubjectByIds,
  getSubjectBySubjectNameId,
  getSubjectNames,
  createSubjectName,
  findBySubjectNameInUniqueSubjectNames,
  findSubjectDetailsByBoardSubBoardGrade,
  updateSubjectLevels,
};
