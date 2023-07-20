const { Sheet } = require("../models/PastPaperSheet.js");
const { User, UserSubjectMapping } = require("../models/User.js");
const { userService } = require("../services/index.js");
const CONSTANTS = require("../constants/constants.js");
const { PaperNumberSheet } = require("../models/PaperNumber.js");

const reviewerAccounts = () => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    if (req.query.search) {
      filters.boardName = { $regex: req.query.search, $options: "i" };
    }

    let role = await userService.findByRoleName(CONSTANTS.roleNames.Reviewer);

    if (role) {
      filters.roleId = role.id;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    const count = await User.count({ where: filters });
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
      console.log(role);
      const pastPaperDetails = await User.findAll({
        attributes: ["id", "Name", "email", "userName", "isActive"],

        include: [
          {
            model: Sheet,
            attributes: ["id"],
          },
          {
            model: PaperNumberSheet,
            attributes: ["id"],
          },
          {
            model: UserSubjectMapping,
            attributes: ["subjectNameIds"],
          },
        ],
        where: filters,
        limit,
        offset: startIndex,
      });

      results.results = pastPaperDetails;
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = reviewerAccounts;
