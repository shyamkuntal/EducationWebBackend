const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName, s3Client } = require("../../config/s3.js");
const { PastPaper } = require("../../models/PastPaper.js");
const services = require("../../services/index.js");
const dotenv = require("dotenv");
const { Sheet } = require("../../models/PastPaperSheet.js");
const { SubjectLevel, subjectName, Subject } = require("../../models/Subject.js");
const { SubBoard, Board } = require("../../models/Board.js");
const {
  createPastPaperSchema,
  assignSupervisorUserToSheetSchema,
  editPastPaperSchema,
  getErrorReportFileSchema,
} = require("../../validations/PastPaperValidation.js");

const httpStatus = require("http-status");

const CONSTANTS = require("../../constants/constants.js");

const { getRecheckingComments } = require("../../validations/PPMReviewerValidation.js");

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;

const PastPaperUploaderController = {
  async getdatafordashboard(req, res) {
    try {
      const assignedToUserId = req.params.userId;
      let userId = req.user.id;

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
            where: req.query.subjectNameId ? { subjectNameId: req.query.subjectNameId } : {},
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
      let userSubject = await services.userService.getUserAssignedSubjects(userId);
      res.status(httpStatus.OK).send(userSubject);
    } catch (error) {
      next(error);
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
        where: { id: id },
      });

      return res.json({ status: 200, sheetinfo });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getRecheckErrors(req, res) {
    try {
      let reqVariables = { sheetId: req.query.sheetId };

      let values = await getRecheckingComments.validateAsync(reqVariables);

      let recheckingComments = await services.sheetService.findRecheckingComments(values.sheetId);

      res.status(httpStatus.OK).send(recheckingComments);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async createPastPaper(req, res, next) {
    try {
      let values = await createPastPaperSchema.validateAsync({
        paperNumber: req.body.paperNumber,
        googleLink: req.body.googleLink,
        questionPdf: req.files["questionPdf"][0],
        answerPdf: req.files["answerPdf"][0],
        image: req.files["image"][0],
        sheetId: req.body.sheetId,
      });

      // Get the uploaded image buffer
      const imageBuffer = req.files["image"][0].buffer;

      // Get the uploaded PDF buffers
      const questionpdfBuffer = req.files["questionPdf"][0].buffer;

      const answerpdfBuffer = req.files["answerPdf"][0].buffer;

      // Upload the image buffer to S3
      const imagebanner = generateFileName(values.image.originalname);

      const imageBannerKey =
        process.env.AWS_BUCKET_PASTPAPER_IMAGE_BANNER_FOLDER + "/" + imagebanner;

      const imageUploadParams = {
        Bucket: bucketName,
        Body: imageBuffer,
        Key: imageBannerKey,
        ContentType: req.files["image"][0].mimetype,
      };
      const questionPdf = generateFileName(values.questionPdf.originalname);

      const answerPdf = generateFileName(values.answerPdf.originalname);
      // Upload each PDF buffer to S3
      const questionKey = process.env.AWS_BUCKET_PASTPAPER_QUESTIONS_FOLDER + "/" + questionPdf;

      const quepdfUploadParams = {
        Bucket: bucketName,
        Body: questionpdfBuffer,
        Key: questionKey,
        ContentType: req.files["questionPdf"][0].mimetype,
      };

      const answerKey = process.env.AWS_BUCKET_PASTPAPER_ANSWERS_FOLDER + "/" + answerPdf;

      const anspdfUploadParams = {
        Bucket: bucketName,
        Body: answerpdfBuffer,
        Key: answerKey,
        ContentType: req.files["answerPdf"][0].mimetype,
      };

      // Upload the image buffer to S3
      await s3Client.send(new PutObjectCommand(imageUploadParams));

      // Upload the question PDF buffer to S3
      await s3Client.send(new PutObjectCommand(quepdfUploadParams));

      // Upload the answer PDF buffer to S3
      await s3Client.send(new PutObjectCommand(anspdfUploadParams));

      let pastpaper = await services.pastpaperService.createPastPaper(
        values.paperNumber,
        values.googleLink,
        questionKey,
        answerKey,
        imageBannerKey,
        values.sheetId
      );

      const id = values.sheetId;
      const sheet = await Sheet.findByPk(id);

      sheet.statusForPastPaper = CONSTANTS.sheetStatuses.InProgress;
      await sheet.save();

      return res.status(201).json({
        message: "Past Paper created successfully",
        pastpaper,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async SubmitToSupervisor(req, res, next) {
    try {
      let values = await assignSupervisorUserToSheetSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.pastPaperId,
        CONSTANTS.roleNames.PastPaper
      );

      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assingned to supervisor
        if (sheetData.assignedToUserId === sheetData.supervisorId) {
          res.status(httpStatus.BAD_REQUEST).send({
            message: "Sheet already assigned to supervisor",
          });
        } else {
          // Checking if sheet status is complete for reviewer
          if (sheetData.statusForPastPaper !== CONSTANTS.sheetStatuses.Complete) {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Please mark it as complete first",
            });
          } else {
            //UPDATE sheet assignment & sheet status
            let sheetStatusToBeUpdated = {
              statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
            };

            let updateAssignAndStatus =
              await services.sheetService.assignSupervisorToSheetAndUpdateStatus(
                sheetData.id,
                sheetData.supervisorId,
                sheetStatusToBeUpdated.statusForSupervisor
              );

            if (updateAssignAndStatus.length > 0) {
              responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
              responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            }

            // CREATE sheet log for sheet assignment to supervisor
            let createLog = await services.sheetService.createSheetLog(
              sheetData.id,
              sheetData.supervisor.Name,
              userData.Name,
              CONSTANTS.sheetLogsMessages.pastPaperrAssignToSupervisor
            );

            if (createLog) {
              responseMessage.sheetLog =
                "Log record for assignment to supervisor added successfully";
            }

            res.status(httpStatus.OK).send({ message: responseMessage });
          }
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
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

  async EditPastPaper(req, res, next) {
    try {
      let questionFile = req.files["newQuestionPaper"];
      let answerFile = req.files["newAnswerPaper"];
      let imageBannerFile = req.files["newImageBanner"];

      let values = await editPastPaperSchema.validateAsync({
        ...req.body,
        newQuestionPaper: questionFile ? questionFile[0] : null,
        newAnswerPaper: answerFile ? answerFile[0] : null,
        newImageBanner: imageBannerFile ? imageBannerFile[0] : null,
      });

      let pastPaper = await services.pastpaperService.findPastPaper({
        where: { sheetId: values.sheetId },
        raw: true,
      });

      if (pastPaper.length > 0) {
        let newQuestionPaperKey = "";
        let newAnswerPaperKey = "";
        let newImageBannerKey = "";

        let dataToBeUpdated = {
          paperNumber: values.paperNumber,
        };
        if (values.newQuestionPaper) {
          // Files Buffers
          const newQuestionPaperBuffer = values.newQuestionPaper.buffer;

          // Generate File Names
          const newQuestionPaperName = generateFileName(values.newQuestionPaper.originalname);

          //Add Folder S3 Folder Names to file Names
          newQuestionPaperKey =
            process.env.AWS_BUCKET_PASTPAPER_QUESTIONS_FOLDER + "/" + newQuestionPaperName;

          //Upload Parameters for all files
          const newQuestionPaperUploadParams = {
            Bucket: bucketName,
            Body: newQuestionPaperBuffer,
            Key: newQuestionPaperKey,
            ContentType: values.newQuestionPaper.mimetype,
          };

          await s3Client.send(new PutObjectCommand(newQuestionPaperUploadParams));

          dataToBeUpdated.questionPdf = newQuestionPaperKey;

          // Deleting Previous Pastpaper Files

          let deleteQuestionPaperParams = {
            Bucket: bucketName,
            Key: pastPaper[0].questionPdf,
          };

          await s3Client.send(new DeleteObjectCommand(deleteQuestionPaperParams));
        }

        if (values.newAnswerPaper) {
          // Files Buffers

          const newAnswerPaperBuffer = values.newAnswerPaper.buffer;

          // Generate File Names

          const newAnswerPaperName = generateFileName(values.newAnswerPaper.originalname);

          //Add Folder S3 Folder Names to file Names

          newAnswerPaperKey =
            process.env.AWS_BUCKET_PASTPAPER_ANSWERS_FOLDER + "/" + newAnswerPaperName;

          //Upload Parameters for all files

          const newAnswerPaperUploadParams = {
            Bucket: bucketName,
            Body: newAnswerPaperBuffer,
            Key: newAnswerPaperKey,
            ContentType: values.newAnswerPaper.mimetype,
          };

          await s3Client.send(new PutObjectCommand(newAnswerPaperUploadParams));
          dataToBeUpdated.answerPdf = newAnswerPaperKey;

          // Deleting Previous Pastpaper Files
          let deleteAnswerPaperParams = {
            Bucket: bucketName,
            Key: pastPaper[0].answerPdf,
          };

          await s3Client.send(new DeleteObjectCommand(deleteAnswerPaperParams));
        }

        if (values.newImageBanner) {
          // Files Buffers

          const newImageBannerBuffer = values.newImageBanner.buffer;

          // Generate File Names

          const newImageBannerName = generateFileName(values.newImageBanner.originalname);

          //Add Folder S3 Folder Names to file Names

          newImageBannerKey =
            process.env.AWS_BUCKET_PASTPAPER_IMAGE_BANNER_FOLDER + "/" + newImageBannerName;

          //Upload Parameters for all files

          const newImageBannerUploadParams = {
            Bucket: bucketName,
            Body: newImageBannerBuffer,
            Key: newImageBannerKey,
            ContentType: values.newImageBanner.mimetype,
          };

          await s3Client.send(new PutObjectCommand(newImageBannerUploadParams));

          dataToBeUpdated.imagebanner = newImageBannerKey;

          // Deleting Previous Pastpaper Files
          let deleteImageBannerParams = {
            Bucket: bucketName,
            Key: pastPaper[0].imagebanner,
          };

          await s3Client.send(new DeleteObjectCommand(deleteImageBannerParams));
        }

        // Update PastPaper

        let whereQuery = {
          where: { id: pastPaper[0].id },
        };

        let updatePastPaper = await services.pastpaperService.updatePastPaper(
          dataToBeUpdated,
          whereQuery
        );

        res.status(httpStatus.OK).send({ message: "PastPaper Updated Successfully!" });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "PastPaper not found!" });
      }
    } catch (err) {
      next(err);
    }
  },

  async getErrorReportFiles(req, res, next) {
    try {
      let values = await getErrorReportFileSchema.validateAsync({ sheetId: req.query.sheetId });

      let sheetData = await services.sheetService.findSheet(values.sheetId);

      if (sheetData) {
        let fileUrl = await services.sheetService.getFilesUrlFromS3(sheetData.errorReportImg);

        res.status(200).send({
          errorReportFile: sheetData.errorReportImg,
          errorReportFileUrl: fileUrl,
        });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Sheet not found!" });
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PastPaperUploaderController;
