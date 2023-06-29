const { Op, Sequelize, where } = require("sequelize");
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
      where: { boardId, subBoardId, grade, subjectNameId, isPublished: true },
      attributes: ["id", "subjectNameId"],
      raw: true,
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

const findSubjectByIdsForCreation = async (
  boardId,
  subBoardId,
  grade,
  subjectNameId
) => {
  try {
    let subject = await Subject.findOne({
      where: { boardId, subBoardId, grade, subjectNameId },
      attributes: ["id", "subjectNameId"],
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
      attributes: ["id", "subjectName", "subjectImage"],
      raw: true
    });
    return subjectNames;
  } catch (err) {
    throw err;
  }
};

const findSubjectDetailsByBoardSubBoardGrade = async ({
  boardId,
  subBoardId,
  grade,
  isPublished,
}) => {
  try {
    let subjectDetails = await Subject.findAll({
      where: {
        boardId,
        subBoardId,
        grade,
        isPublished,
      },
      attributes: [
        "id",
        "boardId",
        "subBoardId",
        "grade",
        "subjectNameId",
        "subjectImage",
      ],
      include: [
        { model: subjectName },
        {
          model: SubjectLevel,
          where: { isArchived: false },
          attributes: ["id", "subjectLevelName", "isArchived", "subjectId"],
          required: false,
        },
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

const findSubject = async (whereQuery, include) => {
  try {
    let subject = await Subject.findOne({
      where: whereQuery,
      include,
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

const findSubjectName = async (whereQuery) => {
  try {
    let subjectNameDetails = subjectName.findAll(whereQuery);

    return subjectNameDetails;
  } catch (err) {
    throw err;
  }
};

const updateSubject = async (dataToBeUpdated, whereQuery) => {
  try {
    let updateSubject = await Subject.update(dataToBeUpdated, whereQuery);
    return updateSubject;
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
  findSubject,
  updateSubject,
  findSubjectName,
  findSubjectByIdsForCreation,
};
