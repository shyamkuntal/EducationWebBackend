const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName, s3Client } = require("../../config/s3.js");
const { PastPaper } = require("../../models/PastPaper.js");
//const { Sheet } = require("../../models/Sheet.js");
const dotenv = require("dotenv");
const { Sheet } = require("../../models/Sheet.js");
const { Subject } = require("../../models/Subject.js");

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
  async getAssignedSheets(req, res) {
    const assignedToUserId = req.params.userId;

    console.log(assignedToUserId);
    try {
      const allAssignedSheeets = await Sheet.findAll({
        where: { assignedToUserId },
      });

      return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
    } catch (error) {
      res.json({ status: 501, message: error.message });
    }
  },

  async createPastPaper(req, res) {
    const { paperNumber, googleLink, sheetId } = req.body;

    // Get the uploaded image buffer
    const imageBuffer = req.files["image"].buffer;

    // Get the uploaded PDF buffers
    const questionpdfBuffer = req.files["pdf"][0].buffer;
    const answerpdfBuffer = req.files["pdf"][1].buffer;

    // Upload the image buffer to S3
    const imagebanner = generateFileName();

    const imageUploadParams = {
      Bucket: bucketName,
      Body: imageBuffer,
      Key: imagebanner,
      ContentType: req.files["image"].mimetype,
    };
    const questionPdf = generateFileName();
    const answerPdf = generateFileName();
    // Upload each PDF buffer to S3

    const quepdfUploadParams = {
      Bucket: bucketName,
      Body: questionpdfBuffer,
      Key: questionPdf,
      ContentType: req.files["pdf"][0].mimetype,
    };
    const anspdfUploadParams = {
      Bucket: bucketName,
      Body: answerpdfBuffer,
      Key: answerPdf,
      ContentType: req.files["pdf"][1].mimetype,
    };

    try {
      // Upload the image buffer to S3
      await s3Client.send(new PutObjectCommand(imageUploadParams));

      // Upload the question PDF buffer to S3
      await s3Client.send(new PutObjectCommand(quepdfUploadParams));

      // Upload the answer PDF buffer to S3
      await s3Client.send(new PutObjectCommand(anspdfUploadParams));

      const pastpaper = await PastPaper.create({
        paperNumber,
        googleLink,
        imagebanner,
        questionPdf,
        answerPdf,
        sheetId,
      });
      const id = sheetId;
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

  async Markitascomplete(req, res) {
    const id = req.params.sheetId;

    try {
      const sheet = await Sheet.findByPk(id);

      sheet.statusForPastPaper = "Complete";
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

  async EditPastPaper(req, res) {
    try {
      res.send({});
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getdatafordashboard(req, res) {
    try {
      const assignedToUserId = req.params.userId;
      const sheet = await Sheet.findAll({ where: { assignedToUserId } });
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
};

module.exports = PastPaperUploaderController;
