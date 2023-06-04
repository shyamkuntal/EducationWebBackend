const { Board, SubBoard } = require("../../models/Board.js");
const {
  getSubBoardsSchema,
  createSubBoardsSchema,
  addBoardSchema,
  toggleIsPublishedSchema,
  archiveBoardSchema,
  archiveSubBoardsSchema,
} = require("../../validations/BoardManagementValidations.js");
const services = require("../../services/index.js");
const httpStatus = require("http-status");

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
          SubBoardName: subBoardData.SubBoardName,
          isArchived: subBoardData.isArchived || false,
          boardId: board.id, // Associate the sub-board with the created board
        }));

        createSubBoards = await services.boardService.bulkCreateSubBoards(
          subBoards
        );
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
        boardId: req.params.boardId,
      });
      let subBoards = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );

      res.status(httpStatus.OK).send({ subBoards: subBoards });
    } catch (err) {
      next(err);
    }
  },

  // Update board and sub-board details
  async UpdateBoard(req, res) {
    const { id } = req.params;
    const { boardName, boardType, contact, email, website, address, subBoard } =
      req.body;

    try {
      // Find the board by ID
      const board = await Board.findByPk(id);

      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      // Update board details
      board.boardName = boardName;
      board.boardType = boardType;
      board.contact = contact;
      board.email = email;
      board.website = website;
      board.address = address;

      await board.save();

      // Update sub-board details
      if (subBoard && subBoard.length > 0) {
        // Get the sub-boards associated with the board
        const existingSubBoards = await SubBoard.findAll({
          where: { boardId: board.id },
        });

        // Map the existing sub-boards to their IDs
        const existingSubBoardIds = existingSubBoards.map(
          (subBoard) => subBoard.id
        );

        // Filter out the sub-boards to be updated
        const subBoardsToUpdate = subBoard.filter(
          (subBoardData) =>
            subBoardData.id && existingSubBoardIds.includes(subBoardData.id)
        );

        // Create new sub-boards and update existing sub-boards
        const subBoardsToCreateOrUpdate = subBoard.map((subBoardData) => ({
          id: subBoardData.id || null,
          SubBoardName: subBoardData.SubBoardName,
          isArchived: subBoardData.isArchived || false,
          boardId: board.id,
        }));

        // Bulk create/update the sub-boards
        await SubBoard.bulkCreate(subBoardsToCreateOrUpdate, {
          updateOnDuplicate: ["SubBoardName", "isArchived"],
        });

        // Update the existing sub-boards
        await Promise.all(
          subBoardsToUpdate.map((subBoardData) =>
            SubBoard.update(
              {
                SubBoardName: subBoardData.SubBoardName,
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
      return res
        .status(500)
        .json({ message: "Failed to update board and sub-board details" });
    }
  },
  async TogglePublishBoard(req, res, next) {
    try {
      let values = await toggleIsPublishedSchema.validateAsync(req.body);
      const board = await services.boardService.findBoardById(values.boardId);

      if (!board) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ message: "Board not found" });
      }

      if (board.isPublished === values.isPublished) {
        res.status(httpStatus.OK).send({ message: "Board publish updated!" });
      } else {
        let updateIsPublished =
          await services.boardService.updateBoardIsPublished(
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
        let updateIsArchived =
          await services.boardService.updateBoardIsArchived(
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
  async ToggleArchiveSubBoards(req, res) {
    try {
      let values = await archiveSubBoardsSchema.validateAsync(req.body);

      console.log(values);

      // Update sub-boards
      if (values.subBoardIds && values.subBoardIds.length > 0) {
        let archiveSubBoards =
          await services.boardService.updateSuBoardsIsArchived(
            values.boardId,
            values.subBoardIds,
            values.isArchived
          );

        console.log(archiveSubBoards);
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

      console.log(values);

      let subBoards = await services.boardService.createSubBoard(
        values.boardId,
        values.subBoardName
      );

      res.status(httpStatus.OK).send(subBoards);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BoardManagementController;
