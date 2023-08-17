const { Board, SubBoard } = require("../../models/Board.js");
const {
  getSubBoardsSchema,
  createSubBoardsSchema,
  addBoardSchema,
  toggleIsPublishedSchema,
  archiveBoardSchema,
  archiveSubBoardsSchema,
  getBoardsAndSubBoards,
  editBoardSchema,
  getBoardsByTypeSchema,
  updateSubBoardSchema,
} = require("../../validations/BoardManagementValidations.js");
const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { v4: uuidv4 } = require("uuid");

// creating board initially

const BoardManagementController = {
  async CreateBoard(req, res, next) {
    try {
      let values = await addBoardSchema.validateAsync(req.body);
      console.log(values);

      //Create a new board entry
      let board = await services.boardService.createBoard(
        values.boardName,
        values.boardType,
        values.contact,
        values.email,
        values.website,
        values.address
      );

      //Create sub-board entries
      let createSubBoards;

      if (values.subBoard && values.subBoard.length > 0) {
        let subBoards = values.subBoard.map((subBoardData) => ({
          subBoardName: subBoardData.subBoardName,
          isArchived: subBoardData.isArchived || false,
          boardId: board.id, // Associate the sub-board with the created board
        }));

        createSubBoards = await services.boardService.bulkCreateSubBoards(subBoards);
      }

      return res.status(httpStatus.CREATED).send({
        message: "Board and sub-board created successfully",
        board: board,
        subBoards: createSubBoards,
      });
    } catch (err) {
      next(err);
    }
  },

  async GetSubBoards(req, res, next) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });
      let subBoards = await services.boardService.getSubBoardsByBoardId(values.boardId);

      res.status(httpStatus.OK).send({ subBoards: subBoards });
    } catch (err) {
      next(err);
    }
  },

  // Update board and sub-board details
  async UpdateBoard(req, res, next) {
    try {
      let values = await editBoardSchema.validateAsync(req.body);
      // Find the board by ID
      const board = await Board.findByPk(values.id);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      // Update board details
      board.boardName = values.boardName;
      board.boardType = values.boardType;
      board.contact = values.contact;
      board.email = values.email;
      board.website = values.website;
      board.address = values.address;
      await board.save();
      // Update sub-board details
      if (values.subBoards && values.subBoards.length > 0) {
        // Get the sub-boards associated with the board
        const existingSubBoards = await SubBoard.findAll({
          where: { boardId: values.id },
        });

        // Map the existing sub-boards to their IDs
        const existingSubBoardIds = existingSubBoards.map((subBoard) => subBoard.id);

        // Filter out the sub-boards to be updated
        const subBoardsToUpdate = values.subBoards.filter(
          (subBoardData) => subBoardData.id && existingSubBoardIds.includes(subBoardData.id)
        );

        // Create new sub-boards and update existing sub-boards
        const subBoardsToCreateOrUpdate = values.subBoards.map((subBoardData) => ({
          id: subBoardData.id || uuidv4(),
          subBoardName: subBoardData.subBoardName,
          isArchived: subBoardData.isArchived || false,
          boardId: values.id,
        }));
        // Bulk create/update the sub-boards
        await SubBoard.bulkCreate(subBoardsToCreateOrUpdate, {
          updateOnDuplicate: ["subBoardName", "isArchived"],
        });

        // Update the existing sub-boards
        await Promise.all(
          subBoardsToUpdate.map((subBoardData) =>
            SubBoard.update(
              {
                subBoardName: subBoardData.subBoardName,
                isArchived: subBoardData.isArchived || false,
              },
              {
                where: { id: subBoardData.id },
              }
            )
          )
        );
      }
      const allboard = await SubBoard.findAll({
        where: { boardId: board.id },
      });
      return res.status(200).json({
        message: "Board and sub-board details updated successfully",
        board,
        allboard,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async TogglePublishBoard(req, res, next) {
    try {
      let values = await toggleIsPublishedSchema.validateAsync(req.body);
      const board = await services.boardService.findBoardById(values.boardId);

      if (!board) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "Board not found" });
      }

      if (board.isPublished === values.isPublished) {
        res.status(httpStatus.OK).send({ message: "Board publish updated!" });
      } else {
        let updateIsPublished = await services.boardService.updateBoardIsPublished(
          board.id,
          values.isPublished
        );

        if (updateIsPublished.length > 0) {
          res.status(httpStatus.OK).send({ message: "Board publish updated!" });
        }
      }
    } catch (err) {
      next(err);
    }
  },
  async ToggleArchiveBoard(req, res, next) {
    try {
      let values = await archiveBoardSchema.validateAsync(req.body);

      let board = await services.boardService.findBoardById(values.boardId);

      if (!board) {
        res.status(httpStatus.NOT_FOUND).send({ message: "Board not found" });
      }

      if (board.isArchived === values.isArchived) {
        res.status(httpStatus.OK).send({ message: "Board archive updated!" });
      } else {
        let updateIsArchived = await services.boardService.updateBoardIsArchived(
          values.boardId,
          values.isArchived
        );

        if (updateIsArchived.length > 0) {
          res.status(httpStatus.OK).send({ message: "Board archive updated!" });
        }
      }
    } catch (err) {
      next(err);
    }
  },
  async ToggleArchiveSubBoards(req, res, next) {
    try {
      let values = await archiveSubBoardsSchema.validateAsync(req.body);

      // Update sub-boards
      if (values.subBoardIds && values.subBoardIds.length > 0) {
        let archiveSubBoards = await services.boardService.updateSuBoardsIsArchived(
          values.boardId,
          values.subBoardIds,
          values.isArchived
        );

        if (archiveSubBoards.length > 0) {
          res.status(httpStatus.OK).send({
            message: "Sub-boards Isarchived updated successfully!",
          });
        }
      }
    } catch (err) {
      next(err);
    }
  },

  async createSubBoard(req, res, next) {
    try {
      let values = await createSubBoardsSchema.validateAsync(req.body);

      let subBoards = await services.boardService.createSubBoard(
        values.boardId,
        values.subBoardName
      );

      res.status(httpStatus.OK).send(subBoards);
    } catch (err) {
      next(err);
    }
  },

  async updateSubBoardName(req, res, next) {
    try {
      let values = await updateSubBoardSchema.validateAsync(req.body);

      let updateSubBoard = await SubBoard.update(
        { subBoardName: values.subBoardName },
        { where: { id: values.subBoardId } }
      );

      res.status(httpStatus.OK).send({ message: "SubBoardName Updated!" });
    } catch (err) {
      next(err);
    }
  },
  async GetBoardAndSubBords(req, res, next) {
    try {
      let values = await getBoardsAndSubBoards.validateAsync({
        boardId: req.query.id,
      });

      let getboard = await services.boardService.findBoardById(values.boardId);

      let getSubBoards = await services.boardService.getSubBoardsByBoardId(values.boardId);

      getboard.subBoards = getSubBoards;

      res.status(httpStatus.OK).send(getboard);
    } catch (err) {
      next(err);
    }
  },

  async getAllBoards(req, res, next) {
    try {
      let allBoards = await services.boardService.findAllBoards();
      res.status(httpStatus.OK).send(allBoards);
    } catch (err) {
      next(err);
    }
  },

  async getBoardsByType(req, res, next) {
    try {
      let values = await getBoardsByTypeSchema.validateAsync({ boardType: req.query.boardType });

      let boards = await services.boardService.findBoardsByType(values.boardType);

      res.status(httpStatus.OK).send(boards);
    } catch (err) {
      next(err);
    }
  },
  async deleteBoard(req, res, next) {
    try {
    } catch (err) {}
  },
};

module.exports = BoardManagementController;
