const { Op } = require("sequelize");
const { Board, SubBoard } = require("../models/Board.js");
const { Subject, SubjectLevel } = require("../models/Subject.js");

const paginatedSubjects = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const filters = {
      //   isArchived: false,
      //   isPublished: false,
    };
    if (req.query.isArchived) {
      filters.isArchived = req.query.isArchived;
    }
    if (req.query.isPublished) {
      filters.isPublished = req.query.isPublished;
    }
    if (req.query.boardType) {
      filters.boardType = req.query.boardType;
    }
    // if (req.query.search) {
    //   filters.boardName = { [Op.iLike]: `%${req.query.search}%` };
    // }
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

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(filters);
    const results = {};
    const count = await Subject.count({ where: filters });
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
      const subjects = await Subject.findAll({
        attributes: [
          "id",
          "grade",
          "subjectName",
          "subjectImage",
          "isArchived",
          "isPublished",
        ],
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
            attributes: ["id", "subjectLevelName", "isArchived"],
            required: false,
          },
        ],
        where: filters,
        limit,
        offset: startIndex,
        group: ["subject.id", "boardId", "SubBoardId", "grade"],
      });

      results.results = subjects;
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = paginatedSubjects;
