const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName, s3Client } = require("../../config/s3.js");
const { PastPaper } = require("../../models/PastPaper.js");
const services = require("../../services/index.js");
//const { Sheet } = require("../../models/Sheet.js");
const dotenv = require("dotenv");
const { Sheet } = require("../../models/Sheet.js");
const { SubjectLevel, subjectName, Subject } = require("../../models/Subject.js");
const { SubBoard, Board } = require("../../models/Board.js");
const {createPastPaperSchema} = require("../../validations/PastPaperValidation.js");

const CONSTANTS = require('../../constants/constants.js')

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

      const sheet = await Sheet.findAll({ where: { assignedToUserId:userId } });

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
        ],
        where: { assignedToUserId:userId },
      });

      return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
    } catch (error) {
      res.json({ status: 501, message: error.message });
    }
  },

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
        where: { id:id },
      });

      return res.json({ status: 200, sheetinfo });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async createPastPaper(req, res, next) {    
    
    let values = await createPastPaperSchema.validateAsync({
      paperNumber: req.body.paperNumber,
      googleLink: req.body.googleLink,
      image: req.files["image"][0],
      questionPdf: req.files["questionPdf"][0],
      answerPdf: req.files["answerPdf"][0],
      sheetId: req.body.sheetId,
    });
    console.log(values)

    // Get the uploaded image buffer
    const imageBuffer = req.files["image"].buffer;

    // Get the uploaded PDF buffers
    const questionpdfBuffer = req.files["questionPdf"][0].buffer;
    const answerpdfBuffer = req.files["answerPdf"][0].buffer;

    // Upload the image buffer to S3
    const imagebanner = generateFileName();

    const imageUploadParams = {
      Bucket: bucketName,
      Body: imageBuffer,
      Key: imagebanner,
      ContentType: req.files["image"][0].mimetype,
    };
    const questionPdf = generateFileName();
    const answerPdf = generateFileName();
    // Upload each PDF buffer to S3

    const quepdfUploadParams = {
      Bucket: bucketName,
      Body: questionpdfBuffer,
      Key: questionPdf,
      ContentType: req.files["questionPdf"][0].mimetype,
    };
    const anspdfUploadParams = {
      Bucket: bucketName,
      Body: answerpdfBuffer,
      Key: answerPdf,
      ContentType: req.files["answerPdf"][0].mimetype,
    };

    try {
      // Upload the image buffer to S3
      await s3Client.send(new PutObjectCommand(imageUploadParams));

      // Upload the question PDF buffer to S3
      await s3Client.send(new PutObjectCommand(quepdfUploadParams));

      // Upload the answer PDF buffer to S3
      await s3Client.send(new PutObjectCommand(anspdfUploadParams));

      let pastpaper = await services.pastpaperService.createPastPaper(
        values.paperNumber,
        values.googleLink,
        values.image.fieldname,
        values.answerPdf.fieldname,
        values.questionPdf.fieldname,
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
      return res.json({ status: 501, error: err.message });
    }
},
        

  async SubmitToSupervisor(req, res) {
    //const assignedToUserId = req.params.userId;
    const id = req.params.sheetId;

    try {
      const sheet = await Sheet.findByPk(id);
      if (sheet.statusForPastPaper !== "Complete") {
        return res
          .status(200)
          .json({ msg: "Please mark it as complete first" });
      }
      sheet.statusForSupervisor = "Complete";
      await sheet.save();
      return res.status(201).json({
        message: "Sheet Submitted successfully",
        sheet,
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
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
