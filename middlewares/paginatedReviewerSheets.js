const { Op } = require("sequelize");
const { Board, SubBoard } = require("../models/Board.js");
const { Sheet, SpamSheetRecheckComments } = require("../models/Sheet.js");
const { SubjectLevel, Subject } = require("../models/Subject.js");

const getPaginatedReviewerSheets = (model) => {
  return async (req, res, next) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    // later on reviewer id will be coming through checkvalidrole middleware
    filters.assignedToUserId = req.query.reviewerId;
    if (req.query.isSpam) {
      filters.isSpam = req.query.isSpam;
    }
    if (req.query.boardId) {
      filters.boardId = req.query.boardId;
    }
    if (req.query.subBoardId) {
      filters.subBoardId = req.query.subBoardId;
    }
    if (req.query.subjectId) {
      filters.subjectId = req.query.subjectId;
    }
    if (req.query.grade) {
      filters.grade = req.query.grade;
    }
    if (req.query.search) {
      filters.year = { [Op.iLike]: `%${req.query.search}%` };
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

   
      console.log(req.query.isSpam);
      if (req.query.isSpam === "true") {
        const sheets = await Sheet.findAll({
          attributes: [
            "id",
            "grade",
            "year",
            "statusForReviewer",
            "errorReport",
            "supervisorCommentToReviewer",
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
          ],
          where: filters,
          limit,
          offset: startIndex,
        });
        results.results = sheets;
        res.paginatedResults = results;
      } else {
        const sheets = await Sheet.findAll({
          attributes: [
            "id",
            "grade",
            "year",
            "season",
            "varient",
            "paperNumber",
            "statusForReviewer",
            "isSpam",
            "errorReport",
            "errorReportImg",

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
              attributes: ["subjectNameId"] 
            },
            { 
              model: SubjectLevel, 
              attributes: ["subjectLevelName"] 
            },
          ],
          where: filters,
          limit,
          offset: startIndex,
        });
        results.results = sheets;
        res.paginatedResults = results;
      }

      next();
    } catch (err) {
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = getPaginatedReviewerSheets;
