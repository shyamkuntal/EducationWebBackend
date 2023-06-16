const { Board, SubBoard } = require("../models/Board.js");
const { Sheet } = require("../models/Sheet.js");
const { SubjectLevel, subjectName } = require("../models/Subject.js");
const { User } = require("../models/User.js");

const paginatedSheetResults = (model, req) => {

  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
    };
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
    if (req.query.subBoardId) {
      filters.subBoardId = req.query.subBoardId;
    }
    if (req.query.subjectName) {
      filters.subjectName = req.query.subjectName;
    }
    if (req.query.grade) {
      filters.grade = req.query.grade;
    }
    if (req.query.subjectLevel) {
      filters.subjectLevel = req.query.subjectLevel;
    }
    if (req.query.year) {
      filters.year = req.query.year;
    }
    if (req.query.season) {
      filters.season = req.query.season;
    }
    if (req.query.varient) {
      filters.subjectLevel = req.query.season;
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
        attributes: ["id", "grade", "year", "lifeCycle", "assignedToUserId", "statusForPastPaper", "isSpam", "varient", "season", "paperNumber", "isPublished", "errorReport", "resources"],
        include: [
          {
            model: SubBoard,
            attributes: ["id", "subBoardName"],
          },
        
          {
            model: Board,
            attributes: ["id", "boardName"], 
          },
          {
            model: SubjectLevel,
            attributes: ["subjectLevelName", "id"],
            required: false,
          },
          {
            model: User,
            attributes: ["Name"]
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
