const { Op } = require("sequelize");
const { Board, SubBoard } = require("../models/Board.js");
const { Subject, SubjectLevel, subjectName } = require("../models/Subject.js");

const paginatedSubjects = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const filters = {
      //   isArchived: false,
      //   isPublished: false,
    };
    let subjectNameFilter = "";
    if (req.query.isArchived) {
      filters.isArchived = req.query.isArchived;
    }
    if (req.query.isPublished) {
      filters.isPublished = req.query.isPublished;
    }
    // if (req.query.search) {
    //   filters.boardName = { [Op.iLike]: `%${req.query.search}%` };
    // }
    if (req.query.boardId) {
      filters.boardId = req.query.boardId;
    }
    if (req.query.subBoardId) {
      filters.subBoardId = req.query.subBoardId;
    }
    if (req.query.subjectName) {
      subjectNameFilter;
    }
    if (req.query.grade) {
      filters.grade = req.query.grade;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log("filters.........", filters);
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
          "subjectImage",
          "isArchived",
          "isPublished",
        ],
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
            attributes: ["id", "subjectLevelName", "subjectId", "isArchived"],
            required: false,
          },
          {
            model: subjectName,
            where: req.query.subjectName ? { id: req.query.subjectName } : {},
            attributes: ["id", "subjectName"],
          },
        ],
        where: filters,
        limit,
        offset: startIndex,
        group: [
          "subject.id",
          "subjectName.id",
          "boardId",
          "subBoardId",
          "grade",
        ],
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
