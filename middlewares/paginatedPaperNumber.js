const constants = require("../constants/constants.js");
const { Board, SubBoard } = require("../models/Board.js");
const { PaperNumberSheet } = require("../models/PaperNumberSheet.js");
const { Subject } = require("../models/Subject.js");
const { User } = require("../models/User.js");

const paginatedPaperNumberSheet = (model, req) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)||1
    const limit = parseInt(req.query.limit)||10
    const filters = {
      isArchived: false,
      // isPublished: true,
    };

    if (req.query.isSpam) {
      filters.isSpam = req.query.isSpam;
    }
    if (req.query.isArchived) {
      filters.isArchived = req.query.isArchived;
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
    if (req.query.statusForDataGenerator) {
      filters.statusForDataGenerator = req.query.statusForDataGenerator;
    }
    if (req.query.statusForReviewer) {
      filters.statusForReviewer = req.query.statusForReviewer;
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
    const count = await PaperNumberSheet.count({ where: filters });
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
      const paperNumberSheets = await PaperNumberSheet.findAll({
        attributes: [
          "id",
          "boardId",
          "subBoardId",
          "grade",
          "subjectId",
          "resources",
          "description",
          "lifeCycle",
          "supervisorId",
          "reviewerId",
          "dataGeneratorId",
          "assignedToUserId",
          "statusForSupervisor",
          "statusForDataGenerator",
          "statusForReviewer",
          "errorReport",
          "errorReportImg",
          "reviewerCommentToSupervisor",
          "supervisorCommentToReviewer",
          "supervisorCommentToDataGenerator",
          "isSpam",
          "isArchived",
          "isPublished",
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
            model: Subject,
            where: req.query.subjectNameId ? { subjectNameId: req.query.subjectNameId } : {},
          },
          {
            model: User,
            attributes: ["Name"],
            as: "supervisor",
          },
          {
            model: User,
            attributes: ["Name"],
            as: "assignedToUserName",
          },
        ],
        where: filters,
        limit,
        offset: startIndex,
        raw: true,
        nest: true,
      });

      results.results = paperNumberSheets;
      results.results.forEach((object) => {
        object.sheetType = "PaperNumber";
      });
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = paginatedPaperNumberSheet;
