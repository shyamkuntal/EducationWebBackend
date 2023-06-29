const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName, s3Client } = require("../../config/s3.js");
const { PastPaper } = require("../../models/PastPaper.js");
const services = require("../../services/index.js");
const dotenv = require("dotenv");
const { Sheet } = require("../../models/Sheet.js");
const {
  SubjectLevel,
  subjectName,
  Subject,
} = require("../../models/Subject.js");
const { SubBoard, Board } = require("../../models/Board.js");
const {
  createPastPaperSchema,
} = require("../../validations/PastPaperValidation.js");
const httpStatus = require("http-status");
const CONSTANTS = require('../../constants/constants.js');
const { getSubBoardsSchema } = require("../../validations/subjectManagementValidations.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getRecheckingComments } = require("../../validations/PPMReviewerValidation.js");

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
// export const getAssignedSheets = async (req, res) => {
//   const assignedTo = req.params.userId;
//   console.log(assignedTo);
//   try {
//     const allAssignedSheeets = await Sheet.findAll({ where: { assignedTo } });

//     return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
//   } catch (error) {
//     res.json({ status: 501, message: error.message });
//   }
// };

const PastPaperUploaderController = {
  async getdatafordashboard(req, res) {
    try {
      const assignedToUserId = req.params.userId;
      let userId = req.user.id;
      console.log(assignedToUserId);

      const sheet = await Sheet.findAll({
        where: { assignedToUserId: userId },
      });

      const totalsheet = await Sheet.count({
        where: { assignedToUserId, isSpam: false },
      });

      const sheetComplete = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "Complete",
          isSpam: false,
        },
      });
      const sheetNotStarted = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "NotStarted",
          isSpam: false,
        },
      });
      const sheetInProgress = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "InProgress",
          isSpam: false,
        },
      });

      const totalSpamsheet = await Sheet.count({
        where: { assignedToUserId, isSpam: true },
      });
      const spamSheetComplete = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "Complete",
          isSpam: true,
        },
      });
      const spamSheetNotStarted = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "NotStarted",
          isSpam: true,
        },
      });
      const spamSheetInProgress = await Sheet.count({
        where: {
          assignedToUserId,
          statusForPastPaper: "InProgress",
          isSpam: true,
        },
      });

      res.send({
        sheet,
        totalsheet: totalsheet,
        sheetComplete: sheetComplete,
        sheetNotStarted: sheetNotStarted,
        sheetInProgress: sheetInProgress,
        totalSpamsheet: totalSpamsheet,
        spamSheetComplete: spamSheetComplete,
        spamSheetNotStarted: spamSheetNotStarted,
        spamSheetInProgress: spamSheetInProgress,
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },
  
  async getAllboards(req, res, next) {
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

  async getAllSubBoards(req, res) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });

      let subBoards = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );
      return res.status(200).json(subBoards);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getAssignedSheets(req, res) {
    const assignedToUserId = req.params.userId;
    let userId = req.user.id;
    // console.log(assignedToUserId);
    try {
      const allAssignedSheeets = await Sheet.findAll({
        include: [
          {
            model: SubBoard,
            attributes: ["subBoardName"],
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
          {
            model: Subject,
            where: req.query.subjectNameId
              ? { subjectNameId: req.query.subjectNameId }
              : {},
            attributes: ["subjectNameId"],
          },
        ],
        where: { assignedToUserId: userId },
      });

      return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
    } catch (error) {
      res.json({ status: 501, message: error.message });
    }
  },

  async getUserAssignedSubjects(req, res, next) {
    try {
      let userId = req.query.userId;
      let userSubject = await services.userService.getUserAssignedSubjects(
        userId
      );
      res.status(httpStatus.OK).send(userSubject);
    } catch (error) {
      next(error);
    }
  },

  // async getsubjectName(req, res, next) {
  //   try {
  //     const subjectName = await services.subjectService.getSubjectNames();
  
  //     res.status(httpStatus.OK).send(subjectName);
  //   } catch (err) {
  //     next(err);
  //   }
  // },

  async getsinglesheet(req, res) {
    const id = req.params.sheetId;
    // const id = req.body.sheetId;
    try {
      const sheetinfo = await Sheet.findOne({
        include: [
          {
            model: SubBoard,
            attributes: ["subBoardName"],
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
          // {
          //   model: subjectName,
          //   attributes: ["subjectName"],
          //   required: false
          // },
        ],
        where: { id: id },
      });

      return res.json({ status: 200, sheetinfo });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getsubjectName(req, res, next) {
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
      console.log(err);
      next(err);
    }
  },

  
  async getRecheckErrors(req, res) {
    try {
      let reqVariables = { sheetId: req.query.sheetId };

      let values = await getRecheckingComments.validateAsync(reqVariables);

      let recheckingComments =
        await services.sheetService.findRecheckingComments(values.sheetId);

      res.status(httpStatus.OK).send(recheckingComments);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async createPastPaper(req, res, next) {    
    // console.log(req.files["questionPdf"])
    try {
      let values = await createPastPaperSchema.validateAsync({
        paperNumber: req.body.paperNumber,
        googleLink: req.body.googleLink,
        questionPdf: req.files["questionPdf"][0],
        answerPdf: req.files["answerPdf"][0],
        image: req.files["image"][0],
        sheetId: req.body.sheetId,
      });

      // console.log(values)
      // console.log(values.image.originalname)
   
    // Get the uploaded image buffer
    const imageBuffer = req.files["image"].buffer;

      // Get the uploaded PDF buffers
      const questionpdfBuffer = req.files["questionPdf"][0].buffer;

      const answerpdfBuffer = req.files["answerPdf"][0].buffer;

    // Upload the image buffer to S3
    const imagebanner = generateFileName(values.image.originalname);

    const imageUploadParams = {
      Bucket: bucketName,
      Body: imageBuffer,
      Key: imagebanner,
      ContentType: req.files["image"][0].mimetype,
    };
    const questionPdf = generateFileName(values.questionPdf.originalname);

    const answerPdf = generateFileName(values.answerPdf.originalname);
    // Upload each PDF buffer to S3
    const questionKey = "pastpaperquestions" + "/" + questionPdf
    const quepdfUploadParams = {
      Bucket: bucketName,
      Body: questionpdfBuffer,
      Key: questionKey,
      ContentType: req.files["questionPdf"][0].mimetype,
    };
    
    const answerKey = "pastpaperanswers" + "/" + answerPdf
    const anspdfUploadParams = {
      Bucket: bucketName,
      Body: answerpdfBuffer,
      Key: answerKey,
      ContentType: req.files["answerPdf"][0].mimetype,
    };
    // console.log(anspdfUploadParams)
    // console.log(quepdfUploadParams)
      // Upload the image buffer to S3
      await s3Client.send(new PutObjectCommand(imageUploadParams));

      // Upload the question PDF buffer to S3
      await s3Client.send(new PutObjectCommand(quepdfUploadParams));

      // Upload the answer PDF buffer to S3
      await s3Client.send(new PutObjectCommand(anspdfUploadParams));

      let pastpaper = await services.pastpaperService.createPastPaper(
        values.paperNumber,
        values.googleLink,
        values.questionPdf.fieldname,
        values.answerPdf.fieldname,
        values.image.fieldname,
        values.sheetId,
      );

      const id = values.sheetId;
      const sheet = await Sheet.findByPk(id);

      sheet.statusForPastPaper = "Inprogress";
      await sheet.save();

      return res.status(201).json({
        message: "Past Paper created successfully",
        pastpaper,
      });
    } catch (err) {
      console.log(err)
      next(err)
    }
},
        

  async SubmitToSupervisor(req, res, next) {
    // const assignedToUserId = req.params.userId;
    const id = req.body.sheetId;

    // let userData = await services.userService.finduser(
    //   values.reviewerId,
    //   CONSTANTS.roleNames.Reviewer
    // );
    
    console.log(id)
    try {
      const sheet = await Sheet.findByPk(id);
      console.log(sheet)
      if (sheet.statusForPastPaper !== CONSTANTS.sheetStatuses.Complete) {
        return res
          .status(200)
          .json({ msg: "Please mark it as complete first" });
      }

      sheet.statusForSupervisor = CONSTANTS.sheetStatuses.Complete;
     // CREATE sheet log for sheet assignment to supervisor
    //  let createLog = await services.sheetService.createSheetLog(
    //    id,
    //    sheetData.supervisor.Name,
    //    userData.Name,
    //    CONSTANTS.sheetLogsMessages.pastPaperrAssignToSupervisor
    //  );

      await sheet.save();
      return res.status(201).json({
        message: "Sheet Submitted successfully",
        sheet,
      });
    } catch (err) {
    console.log(err)
    next(err)
      // return res.json({ status: 501, error: err.message });
    }
  },

  async MarkitasInProgress(req, res) {
    const id = req.body.sheetId;

    try {
      const sheet = await Sheet.findByPk(id);

      sheet.statusForPastPaper = CONSTANTS.sheetStatuses.InProgress;
      await sheet.save();
      return res.status(201).json({
        message: "Sheet marked in Progress successfully",
        sheet,
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async Markitascomplete(req, res) {
    const id = req.body.sheetId;

    try {
      const sheet = await Sheet.findByPk(id);

      sheet.statusForPastPaper = CONSTANTS.sheetStatuses.Complete;
      await sheet.save();
      return res.status(201).json({
        message: "Sheet marked complete successfully",
        sheet,
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getallassignedsheetsubjects(req, res) {
    const assignedToUserId = req.params.userId;
    try {
      const distinctsubjectIds = await Sheet.findAll({
        attributes: ["subjectId"],
        group: ["subjectId"],
        where: { assignedToUserId },
      });

      const subjectIds = distinctsubjectIds.map((subject) => subject.subjectId);

      const subjects = await Subject.findAll({
        attributes: ["id"],
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

  async EditPastPaper(req, res) {
    try {
      res.send({});
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },
};

module.exports = PastPaperUploaderController;
