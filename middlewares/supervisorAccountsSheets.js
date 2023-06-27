const { Sheet } = require("../models/Sheet.js");
const {
  User,
  UserSubjectMapping,
  UserBoardMapping,
  UserSubBoardMapping,
} = require("../models/User.js");
const services = require("../services/index.js");
const CONSTANTS = require("../constants/constants.js");
const httpStatus = require("http-status");

const reviewerAccountsSheets = () => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    if (req.query.search) {
      filters.boardName = { $regex: req.query.search, $options: "i" };
    }

    let role = await services.userService.findByRoleName(
      CONSTANTS.roleNames.Supervisor
    );

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
      const pastPaperDetails = await User.findAll({
        attributes: ["id", "Name", "email", "userName", "password", "isActive"],

        include: [
          {
            model: Sheet,
            attributes: ["id"],
          },
          { model: UserBoardMapping, attributes: ["boardID"] },
          { model: UserSubBoardMapping, attributes: ["subBoardId"] },
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
      console.log(err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  };
};

module.exports = reviewerAccountsSheets;
