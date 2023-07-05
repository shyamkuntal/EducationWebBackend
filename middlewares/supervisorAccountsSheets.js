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
const { Board, SubBoard } = require("../models/Board.js");

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
      const usersDetails = await User.findAll({
        attributes: ["id", "Name", "email", "userName", "password", "isActive"],

        raw: true,
        where: filters,
        limit,
        offset: startIndex,
      });

      console.log(usersDetails);

      let userWithBoardsSubBoards = [];

      for (let i = 0; i < usersDetails.length; i++) {
        let boards = await UserBoardMapping.findAll({
          where: { userId: usersDetails[i].id },
          attributes: ["userId"],
          include: [{ model: Board, attributes: ["id", "boardName"] }],
          raw: true,
          nest: true,
        });

        let subBoardMappings = await UserSubBoardMapping.findAll({
          where: { userId: usersDetails[i].id },
          raw: true,
        });

        let subjectMappings = await UserSubjectMapping.findAll({
          where: { userId: usersDetails[i].id },
          raw: true,
        });

       
        let boardDetails = [];
        for (let j = 0; j < boards.length; j++) {
          let boardsSubBoards = {
            ...boards[j],
            subBoards: [],
          };
          let subBoards = await SubBoard.findAll({
            where: { boardId: boards[j].board.id },
            attributes: ["id", "subBoardName", "isArchived"],
            raw: true,
            nest: true,
          });

          for (let i = 0; i < subBoards.length; i++) {
            subBoardMappings.map((item) => {
              if (item.subBoardId === subBoards[i].id) {
                boardsSubBoards.subBoards.push(subBoards[i]);
              }
            });
          }
          boardDetails.push(boardsSubBoards);
        }

        userWithBoardsSubBoards.push({
          user: usersDetails[i],
          boardDetails: boardDetails,
          subject: subjectMappings,
        });
      }

      results.results = userWithBoardsSubBoards;
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err.message });
    }
  };
};

module.exports = reviewerAccountsSheets;
