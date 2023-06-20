const { Board, SubBoard } = require("../../models/Board.js");
const { Sheet, SheetLog } = require("../../models/Sheet.js");
const CONSTANTS = require("../../constants/constants.js");
const { Subject, SubjectLevel } = require("../../models/Subject.js");
const services = require("../../services/index.js");
const {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
} = require("../../validations/PPMSupervisorValidations.js");
const httpStatus = require("http-status");
const { User, Roles } = require("../../models/User.js");

const PastPaperSupervisorController = {
  //take care of isarchived and ispublished later
  async CreateSheet(req, res, next) {
    try {
      const { boardId, subBoardId, grade, subjectId, subjectLevelId, year, season, varient, paperNumber, resources, supervisorId,
      } = req.body;

      const sheet = await Sheet.create({ boardId, subBoardId, grade, subjectId, subjectLevelId, year, season, varient, paperNumber, resources, supervisorId,
      });

      return res.json({ 
        status: 200,
        sheet 
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async UpdateSheet(req, res, next) {
    try {

      const { sheetId, boardId, subBoardId, grade, subjectId, subjectLevelId, year, season, varient, paperNumber, resources, supervisorId } = req.body;
  
      // Find the sheet with the given ID
      const sheet = await Sheet.findByPk(sheetId);
  
      // Update the sheet's values with the provided data
      sheet.boardId = boardId;
      sheet.subBoardId = subBoardId;
      sheet.grade = grade;
      sheet.subjectId = subjectId;
      sheet.subjectLevelId = subjectLevelId;
      sheet.year = year;
      sheet.season = season;
      sheet.varient = varient;
      sheet.paperNumber = paperNumber;
      sheet.resources = resources;
      sheet.supervisorId = supervisorId;
  
      // Save the updated sheet
      await sheet.save();
  
      return res.json({ 
        status: 200,
        message: "Sheet Updated Successfully",
        sheet 
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getallboards(req, res) {
    try {
      const distinctBoardIds = await Subject.findAll({
        attributes: ["boardId"],
        group: ["boardId"],
      });

      const boardIds = distinctBoardIds.map((board) => board.boardId);

      const boards = await Board.findAll({
        attributes: ["id", "boardName"],
        where: {
          id: boardIds,
        },
      });

      const boardNames = boards.map((board) => board.dataValues);

      return res.json({ status: 200, boardNames });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getallsubboards(req, res) {
    const boardId = req.params.boardId;
    try {
      const distinctSubBoardIds = await Subject.findAll({
        attributes: ["subBoardId"],
        group: ["subBoardId"],
      });
      const subboardIds = distinctSubBoardIds.map(
        (subboard) => subboard.SubBoardId
      );
      const subboards = await SubBoard.findAll({
        attributes: ["id", "subBoardName"],
        where: {
          id: subboardIds,
          boardId,
        },
      });
      console.log(subboards);
      const subboardNames = subboards.map((subboard) => subboard.dataValues);
      return res.json({ status: 200, subboardNames });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getallgrades(req, res) {
    const boardId = req.params.boardId;
    const SubBoardId = req.params.SubBoardId;
    try {
      const distinctgrades = await Subject.findAll({
        attributes: ["grade"],
        where: {
          boardId,
          SubBoardId,
        },
        group: ["grade"],
      });

      return res.json({ status: 200, distinctgrades });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getallsubjects(req, res) {
    try {
      const boardId = req.params.boardId;
      const SubBoardId = req.params.SubBoardId;
      const grade = req.params.grade;

      const distinctsubjects = await Subject.findAll({
        attributes: ["subjectName", "id"],
        where: {
          boardId,
          SubBoardId,
          grade,
          isArchived: false,
          isPublished: true,
        },
        group: ["subjectName", "id"],
      });

      return res.json({ status: 200, distinctsubjects });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getalllevels(req, res) {
    try {
      const subjectId = req.params.subjectid;
      const levels = await SubjectLevel.findAll({
        attributes: ["subjectLevelName", "id"],
        where: {
          subjectId,
          isArchived: false,
        },
      });

      return res.json({ status: 200, levels });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getallsheetsubjects(req, res) {
    try {
      const distinctsubjectIds = await Sheet.findAll({
        attributes: ["subjectId"],
        group: ["subjectId"],
      });

      const subjectIds = distinctsubjectIds.map((subject) => subject.subjectId);

      const subjects = await Subject.findAll({
        attributes: ["id", "subjectName"],
        where: {
          id: subjectIds,
        },
      });

      const subjectNames = subjects.map((subject) => subject.dataValues);

      return res.json({ status: 200, subjectNames });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getsinglesheet(req, res) {
    const id = req.params.sheetid;
    try {
      const shetinfo = await Sheet.findAll({
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
        where: { id },
      });

      return res.json({ status: 200, shetinfo });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getSheetLogs(req, res, next) {
    const sheetId = req.query.id
    try {
      const sheetLogs = await services.sheetService.findSheetLog()
      res.status(httpStatus.OK).send({sheetLogs: sheetLogs})
    } catch (error) {
      next(error)
    }
  },

  async getAllUserByRole(req, res) { 
    const roleId = req.query.roleId;
    try {
      const users = await User.findAll({
        attributes: ["userName", "email", "Name"],
        where: { roleId },
        include: { all: true, nested: true },
      });
  
      return res.status(200).json({ users });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  async getallroles(req, res) {
    const roleId = req.params.roleId;
    try {
      const roles = await Roles.findAll({
        attributes: ["roleName", "id"],
      });
      return res.status(200).json({
        roles: roles,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  async TogglePublishSheet(req, res) {
    const id = req.params.sheetid;
    // const isPublished = req.body.isPublished;

    try {
      const sheet = await Sheet.findByPk(id);

      if (!sheet) {
        return res.status(404).json({ message: "sheet not found" });
      }

      sheet.isPublished = !(sheet.isPublished);
      sheet.isSpam = false;
      await sheet.save();

      return res.json({ status: 200, sheet });
    } catch (err) {
      return res.status(501).json({ error: err.message });
    }
  },

  async ToggleArchiveSheet(req, res) {
    const id = req.params.sheetid;
    // const isArchived = req.body.isArchived;
    try {
      const sheet = await Sheet.findByPk(id);

      if (!sheet) {
        return res.status(404).json({ message: "sheet not found" });
      }

      sheet.isArchived = true;
      await sheet.save();
      res.json({ status: 200, sheet });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async AssignSheetToPastPaper(req, res) {
    try {
      let values = await assignUploderUserToSheetSchema.validateAsync(req.body);

      // userData can later on come from middleware
      let userData = await services.userService.finduser(
        values.uploaderId,
        CONSTANTS.roleNames.PastPaper
      );

      let sheetData = await services.sheetService.findSheetAndUser(
        values.sheetId
      );

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assigned to past paper uploader

        if (sheetData.assignedToUserId === userData.id) {
          res
            .status(httpStatus.OK)
            .send({ mesage: "sheet already assigned to past paper uploader" });
        } else {
          //UPDATE sheet assignment & life cycle & sheet status

          let sheetStatusToBeUpdated = {
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForPastPaper: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: null,
          };

          let updateAssignAndLifeCycleAndStatus =
            await services.sheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
              sheetData.id,
              userData.id,
              CONSTANTS.roleNames.PastPaper,
              sheetStatusToBeUpdated.statusForSupervisor,
              sheetStatusToBeUpdated.statusForPastPaper
            );

          if (updateAssignAndLifeCycleAndStatus.length > 0) {
            responseMessage.assinedUserToSheet =
              "Sheet assigned to past paper and lifeCycle updated successfully";
            responseMessage.UpdateSheetStatus =
              "Sheet Statuses updated successfully";
          }

          // CREATE sheet log for sheet assignment to past paper uploader

          let createLog = await services.sheetService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToPastPaper
          );

          if (createLog) {
            responseMessage.sheetLog =
              "Log record for sheet assignment to uploader added successfully";
          }

          res.status(httpStatus.OK).send({ message: responseMessage });
        }
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  
  async AssignSheetToReviewer(req, res) {
    try {
      let values = await assignReviewerUserToSheetSchema.validateAsync(
        req.body
      );
      // userData can later on come from middleware
      let userData = await services.userService.finduser(values.reviewerId);

      let sheetData = await services.sheetService.findSheetAndUser(
        values.sheetId
      );

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assigned to past paper reviewer

        if (sheetData.assignedToUserId === userData.id) {
          res
            .status(httpStatus.OK)
            .send({ message: "sheet already assigned to reviewer" });
        } else {
          //UPDATE sheet assignment & life cycle & sheet status
          let sheetStatusToBeUpdated = {
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
          };

          let updateAssignAndUpdateLifeCycle =
            await services.sheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
              sheetData.id,
              userData.id,
              CONSTANTS.roleNames.Reviewer,
              sheetStatusToBeUpdated.statusForSupervisor,
              sheetStatusToBeUpdated.statusForReviewer
            );

          if (updateAssignAndUpdateLifeCycle.length > 0) {
            responseMessage.assinedUserToSheet =
              "Sheet assigned to reviewer and lifeCycle updated successfully";
            responseMessage.UpdateSheetStatus =
              "Sheet Statuses updated successfully";
          }

          // CREATE sheet log for sheet assignment to past paper uploader
          let createLog = await services.sheetService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer
          );

          if (createLog) {
            responseMessage.sheetLog =
              "Log record for sheet assignment to reviewer added successfully";
          }

          // Create Sheet CheckList
          let checkForPreviousCheckList =
            await services.sheetService.findCheckList(sheetData.id);

          if (checkForPreviousCheckList.length <= 0) {
            let createSheetCheckList =
              await services.sheetService.createSheetCheckList(sheetData.id);
            if (createSheetCheckList.length > 0) {
              responseMessage.CheckList = "Check List Created!";
            }
          }

          res.status(httpStatus.OK).send({ message: responseMessage });
        }
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ mesage: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
};

module.exports = PastPaperSupervisorController;
