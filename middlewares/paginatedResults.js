const { Op } = require("sequelize");
const { Board } = require("../models/Board.js");

const paginatedResults = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const filters = {
      isArchived: false,
      isPublished: false,
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
    if (req.query.search) {
      filters.boardName = { [Op.iLike]: `%${req.query.search}%` };
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    console.log(filters);
    const results = {};
    const count = await Board.count({ where: filters });
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
      const query = Board.findAll({
        where: filters,
        limit,
        offset: startIndex,
      });
      results.results = await query;
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
};

module.exports = paginatedResults;
