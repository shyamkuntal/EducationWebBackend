const { Op, Sequelize } = require("sequelize");
const { Subject, subjectName, SubjectLevel } = require("../models/Subject");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const createSubject = async (
  boardId,
  SubBoardId,
  grade,
  subjectNameId,
  subjectImage
) => {
  try {
    console.log(boardId, SubBoardId, grade, subjectNameId, subjectImage);
    let subject = await Subject.create({
      boardId,
      SubBoardId,
      grade,
      subjectNameId,
      subjectImage,
    });
    return subject;
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

const getSubjectNameByBoardAndSubBoard = async (boardId, subBoardId) => {
  try {
    let subject = await Subject.findAll({
      where: { boardId: boardId, SubBoardId: subBoardId },
      attributes: ["id", "boardId", "SubBoardId", "grade", "subjectImage"],
      include: [{ model: subjectName, attributes: ["id", "subjectName"] }],
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

const findSubjectByIds = async (boardId, SubBoardId, grade, subjectNameId) => {
  try {
    let subject = await Subject.findOne({
      where: { boardId, SubBoardId, grade, subjectNameId },
      attributes: ["id"],
      raw: true,
    });
    return subject;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createSubject,
  bulkCreateSubjectLevels,
  getSubjectNameByBoardAndSubBoard,
  findSubjectByIds,
};
