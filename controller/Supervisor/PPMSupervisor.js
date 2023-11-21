const { Board, SubBoard } = require("../../models/Board.js");
const { Sheet, SheetLog } = require("../../models/PastPaperSheet.js");
const CONSTANTS = require("../../constants/constants.js");
const { Subject, SubjectLevel } = require("../../models/Subject.js");
const services = require("../../services/index.js");
const {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
  getUserAssignedSubjectsSchema,
  getSheetLogsSchema,
  getPastPaperSchema,
  createVariantSchema,
  editVariantSchema,
  createPastPaperSheetSchema,
} = require("../../validations/PPMSupervisorValidations.js");
const httpStatus = require("http-status");
const { User, Roles, UserBoardMapping, UserSubBoardMapping, UserModuleMapping } = require("../../models/User.js");
const {
  getSubBoardsSchema,
  getSubjectLevelBySubjectId,
} = require("../../validations/subjectManagementValidations.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../../config/s3.js");
const { Variant } = require("../../models/Variants.js");
const db = require("../../config/database.js");
const { ApiError } = require("../../middlewares/apiError.js");
const { BookTask } = require("../../models/BookTask.js");
const { TopicTask } = require("../../models/TopicTask.js");
const { PaperNumberSheet } = require("../../models/PaperNumberSheet.js");
const { SheetManagement } = require("../../models/SheetManagement.js");

const PastPaperSupervisorController = {
  async CreateSheet(req, res, next) {
    try {
      let values = await createPastPaperSheetSchema.validateAsync(req.body);

      const sheet = await Sheet.create({
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        grade: values.grade,
        subjectId: values.subjectId,
        subjectLevelId: values.subjectLevelId,
        year: values.year,
        season: values.season,
        variantId: values.variantId,
        paperNumberId: values.paperNumberId,
        paperNumber: values.paperNumber,
        resources: values.resources,
        supervisorId: values.supervisorId,
      });

      return res.json({
        status: 200,
        sheet,
      });
    } catch (err) {
      next(err);
    }
  },

  async UpdateSheet(req, res, next) {
    try {
      const {
        sheetId,
        boardId,
        subBoardId,
        grade,
        subjectId,
        subjectLevelId,
        year,
        season,
        varient,
        paperNumber,
        resources,
        supervisorId,
      } = req.body;

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
        sheet,
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserAssignedSubjects(req, res, next) {
    try {
      let values = await getUserAssignedSubjectsSchema.validateAsync({ userId: req.query.userId });

      let userSubject = await services.userService.getUserAssignedSubjects(values.userId);

      res.status(httpStatus.OK).send(userSubject);
    } catch (error) {
      next(error);
    }
  },

  async getSubjectNames(req, res, next) {
    try {
      const subjectName = await services.subjectService.getSubjectNames();
      let subjectDetails = [];

      for (const element of subjectName) {
        const getObjectParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: element.subjectImage,
        };
        const command = new GetObjectCommand(getObjectParams);

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        subjectDetails.push({
          ...element,
          subjectImageUrl: url,
        });
      }

      res.status(httpStatus.OK).send(subjectDetails);
    } catch (err) {
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
      const subboardIds = distinctSubBoardIds.map((subboard) => subboard.SubBoardId);
      const subboards = await SubBoard.findAll({
        attributes: ["id", "subBoardName"],
        where: {
          id: subboardIds,
          boardId,
        },
      });
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

  async getalllevels(req, res, next) {
    try {
      let values = await getSubjectLevelBySubjectId.validateAsync({
        subjectId: req.query.subjectId,
      });
      let whereQuery = { subjectId: values.subjectId, isArchived: false };

      let subjectLevels = await services.subjectService.findSubjectLevels(whereQuery);

      res.status(httpStatus.OK).send(subjectLevels);
    } catch (err) {
      next(err);
    }
  },

  async getAllboards(req, res, next) {
    try {
      let attributes = ["id", "boardName", "boardType"];
      let boards = await services.boardService.findAllBoards(attributes);
      res.status(httpStatus.OK).send(boards);
    } catch (err) {
      next(err);
    }
  },

  async getAllSubBoards(req, res) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });

      let subBoards = await services.boardService.getSubBoardsByBoardId(values.boardId);
      return res.status(200).json(subBoards);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getUsers(req, res, next) {
    const roleId = [
      "ce4afb0a-91b3-454a-a515-70c3cbb7b69b",
      "c0ac1044-4d52-4305-b764-02124bd66434",
      "d8c85c70-e492-4bef-9c61-16c295ce1cb4",
      "b6e9d917-f5e4-4268-a364-cfb715439fbb",
      "9ce70cfd-632b-49f6-8cdc-842dc30f1aaa",
    ];
    // console.log(req.query)

    try {
      const users = await User.findAll({
        attributes: ["id", "Name"],
        where: { roleId: roleId, isActive: true },
        // include: { all: true, nested: true },
      });

      return res.status(200).json({ users });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
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
    try {
      let values = await getSheetLogsSchema.validateAsync({
        sheetId: req.query.sheetId,
      });
      const sheetLogs = await services.sheetService.findSheetLog(values.sheetId);
      res.status(httpStatus.OK).send({ sheetLogs: sheetLogs });
    } catch (error) {
      next(error);
    }
  },

  async getAllUserByRole(req, res) {
    const roleId = req.query.roleId;
    try {
      const users = await User.findAll({
        attributes: ["id", "userName", "email", "Name"],
        where: { roleId, isActive: true },
        include: [
          {
            model: BookTask,
            as: "bookTasks",
            attributes: ["statusForDataGenerator", "statusForReviewer"]
          },
          {
            model: Sheet,
            as: "PastPaperSheets",
            attributes: ["statusForPastPaper", "statusForReviewer"]
          },
          {
            model: TopicTask,
            as: "topicTasks",
            attributes: ["statusForDataGenerator", "statusForReviewer"]
          },
          {
            model: PaperNumberSheet,
            as: "paperNumberSheets",
            attributes: ["statusForDataGenerator", "statusForReviewer"]
          },
          {
            model: SheetManagement,
            as: "sheetManagements",
            attributes: ["statusForUploader", "statusForReviewer"]
          },
        ],
      });

      return res.status(200).json({ users });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  async getAllUserMappingData(req, res) {
    const {roleId, userId} = req.query;
    try {
      const users = await User.findAll({
        attributes: ["id", "userName", "email", "Name"],
        where: { id: userId, roleId },
        include: [
          {
            model: UserBoardMapping,
            as: "UserBoardMapping",
            attributes: ["boardId"]
          },
          {
            model: UserSubBoardMapping,
            as: "UserSubBoardMapping",
            attributes: ["statusForPastPaper", "subBoardId"]
          },
          {
            model: UserModuleMapping,
            as: "UserModuleMapping",
            attributes: ["statusForDataGenerator", "statusForReviewer"]
          },
          {
            model: Subject,
            as: "subject",
            attributes: ["statusForDataGenerator", "statusForReviewer"]
          },
        ],
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

  async getPaperNumberbyBoardSubBoardGradeSubject(req, res, next) {
    try {
      let values = {
        boardId: req.query.boardId,
        subBoardId: req.query.subBoardId,
        grade: req.query.grade,
        subjectId: req.query.subjectId,
      };
      let paperNumberDetails =
        await services.paperNumberSheetService.findPaperNumberbyBoardSubBoardGradeSubject({
          boardId: values.boardId,
          subBoardId: values.subBoardId,
          grade: values.grade,
          subjectId: values.subjectId,
        });

      res.status(httpStatus.OK).send(paperNumberDetails);
    } catch (err) {
      next(err);
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

      sheet.isPublished = !sheet.isPublished;
      sheet.isSpam = false;
      await sheet.save();

      return res.json({ status: 200, sheet });
    } catch (err) {
      return res.status(501).json({ error: err.message });
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

      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      let Comment = values.supervisorComments;

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

          let dataToBeUpdated = {
            assignedToUserId: userData.id,
            pastPaperId: userData.id,
            lifeCycle: CONSTANTS.roleNames.PastPaper,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForPastPaper: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToPastPaper: values.supervisorComments,
            assignOn: new Date(),
          };

          let whereQuery = { where: { id: sheetData.id } };

          let updateAssignAndLifeCycleAndStatus = await services.sheetService.updateSheet(
            dataToBeUpdated,
            whereQuery
          );

          if (updateAssignAndLifeCycleAndStatus.length > 0) {
            responseMessage.assinedUserToSheet =
              "Sheet assigned to past paper and lifeCycle updated successfully";
            responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            responseMessage.updateComment = "Supervisor comment added successfully";
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
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  async AssignSheetToReviewer(req, res) {
    try {
      let values = await assignReviewerUserToSheetSchema.validateAsync(req.body);
      // userData can later on come from middleware
      let userData = await services.userService.finduser(values.reviewerId);

      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assigned to past paper reviewer

        if (sheetData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "sheet already assigned to reviewer" });
        } else {
          //UPDATE sheet assignment & life cycle & sheet status

          let dataToBeUpdated = {
            assignedToUserId: userData.id,
            reviewerId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Reviewer,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToReviewer: values.supervisorComments,
            assignOn: new Date(),
          };

          let whereQuery = { where: { id: sheetData.id } };

          let updateAssignAndUpdateLifeCycle = await services.sheetService.updateSheet(
            dataToBeUpdated,
            whereQuery
          );

          if (updateAssignAndUpdateLifeCycle.length > 0) {
            responseMessage.assinedUserToSheet =
              "Sheet assigned to reviewer and lifeCycle updated successfully";
            responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            responseMessage.updateComment = "Supervisor comment added successfully";
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
          let checkForPreviousCheckList = await services.sheetService.findCheckList(sheetData.id);

          if (checkForPreviousCheckList.length <= 0) {
            let createSheetCheckList = await services.sheetService.createSheetCheckList(
              sheetData.id
            );
            if (createSheetCheckList.length > 0) {
              responseMessage.CheckList = "Check List Created!";
            }
          }

          res.status(httpStatus.OK).send({ message: responseMessage });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ mesage: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  async getPastPaper(req, res, next) {
    try {
      let values = await getPastPaperSchema.validateAsync({
        sheetId: req.query.sheetId,
      });

      let pastPaper = await services.pastpaperService.findPastPaper({
        where: { sheetId: values.sheetId },
        attributes: ["id", "questionPdf", "answerPdf", "imagebanner", "paperNumber", "googleLink"],
        raw: true,
      });

      // console.log(pastPaper);

      if (pastPaper.length > 0) {
        const getQuestionPaperParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: pastPaper[0].questionPdf,
        };

        const getImageBannerParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: pastPaper[0].imagebanner,
        };

        const getAnswerPaperParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: pastPaper[0].answerPdf,
        };

        // get question paper
        const questionPapercommand = new GetObjectCommand(getQuestionPaperParams);
        const questionPaperUrl = await getSignedUrl(s3Client, questionPapercommand, {
          expiresIn: 3600,
        });

        // get answer paper
        const answerPapercommand = new GetObjectCommand(getAnswerPaperParams);
        const answerPaperUrl = await getSignedUrl(s3Client, answerPapercommand, {
          expiresIn: 3600,
        });

        // get image banner
        const imageBannercommand = new GetObjectCommand(getImageBannerParams);
        const imageBannerUrl = await getSignedUrl(s3Client, imageBannercommand, {
          expiresIn: 3600,
        });

        res.status(httpStatus.OK).send({
          ...pastPaper[0],
          questionPdfUrl: questionPaperUrl,
          answerPdfUrl: answerPaperUrl,
          imageBannerUrl: imageBannerUrl,
        });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Past Paper not found" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async createVariant(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await createVariantSchema.validateAsync(req.body);

      let checkVariantName = await Variant.findOne({ where: { name: values.name } });

      if (checkVariantName) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Varaint already exists");
      }

      let newVariant = await Variant.create({ name: values.name }, { transaction: t });

      await t.commit();
      res.status(httpStatus.OK).send(newVariant);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async getAllVariants(req, res, next) {
    const t = await db.transaction();
    try {
      let results = await Variant.findAll();

      await t.commit();
      res.status(httpStatus.OK).send(results);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteVariant(req, res, next) {
    const t = await db.transaction();
    try {
      let values;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editVariant(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await editVariantSchema.validateAsync(req.body);

      let checkVariantName = await Variant.findOne({ where: { name: values.newName } });

      if (checkVariantName) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Varaint by this name already exists!");
      }

      await Variant.update({ name: values.newName }, { where: { id: values.variantId } });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Variant Updated Successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async getCountsCardData(req, res, next) {
    try {
      const { assignedToUserId } = req.query;

      const activeSheets = await Sheet.findAll({
        where: {
          assignedToUserId: assignedToUserId,
        },
      });

      let countsBySubject = {};
      activeSheets.forEach((sheet) => {
        const subjectId = sheet.subjectId;

        if (!countsBySubject[subjectId]) {
          countsBySubject[subjectId] = {
            subjectId: subjectId,
            InProgress: 0,
            NotStarted: 0,
            Complete: 0,
          };
        }

        if (sheet.lifeCycle === "DataGenerator") {
          switch (sheet.statusForDataGenerator) {
            case "InProgress":
              countsBySubject[subjectId].InProgress++;
              break;
            case "NotStarted":
              countsBySubject[subjectId].NotStarted++;
              break;
            case "Complete":
              countsBySubject[subjectId].Complete++;
              break;
          }
        } else if (sheet.lifeCycle === "Reviewer") {
          switch (sheet.statusForReviewer) {
            case "InProgress":
              countsBySubject[subjectId].InProgress++;
              break;
            case "NotStarted":
              countsBySubject[subjectId].NotStarted++;
              break;
            case "Complete":
              countsBySubject[subjectId].Complete++;
              break;
          }
        }
      });

      // Convert the countsBySubject object into an array of objects
      const countsArray = Object.values(countsBySubject);

      res.send(countsArray);
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async ToggleArchiveSheet(req, res) {
    const id = req.query.sheetId;
    try {
      const sheet = await Sheet.findByPk(id);

      if (!sheet) {
        return res.status(404).json({ message: "sheet not found" });
      }

      sheet.isArchived = true;
      sheet.isSpam = false;
      await sheet.save();
      res.json({ status: 200, sheet });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },
};

module.exports = PastPaperSupervisorController;
