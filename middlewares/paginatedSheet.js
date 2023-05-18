const { Board, SubBoard } = require("../models/Board.js");
const { Sheet } = require("../models/Sheet.js");
const { SubjectLevel } = require("../models/Subject.js");

const paginatedSheetResults = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    if (req.query.isPublished) {
      filters.isPublished = req.query.isPublished;
    }
    if (req.query.boardId) {
      filters.boardId = req.query.boardId;
    }
    if (req.query.SubBoardId) {
      filters.SubBoardId = req.query.SubBoardId;
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
        attributes: ["id", "grade", "year"],
        include: [
          {
            model: SubBoard,
            attributes: ["SubBoardName"],
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
