const constants = require("../constants/constants.js");
const { Board, SubBoard } = require("../models/Board.js");
const { Sheet } = require("../models/Sheet.js");
const { SubjectLevel, subjectName, Subject } = require("../models/Subject.js");
const { User } = require("../models/User.js");

const paginatedSheetResults = (model, req) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      isArchived: false,
      // isPublished: true,
    };

    if (req.query.isSpam) {
      filters.isSpam = req.query.isSpam;
    }
    if (req.query.isPublished) {
      filters.isPublished = req.query.isPublished;
    }
    if (req.query.assignedToUserId) {
      filters.assignedToUserId = req.query.assignedToUserId;
    }
    if (req.query.supervisorId) {
      filters.supervisorId = req.query.supervisorId;
    }
    if (req.query.boardId) {
      filters.boardId = req.query.boardId;
    }
    if (req.query.subjectId) {
      filters.subjectId = req.query.subjectId;
    }
    if (req.query.subBoardId) {
      filters.subBoardId = req.query.subBoardId;
    }
    if (req.query.grade) {
      filters.grade = req.query.grade;
    }
    if (req.query.statusForPastPaper) {
      filters.statusForPastPaper = req.query.statusForPastPaper;
    }
    if (req.query.statusForReviewer) {
      filters.statusForReviewer = req.query.statusForReviewer;
    }
    if (req.query.subjectLevelId) {
      filters.subjectLevelId = req.query.subjectLevelId;
    }
    if (req.query.year) {
      filters.year = req.query.year;
    }
    if (req.query.season) {
      filters.season = req.query.season;
    }
    if (req.query.varient) {
      filters.varient = req.query.varient;
    }
    if (req.query.paperNumber) {
      filters.paperNumber = req.query.paperNumber;
    }

    if (req.query.search) {
      filters.boardName = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.time === "today") {
      filters.createdAt = {
        [Op.gte]: today,
      };
    }
    if (req.query.time === "thisweek") {
      filters.createdAt = {
        [Op.gte]: today,
      };
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    //const count = await model.countDocuments(filters).exec();
    const count = await Sheet.count({ where: filters });
    if (endIndex < count) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0 && count > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    try {
      const subjects = await Sheet.findAll({
        attributes: [
          "id",
          "boardId",
          "subBoardId",
          "grade",
          "subjectId",
          "subjectLevelId",
          "year",
          "season",
          "varient",
          "paperNumber",
          "resources",
          "lifeCycle",
          "supervisorId",
          "pastPaperId",
          "reviewerId",
          "assignedToUserId",
          "statusForSupervisor",
          "statusForReviewer",
          "statusForPastPaper",
          "errorReport",
          "errorReportImg",
          "reviewerCommentToSupervisor",
          "supervisorCommentToReviewer",
          "supervisorCommentToPastPaper",
          "isSpam",
          "isArchived",
        ],
        include: [
          {
            model: SubBoard,
            attributes: ["subBoardName"],
          },

          {
            model: Board,
            attributes: ["boardName"],
          },
          {
            model: SubjectLevel,
            attributes: ["subjectLevelName"],
            required: false,
          },
          {
            model: Subject,
            where: req.query.subjectNameId
              ? { subjectNameId: req.query.subjectNameId }
              : {},
          },
          {
            model: User,
            attributes: ["Name"],
          },
        ],
        where: filters,
        limit,
        offset: startIndex,
      });

      results.results = subjects;
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = paginatedSheetResults;
