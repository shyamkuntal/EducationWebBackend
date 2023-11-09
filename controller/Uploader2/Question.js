const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { McqQuestionOption } = require("../../models/McqQuestionOption");
const { TrueFalseQuestionOption } = require("../../models/TrueFalseQuestionOption");
const {
  McqSchema,
  createQuestionsSchema,
  createTextQuestionSchema,
  createFillDropDownQuestionOptionsSchema,
  addFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionOptionsSchema,
  getFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionSchema,
  editFillDropDownQuestionOptionsSchema,
  deleteQuestionSchema,
  editQuestionSchema,
  createMatchQuestionPairsSchema,
  editMatchQuestionPairsSchema,
  addMatchQuestionPairSchema,
  createDrawingQuestionSchema,
  editDrawingQuestionSchema,
  deleteMatchPairSchema,
  createLabelDragQuestionSchema,
  editLabelDragQuestionSchema,
  createLabelFillQuestionSchema,
  editLabelFillQuestionSchema,
  createGeogebraGraphQuestionSchema,
  editGeogebraGraphQuestionSchema,
  createDesmosGraphQuestionSchema,
  editDesmosGraphQuestionSchema,
  createHotSpotQuestionSchema,
  editHotSpotQuestionSchema,
  createSortQuestionSchema,
  editSortQuestionSchema,
  addSortQuestionOptionSchema,
  deleteSortQuestionOptionSchema,
} = require("../../validations/QuestionManagementValidation");
const {
  getQuestionsSchema,
  updateSheetStatusSchema,
  submitSheetToSupervisorSchema,
} = require("../../validations/SheetManagementUploaderValidations");

const { Question } = require("../../models/Question");
const { QuestionContent } = require("../../models/QuestionContent");
const { s3Client } = require("../../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { QuestionItem } = require("../../models/items");
const { QuestionCategory } = require("../../models/category");
const { TableQuestion } = require("../../models/Table");
const { Accordian } = require("../../models/accordianItems");
const { MatchQuestionPair } = require("../../models/MatchQuestionPair");
const { DrawingQuestion } = require("../../models/DrawingQuestion");
const { LabelDragQuestion } = require("../../models/LabelDragQuestion");
const { LabelFillQuestion } = require("../../models/LabelFillQuestion");
const { GeogebraGraphQuestion } = require("../../models/GeogebraGraphQuestion");
const { DesmosGraphQuestion } = require("../../models/DesmosGraphQuestion");
const { HotSpotQuestion } = require("../../models/HotSpotQuestion");
const { ApiError } = require("../../middlewares/apiError");
const { FillDropDownOption } = require("../../models/FillDropDownOption");
const { SortQuestionOption } = require("../../models/sortQuestionOptions");
const { SheetManagement } = require("../../models/SheetManagement");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionDistractor } = require("../../models/distractor");
// const{McqQuestionOption} = require("../../models/McqQuestionOption")
const { User } = require("../../models/User");
const { where } = require("sequelize");
const { Vocabulary } = require("../../models/Vocabulary");
const { FillTextAnswer } = require("../../models/FillTextAnswer");

const QuestionManagementController = {
  async creatTextQues(req, res, next) {
    const t = await db.transaction();
    try {
      const { createData, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        questionType: CONSTANTS.questionType.Text,
      });

      let createDataValues = await createTextQuestionSchema.validateAsync(createData);

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });
      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async updateQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const { questionId, questionData, explanation, includeExplanation, ...rest } = req.body;

      await editQuestionSchema.validateAsync(req.body);

      const updatedData = {
        questionData: questionData,
        explanation: explanation,
        includeExplanation: includeExplanation,
        ...rest,
      };

      let question = await services.questionService.updateQuestion(questionId, updatedData, {
        transaction: t,
      });
      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async uploadFileToS3(req, res, next) {
    try {
      let file = req.file;
      let data = await services.questionService.uploadFileToS3(file);
      res.status(httpStatus.OK).send(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async deleteFileFromS3(req, res, next) {
    try {
      let fileName = req.query.fileName;
      let data = await services.questionService.deleteFileFromS3(fileName);
      res.status(httpStatus.OK).send(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async createContentQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;
      let { files, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
      });

      let createdQuestion = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let questionId = await createdQuestion.id;
      const createdFiles = await Promise.all(
        files.map(async (file) => {
          const createdOption = await QuestionContent.create(
            {
              questionId,
              title: file.title || null,
              description: file.description || null,
              caption: file.caption || null,
              content: file.content,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        files: createdFiles,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteContentQues(req, res, next) {
    const t = await db.transaction();
    try {
      const { questionId, questionType } = req.query;

      const existingQuestion = await Question.findByPk(questionId);
      if (!existingQuestion) {
        return res.status(httpStatus.NOT_FOUND).send({ message: "Question not found" });
      }

      let questionContents = await QuestionContent.findAll(
        { where: { questionId: questionId } },
        { transaction: t }
      );

      await Promise.all(
        questionContents.map(async (content) => {
          if (content.content) {
            let fileName = content.content.split("/")[3] + "/" + content.content.split("/")[4];
            await services.questionService.deleteFileFromS3(fileName);
          }
        })
      );

      if (questionType === CONSTANTS.questionType.Accordian) {
        await Accordian.destroy({ where: { questionId: questionId } }, { transaction: t });
      }

      await QuestionContent.destroy({ where: { questionId: questionId } }, { transaction: t });

      await Question.destroy({ where: { id: questionId } }, { transaction: t });

      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "Question and associated content deleted successfully" });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async createAccordian(req, res, next) {
    const t = await db.transaction();
    try {
      let { tabs, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        questionType: CONSTANTS.questionType.Accordian,
      });

      const createdQuestion = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      const createdTabs = await Promise.all(
        tabs.map(async (tab) => {
          const createdTab = await Accordian.create(
            {
              questionId: createdQuestion.id,
              title: tab.title || null,
              content: tab.content,
            },
            { transaction: t }
          );
          return createdTab;
        })
      );

      await t.commit();

      res.status(httpStatus.OK).send({
        question: createdQuestion,
        tabs: createdTabs,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async updateAccordian(req, res, next) {
    const t = await db.transaction();

    try {
      const { questionId, ...rest } = req.body;
      const data = req.body;

      await Question.update(
        { ...rest },
        {
          where: { id: questionId },
          transaction: t,
        }
      );

      const tabs = data.tabs || [];

      await Accordian.destroy({
        where: { questionId },
        transaction: t,
      });

      const createdTabs = await Promise.all(
        tabs.map(async (tab) => {
          const createdTab = await Accordian.create(
            {
              questionId,
              title: tab.title,
              content: tab.content,
            },
            { transaction: t }
          );

          return createdTab;
        })
      );

      await t.commit();

      res.status(200).json({
        message: "Content question updated successfully",
        tabs: createdTabs,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async createVideoQues(req, res, next) {
    const t = await db.transaction();
    try {
      const { file, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
      });

      const contentFile = req.file;

      const createdQuestion = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      const questionId = createdQuestion.id;
      let contentFileName = null;
      if (contentFile) {
        contentFileName = await services.questionService.uploadFileToS3(contentFile);
      }
      const createdOption = await QuestionContent.create(
        {
          questionId,
          content: contentFileName.fileUrl,
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        files: [createdOption],
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async editVideoSimulationQues(req, res, next) {
    const t = await db.transaction();
    try {
      let { ...rest } = req.body;
      let data = req.body
      let questionId = data.questionId;

      await services.questionService.updateQuestion(questionId, {
        questionData: data.questionData,
        questionDescription: data.questionDescription,
        ...rest,
      });

      let questionContentData = await QuestionContent.findByPk(data.content.id);

      let updatedData;
      if (questionContentData) {
        let dataToBeUpdated = {
          content: data.content.content,
        };
        let response = await QuestionContent.update(dataToBeUpdated, {
          where: { id: data.content.id },
        });
        updatedData = response.data;
      } else {
        res.status(httpStatus.OK).send({
          message: "QuestionContent Not Found",
        });
      }

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Question updated successfully",
        filesUpdated: updatedData,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async editContentQues(req, res, next) {
    const t = await db.transaction();
    try {
      let { questionData, filesToAdd, filesToDelete, questionId, ...rest } = req.body;

      await services.questionService.updateQuestion(questionId, {
        questionData: questionData,
        ...rest,
      });

      let FilesToAdd = filesToAdd || [];
      let FilesToDelete = filesToDelete || [];
      const updatedFiles = [];

      const createdFiles = await Promise.all(
        FilesToAdd.map(async (file) => {
          const createdOption = await QuestionContent.create(
            {
              questionId,
              title: file.title || null,
              description: file.description || null,
              caption: file.caption || null,
              content: file.content,
            },
            { transaction: t }
          );
          updatedFiles.push(createdOption);
          return createdOption;
        })
      );

      // Delete files
      await Promise.all(
        FilesToDelete.map(async (fileId) => {
          await QuestionContent.destroy({
            where: { id: fileId.id },
            transaction: t,
          });

          let deleteFileContentParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileId.content,
          };

          await s3Client.send(new DeleteObjectCommand(deleteFileContentParams));
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Question updated successfully",
        filesUpdated: updatedFiles,
        filesDeleted: filesToDelete,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async McqQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { options, ...rest } = req.body;
      let data = await McqSchema.validateAsync({ options: options });

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      console.log(questionValues);

      let createdQuestion = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let mcqOptions = data.options;
      let questionId = await createdQuestion.id;

      const createdOptions = await Promise.all(
        mcqOptions.map(async (option) => {
          let contentFileName = null;

          if (mcqOptions.content) {
            contentFileName = await services.questionService.uploadFile(option.content);
          }

          const createdOption = await McqQuestionOption.create(
            {
              questionId,
              option: option.option,
              isCorrectOption: option.isCorrectOption,
              feedback: option.feedback || null,
              content: contentFileName || null,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        options: createdOptions,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editMcqQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      // console.log("success");
      let data = req?.body;
      console.log(data, "data");
      let questionId = data.questionId;

      // Update the McqQuestion
      if (questionId) {
        const response = await services.questionService.updateQuestion(questionId, data);
        console.log(response, "res");
      }

      let updatedOptions = data.options || [];
      let optionsToAdd = data.optionsToAdd || [];
      let optionsToDelete = data.optionsToDelete || [];

      const updatedOptionsList = [];

      // add new options
      await Promise.all(
        optionsToAdd.map(async (option) => {
          let contentFileName = null;

          if (option.content) {
            contentFileName = await services.questionService.uploadFile(option.content);
          }

          const createdOption = await McqQuestionOption.create(
            {
              questionId,
              option: option.option,
              isCorrectOption: option.isCorrectOption,
              feedback: option.feedback || null,
              content: contentFileName || null,
            },
            { transaction: t }
          );

          updatedOptionsList.push(createdOption);
        })
      );

      // Update existing options
      await Promise.all(
        updatedOptions.map(async (option) => {
          let contentFileName = null;

          if (option.content) {
            contentFileName = await services.questionService.uploadFile(option.content);
          }

          const existingOption = await McqQuestionOption.findByPk(option.id);

          if (existingOption) {
            existingOption.option = option.option || existingOption.option;
            existingOption.isCorrectOption =
              option.isCorrectOption || existingOption.isCorrectOption;
            existingOption.feedback = option.feedback || existingOption.feedback;
            existingOption.content = contentFileName || existingOption.content;

            await existingOption.save({ transaction: t });
            updatedOptionsList.push(existingOption);
          } else {
            await McqQuestionOption.create(
              {
                questionId,
                option: option.option,
                isCorrectOption: option.isCorrectOption,
                feedback: option.feedback || null,
                content: contentFileName || null,
              },
              { transaction: t }
            );
          }
        })
      );

      // Delete options
      await Promise.all(
        optionsToDelete.map(async (optionId) => {
          await McqQuestionOption.destroy({
            where: { id: optionId },
            transaction: t,
          });
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "McqQuestion updated successfully",
        updatedOptions: updatedOptionsList,
        optionsDeleted: optionsToDelete,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async DeleteMcqQues(req, res, next) {
    const questionId = req.query.questionId;

    const t = await db.transaction();

    try {
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await McqQuestionOption.destroy({
        where: {
          questionId,
        },
      });
      const question = await Question.findByPk(questionId);
      if (!question) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: "Question not found" });
      }

      await McqQuestionOption.destroy({
        where: { questionId },
        transaction: t,
      });

      await question.destroy({ transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send("Question Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async DeleteMcqOption(req, res, next) {
    const { questionId, optionId } = req.query;
    const t = await db.transaction();

    try {
      const option = await McqQuestionOption.findOne({
        where: { id: optionId, questionId: questionId },
      });

      if (!option) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: "Option not found" });
      }
      //////////////////////////////////s
      await option.destroy({ transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send("Option Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async TrueFalse(req, res, next) {
    const t = await db.transaction();
    try {
      let { statements, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let createdQuestion = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let questionId = await createdQuestion.id;

      const createdStatements = await Promise.all(
        statements.map(async (statement) => {
          let contentFileName = null;

          // if (statement.content) {
          //   contentFileName = await services.questionService.uploadFile(statement.content);
          // }

          const createdOption = await TrueFalseQuestionOption.create(
            {
              questionId,
              statement: statement.statement,
              isCorrectOption: statement.isCorrectOption,
              feedback: statement.feedback || null,
              content: statement.content || null,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        statements: createdStatements,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async TrueFalseQuesDelete(req, res, next) {
    const questionId = req.query.questionId;

    const t = await db.transaction();

    try {
      const question = await Question.findByPk(questionId);

      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      if (!question) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: "Question not found" });
      }
      await TrueFalseQuestionOption.destroy({
        where: { questionId },
        transaction: t,
      });
      await question.destroy({ transaction: t });

      await t.commit();

      res.status(httpStatus.NO_CONTENT).send("Question Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async DeleteTrueFalseOption(req, res, next) {
    const { questionId, optionId } = req.query;

    const t = await db.transaction();

    try {
      const option = await TrueFalseQuestionOption.findOne({
        where: { id: optionId, questionId: questionId },
      });

      console.log(option, "option");

      if (!option) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: "Option not found" });
      }

      await option.destroy({ transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send("Option Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async editTrueFalseQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;
      let questionId = data.questionId;

      if (data.questionData) {
        await services.questionService.updateQuestion(questionId, data);
      }

      let updatedStatements = data.statements || [];
      let statementsToAdd = data.statementsToAdd || [];
      let statementsToDelete = data.statementsToDelete || [];

      const updatedStatementsList = [];

      // add new statements
      await Promise.all(
        updatedStatements.map(async (statement) => {
          let contentFileName = null;

          if (statement.id) {
            // contentFileName = await services.questionService.uploadFile(statement.content);
            await TrueFalseQuestionOption.update(
              {
                statement: statement.statement,
                isCorrectOption: statement.isCorrectOption,
                feedback: statement.feedback || null,
                content: statement.contentFileName || null,
              },
              {
                where: {
                  id: statement.id,
                },
              }
            );
          } else {
            const createdStatement = await TrueFalseQuestionOption.create(
              {
                questionId,
                statement: statement.statement,
                isCorrectOption: statement.isCorrectOption,
                feedback: statement.feedback || null,
                content: contentFileName || null,
              },
              { transaction: t }
            );

            updatedStatementsList.push(createdStatement);
          }
        })
      );

      // Update existing statements
      await Promise.all(
        updatedStatements.map(async (statement) => {
          let contentFileName = null;

          if (statement.content) {
            contentFileName = await services.questionService.uploadFile(statement.content);
          }

          const existingStatement = await TrueFalseQuestionOption.findByPk(statement.statementId);

          if (existingStatement) {
            existingStatement.statement = statement.statement || existingStatement.statement;
            existingStatement.isCorrectOption =
              statement.isCorrectOption || existingStatement.isCorrectOption;
            existingStatement.feedback = statement.feedback || existingStatement.feedback;
            existingStatement.content = contentFileName || existingStatement.content;

            await existingStatement.save({ transaction: t });
            updatedStatementsList.push(existingStatement);
          }
        })
      );

      // Delete statements
      await Promise.all(
        statementsToDelete.map(async (statementId) => {
          await TrueFalseQuestionOption.destroy({
            where: { id: statementId },
            transaction: t,
          });
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "TrueFalse question updated successfully",
        updatedStatements: updatedStatementsList,
        statementsDeleted: statementsToDelete,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async createSortQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;

      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      let files = data.Files;
      let questionId = await createdQuestion.id;

      const createdFiles = await Promise.all(
        files.map(async (file) => {
          let contentFileName = null;

          if (file.content) {
            contentFileName = await services.questionService.uploadFile(file.content);
          }

          const createdOption = await QuestionItem.create(
            {
              questionId,
              item: file.item,
              content: contentFileName,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        files: createdFiles,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editSortQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;
      let questionId = data.id;
      console.log(questionId, "id");

      if (data.questionData) {
        await services.questionService.updateQuestion(questionId, {
          questionData: data.questionData,
        });
      }

      let filesToAdd = data.filesToAdd || [];
      let filesToDelete = data.filesToDelete || [];

      const updatedFiles = [];

      await Promise.all(
        filesToAdd.map(async (file) => {
          let contentFileName = null;

          if (file.content) {
            contentFileName = await services.questionService.uploadFile(file.content);
          }
          const fileId = file?.id;

          if (fileId) {
            const existingFile = await QuestionContent.findByPk(fileId);
            existingFile.title = file.item || existingFile.item;
            existingFile.content = contentFileName || existingFile.content;

            await existingFile.save({ transaction: t });
            updatedFiles.push(existingFile);
          } else {
            const createdOption = await QuestionContent.create(
              {
                questionId,
                item: file.item || null,
                content: contentFileName || null,
              },
              { transaction: t }
            );

            updatedFiles.push(createdOption);
          }
        })
      );

      // Delete files
      await Promise.all(
        filesToDelete.map(async (fileId) => {
          await QuestionContent.destroy({
            where: { id: fileId.id },
            transaction: t,
          });

          let deleteFileContentParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileId.content,
          };

          await s3Client.send(new DeleteObjectCommand(deleteFileContentParams));
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Question updated successfully",
        filesUpdated: updatedFiles,
        filesDeleted: filesToDelete,
      });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async createClassifyQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;

      let createdQuestion = await services.questionService.createQuestion(data, {
        transaction: t,
      });

      let categories = data.categories;
      let questionId = await createdQuestion.id;
      // console.log(categories)
      const createdCategories = await Promise.all(
        categories.map(async (category) => {
          let categoryData = {
            questionId,
            category: category.category,
            content: category.content || null,
          };

          let createdCategory = await QuestionCategory.create(categoryData, {
            transaction: t,
          });

          let items = category.items;

          const createdItemFiles = await Promise.all(
            items.map(async (file) => {
              const createdOption = await QuestionItem.create(
                {
                  categoryId: createdCategory.id,
                  item: file.item,
                  content: file.content,
                },
                { transaction: t }
              );

              return createdOption;
            })
          );

          return {
            category: createdCategory,
            files: createdItemFiles,
          };
        })
      );

      let distractor = data.distractors;

      const createdDistractorFiles = await Promise.all(
        distractor.map(async (file) => {
          const createdOption = await QuestionDistractor.create(
            {
              questionId,
              distractor: file.distractor,
              content: file.content,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        categories: createdCategories,
        distractor: createdDistractorFiles,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editClassifyQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const questionId = req.body.questionId;
      const data = req.body;
      if (!questionId) {
        createClassifyQues(req, res, next);
      } else {
        await services.questionService.updateQuestion(questionId, data, { transaction: t });

        const categories = data.categories;
        console.log(categories, "cat");

        // Update or create categories
        if (categories?.length > 0) {
          const updatedCategories = await Promise.all(
            data?.categories?.map(async (category) => {
              console.log(category, "cat");
              let categoryId = category?.id;
              console.log(categoryId);

              const categoryData = {
                category: category?.category,
                content: "",
              };

              if (categoryId) {
                await services.questionService.updateCategory(categoryId, categoryData, {
                  transaction: t,
                });
              } else {
                let categoryData = {
                  questionId,
                  category: category.category,
                  content: category.content || null,
                };

                let createdCategory = await QuestionCategory.create(categoryData, {
                  transaction: t,
                });
                console.log("success2");
                categoryId = createdCategory?.id;
              }

              const items = category.options;
              console.log(items, "item");
              const updatedItemFiles = await Promise.all(
                items?.map(async (file) => {
                  const itemId = file?.id;
                  console.log(file, "item");
                  // const contentItemFileName = file.content
                  //   ? await services.questionService.uploadFileToS3(file.content)
                  //   : null;

                  const itemData = {
                    categoryId: category.id,
                    item: file.item,
                    content: file.content,
                  };

                  if (itemId) {
                    await QuestionItem.update(
                      itemData,
                      { where: { id: itemId } },
                      { transaction: t }
                    );
                  } else {
                    await QuestionItem.create(itemData, { transaction: t });
                  }
                })
              );

              return {
                category: categoryData,
                items: updatedItemFiles,
              };
            })
          );
        }

        await t.commit();
        res.status(httpStatus.OK).send({ message: "Question updated successfully" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteClassifyQues(req, res, next) {
    const t = await db.transaction();
    try {
      const { questionId } = req.query;
      console.log(questionId, "id");
        
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionDistractor.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionItem.destroy({
        where: {
          questionId,
        },
        transaction: t,
      });

      const categories = await QuestionCategory.findAll({
        where: { questionId },
        transaction: t,
      });

      for (const category of categories) {
        await QuestionItem.destroy({
          where: { categoryId: category.id },
          transaction: t,
        });
        await category.destroy({ transaction: t });
      }
      const question = await Question.findByPk(questionId);
      await question.destroy({ transaction: t });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question and related data deleted successfully" });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteClassifyIteam(req, res, next) {
    const t = await db.transaction();
    try {
      const { itemId } = req.query;
      await QuestionItem.destroy({
        where: {
          id: itemId,
        },
        transaction: t,
      });
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question and related data deleted successfully" });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteClassifycategory(req, res, next) {
    const t = await db.transaction();
    try {
      const { categoryId } = req.query;
      await QuestionCategory.destroy({ where: { id: categoryId }, transaction: t });
      await t.commit();

      res.status(httpStatus.OK).send({ message: "Question and related data deleted successfully" });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteClassifydistractor(req, res, next) {
    const t = await db.transaction();
    try {
      const { distractorID } = req.query;
      const question = await QuestionDistractor.destroy({
        where: { categoryId: distractorID },
        transaction: t,
      });
      await question.destroy({ transaction: t });
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question and related data deleted successfully" });
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },
  async createTableQues(req, res, next) {
    const t = await db.transaction();
    try {
      let { tableData, autoPlot, allowPrefilledText, ...rest } = req.body;

      let questionData = {
        ...rest
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      let questionId = await createdQuestion.id;

      let tbq = await TableQuestion.create(
        {
          questionId,
          tableData,
          autoPlot: autoPlot || false,
          allowPrefilledText: allowPrefilledText || false,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        table: tbq,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editTableQues(req, res, next) {
    const t = await db.transaction();
    try {

      const id = req.body.id;
      const data = req.body;

      const questionUpdateData = {
        questionData: data.questionData,
        explanation: data?.explanation,
        includeExplanation: data?.includeExplanation
      };

      await services.questionService.updateQuestion(id, questionUpdateData, {
        transaction: t,
      });

      let tbData = data.tableData;
      let autoPlot = data.autoPlot;
      let allowPrefilledText = data.allowPrefilledText

      let tbq = await TableQuestion.update(
        {
          tableData: tbData,
          autoPlot: autoPlot || false,
          allowPrefilledText: allowPrefilledText || false,
        }, { where: { questionId: id, }, },
        { transaction: t }
      );


      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Question and Table updated successfully",
        tbq,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteTableQues(req, res, next) {
    const t = await db.transaction();
    try {
      const id = req.query.questionId;

      await TableQuestion.destroy({ where: { questionId: id }, transaction: t });

      const question = await Question.findByPk(id, { transaction: t });
      await question.destroy({ transaction: t });

      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "Question and related files deleted successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async createFillDropDown(req, res, next) {
    const t = await db.transaction();
    try {
      const { choices, ...rest } = req.body
      let values = await createQuestionsSchema.validateAsync({ ...rest });

      let dataToBeCreated = { ...values, questionType: CONSTANTS.questionType.Fill_Dropdown };

      if (dataToBeCreated.isQuestionSubPart === true && !dataToBeCreated.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(dataToBeCreated, { transaction: t });
      await t.commit();

      await FillTextAnswer.create({
        questionId: question?.dataValues?.id,
        answerContent: choices
      })

      res.status(httpStatus.OK).send({ message: "Fill Drop Down question created!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteFillDropDownQues(req, res, next) {
    const t = await db.transaction();
    try {
      const id = req.query.questionId;

      await FillTextAnswer.destroy({ where: { questionId: id }, transaction: t });

      const question = await Question.findByPk(id, { transaction: t });
      await question.destroy({ transaction: t });

      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "Fill Drop Down Question deleted successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  // async addFillDropDownOptions(req, res, next) {
  //   const t = await db.transaction();
  //   try {
  //     let values = await addFillDropDownQuestionOptionsSchema.validateAsync(req.body);

  //     await services.questionService.checkFillDropDownOptions(values.questionId);

  //     let = dataToBeAdded = values.optionsToBeAdded;

  //     for (let i = 0; i < dataToBeAdded.length; i++) {
  //       await FillDropDownOption.create(
  //         {
  //           option: dataToBeAdded[i].option,
  //           isCorrectOption: dataToBeAdded[i].isCorrectOption,
  //           questionId: values.questionId,
  //         },
  //         { transaction: t }
  //       );
  //     }

  //     await t.commit();

  //     res.status(httpStatus.OK).send({ message: "New dropDown Options added!" });
  //   } catch (err) {
  //     await t.rollback();
  //     next(err);
  //   }
  // },
  // async deleteFillDropDownOption(req, res, next) {
  //   const t = await db.transaction();
  //   try {
  //     let values = await deleteFillDropDownQuestionOptionsSchema.validateAsync({
  //       optionId: req.query.optionId,
  //     });
  //     await FillDropDownOption.destroy({ where: { id: values.optionId } });

  //     await t.commit();

  //     res.status(httpStatus.OK).send({ message: "option deleted!" });
  //   } catch (err) {
  //     next(err);
  //   }
  // },
  async editFillDropDown(req, res, next) {

    const t = await db.transaction();
    try {

      console.log(req.body)
      const { choices, type, ...rest } = req.body
      let values = await editQuestionSchema.validateAsync({ ...rest });

      let dataToBeUpdated = { ...values, questionType: CONSTANTS.questionType.Fill_Dropdown };

      if (dataToBeUpdated.isQuestionSubPart === true && !dataToBeUpdated.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.updateQuestion(values.id, dataToBeUpdated, { transaction: t });

      await FillTextAnswer.update(
        { answerContent: choices },
        {
          where: { questionId: question?.dataValues?.id, },
        },
        { transaction: t }
      );

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Fill Text question Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  // async getfillDropDownOptions(req, res, next) {
  //   try {
  //     let values = await getFillDropDownQuestionOptionsSchema.validateAsync({
  //       questionId: req.query.questionId,
  //     });

  //     console.log(values);

  //     let questionDetails = await services.questionService.getQuestionsDetailsById(
  //       values.questionId
  //     );

  //     let fillDropDownOptions = await FillDropDownOption.findAll({
  //       where: { questionId: values.questionId },
  //       attributes: ["id", "option", "isCorrectOption"],
  //       raw: true,
  //     });
  //     res.status(httpStatus.OK).send({ questionDetails, options: fillDropDownOptions });
  //   } catch (err) {
  //     next(err);
  //   }
  // },
  async deleteFillDropDownQuestion(req, res, next) {
    const t = await db.transaction();
    try {

      let values = await deleteFillDropDownQuestionSchema.validateAsync({
        questionId: req.query.questionId,
      });

      await FillTextAnswer.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      await services.questionService.deleteQuestion(
        { where: { id: values.questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "FillDropDown Option & Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createFillTextQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const { choices, ...rest } = req.body
      let values = await createQuestionsSchema.validateAsync({ ...rest });

      console.log("FILL TEXT QUESTION:", values);

      let dataToBeCreated = { ...values, questionType: CONSTANTS.questionType.Fill_Text };

      if (dataToBeCreated.isQuestionSubPart === true && !dataToBeCreated.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(dataToBeCreated, { transaction: t });
      await t.commit();

      await FillTextAnswer.create({
        questionId: question?.dataValues?.id,
        answerContent: choices
      })

      res.status(httpStatus.OK).send({ message: "Fill Text question created!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editFillTextQuestion(req, res, next) {
    const t = await db.transaction();
    try {

      console.log(req.body)
      const { choices, type, ...rest } = req.body
      let values = await editQuestionSchema.validateAsync({ ...rest });

      let dataToBeUpdated = { ...values, questionType: CONSTANTS.questionType.Fill_Text };

      if (dataToBeUpdated.isQuestionSubPart === true && !dataToBeUpdated.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.updateQuestion(values.id, dataToBeUpdated, { transaction: t });

      await FillTextAnswer.update(
        { answerContent: choices },
        {
          where: { questionId: question?.dataValues?.id, },
        },
        { transaction: t }
      );

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Fill Text question Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteFillTextQues(req, res, next) {
    const t = await db.transaction();
    try {
      const id = req.query.questionId;

      await FillTextAnswer.destroy({ where: { questionId: id }, transaction: t });

      const question = await Question.findByPk(id, { transaction: t });
      await question.destroy({ transaction: t });

      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "Fill Text files deleted successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await editQuestionSchema.validateAsync(req.body);

      let { id, ...questionData } = values;

      let whereQuery = { where: { id: id } };

      await services.questionService.editQuestion(questionData, whereQuery, {
        transaction: t,
      });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "question Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createMatchQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const { pairs, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        questionType: CONSTANTS.questionType.Match,
      });

      let pairsValues = await createMatchQuestionPairsSchema.validateAsync({ pairs });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      if (pairsValues.length > 20) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only 20 options can be added!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        raw: true,
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let matchPairs = pairsValues.pairs;

      for (let i = 0; i < matchPairs.length; i++) {
        let dataToBeCreated = {
          questionId: newQuestionData.id,
          matchPhrase: matchPairs[i].matchPhrase,
          matchTarget: matchPairs[i].matchTarget,
        };

        await MatchQuestionPair.create(dataToBeCreated, { transaction: t });
      }


      let distractor = questionValues.distractors;

      const createdDistractorFiles = await Promise.all(
        distractor.map(async (file) => {
          const createdOption = await QuestionDistractor.create(
            {
              questionId: newQuestionData.id,
              distractor: file.distractor,
              content: file.content,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      console.log(createdDistractorFiles, "files of distracor")
      res.status(httpStatus.OK).send({ message: "created question & added match pairs" });
    } catch (err) {
      await t.rollback();
      console.log(err);
      next(err);
    }
  },
  async editMatchQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { options, pairsToBeAdded, ...rest } = req.body;
      let questionValues = req.body;
      console.log("success1")
      let updateValues = options;
      let distractor = req.body.distractor
   
      let { id, ...questionData } = questionValues;

      const createdDistractorFiles = await Promise.all(
        distractor.map(async (file,index) => {
          if(file?.id){
            await QuestionDistractor.update(
              {
                distractor: file.distractor,
                content: file.content,
              },
              {
                where: { id: file.id, questionId: id },
              },
              { transaction: t }
            );
          }
          else{
            const createdOption = await QuestionDistractor.create(
              {
                questionId:id,
                distractor: file.distractor,
                content: file.content,
              },
              { transaction: t }
            );
          }  
        })
      );


      const updatePairs = options;
      if (updatePairs && updatePairs.length > 0) {
        console.log("success21")
        for (let i = 0; i < updatePairs.length; i++) {
          let dataToBeUpdated = {
            matchPhrase: updatePairs[i].matchPhrase,
            matchTarget: updatePairs[i].matchTarget,
          };
          console.log("success3")
          if (updatePairs[i]?.id) {
            await MatchQuestionPair.update(
              dataToBeUpdated,
              {
                where: { id: updatePairs[i].id, questionId: id },
              },
              { transaction: t }
            );
          } else {
            console.log("success5")
            await MatchQuestionPair.create(
              { ...dataToBeUpdated, questionId: id },
              {
                where: { questionId: id },
              },
              { transaction: t }
            );
          }
          console.log("success6")
          // const createdDistractorFiles = await Promise.all(
          //   distractor.map(async (file) => {
          //     const createdOption = await QuestionDistractor.update(
          //       {
          //         distractor: file.distractor,
          //         content: file.content,
          //       },
          //       { where: { id: file.id } },
          //       { transaction: t }
          //     );

          //     return createdOption;
          //   })
          // );
        }

        await services.questionService.editQuestion(
          { questionData, ...rest },
          { where: { id: id } },
          { transaction: t }
        );
        console.log("success7")

        let distractor = questionValues.distractors;



        await t.commit();

        res.status(httpStatus.OK).send({ message: "MatchQuestion updated" });
      }
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async addMatchQuestionPair(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addMatchQuestionPairSchema.validateAsync(req.body);

      console.log(values);

      let dataToBeAdded = values.pairsToBeAdded;

      for (let i = 0; i < dataToBeAdded.length; i++) {
        let dataToBeCreated = {
          questionId: values.questionId,
          matchPhrase: dataToBeAdded[i].matchPhrase,
          matchTarget: dataToBeAdded[i].matchTarget,
        };
        
        await MatchQuestionPair.create(dataToBeCreated, { transaction: t });
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Match Question Pairs Added!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteMatchPair(req, res, next) {
    const t = await db.transaction();

    try {
      let values = await deleteMatchPairSchema.validateAsync({ pairId: req.query.pairId });

      await MatchQuestionPair.destroy({ where: { id: values.pairId } });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Pair Deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async deleteMatchQuestion(req, res, next) {
    const t = await db.transaction();
    let questionId = req.query.questionId;
    try {
      let values = await deleteQuestionSchema.validateAsync({
        questionId: req.query.questionId,
      });
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await MatchQuestionPair.destroy({
        where: {
          questionId,
        },
      });
      await services.questionService.deleteQuestion(
        { where: { id: values.questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Match Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createDrawingQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let drawingQuestionValues = await createDrawingQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
      });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        raw: true,
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let drawingQuestion = await DrawingQuestion.create(
        {
          questionId: newQuestionData.id,
          uploaderJson: drawingQuestionValues.uploaderJson,
          studentJson: drawingQuestionValues.studentJson,
        },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Drawing question created!", drawingQuestion });
    } catch (err) {
      await t.rollback();
      console.log(err);
      next(err);
    }
  },
  async editDrawingQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, questionId, questionData, sheetId, ...rest } = req.body;

      // let questionValues = await editQuestionSchema.validateAsync(rest);
      let drawingQuestionValues = await editDrawingQuestionSchema.validateAsync({
        uploaderJson: uploaderJson,
        studentJson: studentJson,
      });

      await Question.update(
        { questionData: questionData, ...rest },
        { where: { id: questionId } },
        { transaction: t }
      );
      await DrawingQuestion.update(
        {
          studentJson: drawingQuestionValues.studentJson,
          uploaderJson: drawingQuestionValues.uploaderJson,
        },
        { where: { questionId: questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "drawing Question Updated!" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteDrawingQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({
        questionId: req.query.questionId,
      });
      let questionId = values.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await DrawingQuestion.destroy({ where: { questionId } }, { transaction: t });

      await services.questionService.deleteQuestion(
        { where: { id: questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Drawing Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createLabelDragQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let labelDragQuestionValues = await createLabelDragQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
      });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createLabelDragQuestion = await LabelDragQuestion.create(
        {
          questionId: newQuestionData.id,
          uploaderJson: labelDragQuestionValues.uploaderJson,
          studentJson: labelDragQuestionValues.studentJson,
        },
        { transaction: t }
      );

      await t.commit();

      res
        .status(httpStatus.OK)
        .send({ message: "Label Draw Question created successfully!", createLabelDragQuestion });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editLabelDragQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let labelDragQuestionValues = await editLabelDragQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
      });

      let { questionId, questionData } = questionValues;

      await Question.update(
        { questionData, ...rest },
        {
          where: { id: questionId },
        },
        { transaction: t }
      );

      await LabelDragQuestion.update(
        {
          uploaderJson: labelDragQuestionValues.uploaderJson,
          studentJson: labelDragQuestionValues.studentJson,
        },
        { where: { questionId: questionValues.questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label drag updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteLabelDragQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);
      let questionId = values.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await LabelDragQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );
      let whereQuery = { where: { id: values.questionId } };
      await services.questionService.deleteQuestion(whereQuery, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label Drag Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createLabelFillQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { dataGeneratorJson, studentJson, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let labelFillQuestionValues = await createLabelFillQuestionSchema.validateAsync({
        dataGeneratorJson,
        studentJson,
      });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createLabelFillQuestion = await LabelFillQuestion.create(
        {
          questionId: newQuestionData.id,
          dataGeneratorJson: labelFillQuestionValues.dataGeneratorJson,
          studentJson: labelFillQuestionValues.studentJson,
        },
        { transaction: t }
      );

      await t.commit();

      res
        .status(httpStatus.OK)
        .send({ message: "Label Fill Question created", fillQuestion: createLabelFillQuestion });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editLabelFillQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { dataGeneratorJson, studentJson, ...rest } = req.body;

      let questionValues = await editQuestionSchema.validateAsync(rest);

      let labelFillQuestionValues = await editLabelFillQuestionSchema.validateAsync({
        dataGeneratorJson,
        studentJson,
      });

      let { questionId, questionData } = questionValues;

      await Question.update(
        { questionData, ...rest },
        {
          where: { id: questionId },
        },
        { transaction: t }
      );

      await LabelFillQuestion.update(
        {
          dataGeneratorJson: labelFillQuestionValues.dataGeneratorJson,
          studentJson: labelFillQuestionValues.studentJson,
        },
        { where: { questionId: questionId } }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label Fill question updated!" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteLabelFillQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      let questionId = values.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });
      await LabelFillQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      let whereQuery = { where: { id: values.questionId } };
      await services.questionService.deleteQuestion(whereQuery);

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label Fill question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createGeogebraQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, allowAlgebraInput, graphType, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let geogebraQuestionValues = await createGeogebraGraphQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
        allowAlgebraInput,
        graphType,
      });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createGeoGebraQuestion = await GeogebraGraphQuestion.create(
        {
          questionId: newQuestionData.id,
          uploaderJson: geogebraQuestionValues.uploaderJson,
          studentJson: geogebraQuestionValues.studentJson,
          allowAlgebraInput: geogebraQuestionValues.allowAlgebraInput,
          graphType: geogebraQuestionValues.graphType,
        },
        { transaction: t }
      );

      res
        .status(httpStatus.OK)
        .send({ message: "Geogebra question created!", geogebraQuestion: createGeoGebraQuestion });

      await t.commit();
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editGeogebraQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, allowAlgebraInput, graphType, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let geogebraQuestionValues = await editGeogebraGraphQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
        graphType,
        allowAlgebraInput,
      });

      let { questionId, questionData } = questionValues;

      await services.questionService.editQuestion(
        { questionData, ...rest },
        { where: { id: questionId } },
        { transaction: t }
      );

      await GeogebraGraphQuestion.update(
        {
          dataGeneratorJson: geogebraQuestionValues.dataGeneratorJson,
          studentJson: geogebraQuestionValues.studentJson,
          allowAlgebraInput: geogebraQuestionValues.allowAlgebraInput,
        },
        { where: { questionId: questionValues.questionId } }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ messge: "Geogebra question updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteGeogebraQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

      let questionId = values.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await GeogebraGraphQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      await services.questionService.deleteQuestion(
        { where: { id: values.questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Geogebra question deleted!" });
    } catch (err) {
      next(err);
    }
  },
  async createDesmosGraphQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      if (questionValues.hasSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let desmosGraphQuestionValues = await createDesmosGraphQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
      });

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createDesmosQuestion = await DesmosGraphQuestion.create(
        {
          questionId: newQuestionData.id,
          uploaderJson: desmosGraphQuestionValues.uploaderJson,
          studentJson: desmosGraphQuestionValues.studentJson,
        },
        { transaction: t }
      );

      await t.commit();

      res
        .status(httpStatus.OK)
        .send({ message: "Desmos Graph Question created!", desmosQuestion: createDesmosQuestion });
    } catch (err) {
      next(err);
    }
  },
  async editDesmosGraphQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, ...rest } = req.body;
      let questionValues = req.body;

      let desmosQuestionValues = { uploaderJson, studentJson };

      let { questionId, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: questionId } },
        { transaction: t }
      );

      // if (desmosQuestionValues.newDataGeneratorJson && desmosQuestionValues.newStudentJson) {
      await DesmosGraphQuestion.update(
        {
          uploaderJson: desmosQuestionValues.uploaderJson,
          studentJson: desmosQuestionValues.studentJson,
        },
        { where: { questionId: questionId } },
        { transaction: t }
      );
      // }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Desmos Graph Question Updated!" });
    } catch (err) {
      next(err);
    }
  },
  async deleteDesmosQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let questionId = req.query.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });
      await DesmosGraphQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      let whereQuery = { where: { id: values.questionId } };

      await services.questionService.deleteQuestion(whereQuery, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Desmos question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createHostSpotQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, hotSpotIds, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let hotSpotQuestionValues = await createHotSpotQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
        hotSpotIds,
      });

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let hotSpotQuestion = await HotSpotQuestion.create(
        {
          questionId: newQuestionData.id,
          uploaderJson: hotSpotQuestionValues.uploaderJson,
          studentJson: hotSpotQuestionValues.studentJson,
          hotSpotIds: hotSpotQuestionValues.hotSpotIds,
        },
        { transaction: t }
      );

      await t.commit();

      res
        .status(httpStatus.OK)
        .send({ message: "HotSpot question created", hotSpotQuestion: hotSpotQuestion });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editHotSpotQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { uploaderJson, studentJson, hotSpotIds, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      console.log(questionValues);

      let hotSpotQuestionValues = await editHotSpotQuestionSchema.validateAsync({
        uploaderJson,
        studentJson,
        hotSpotIds,
      });

      let { questionId, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        { questionData, ...rest },
        { where: { id: questionId } },
        { transaction: t }
      );
      await HotSpotQuestion.update(
        {
          uploaderJson: hotSpotQuestionValues.uploaderJson,
          studentJson: hotSpotQuestionValues.studentJson,
        },
        { where: { questionId: questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "HotSpot question updated" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteHotSpotQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

      let questionId = values.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });

      await HotSpotQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      let whereQuery = { where: { id: values.questionId } };

      await services.questionService.deleteQuestion(whereQuery, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "HotSpot Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createSortQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { options, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let sortQuestionValues = await createSortQuestionSchema.validateAsync({ options });
      console.log(questionValues);
      console.log(sortQuestionValues);

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;
      let sortQuestionOptions = sortQuestionValues.options;

      for (let i = 0; i < sortQuestionOptions.length; i++) {
        await SortQuestionOption.create(
          {
            questionId: newQuestionData.id,
            option: sortQuestionOptions[i].option,
            content: sortQuestionOptions.content,
          },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Sort Question created!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async editSortQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { options, type, ...rest } = req.body;
      let questionValues = req.body;
      let sortQuestionValues = options;
      let { id, ...questionData } = questionValues;
      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );
      let sortQuestionOptionToBeUpdated = sortQuestionValues;

      for (let i = 0; i < sortQuestionOptionToBeUpdated.length; i++) {
        let dataToBeUpdated = {
          option: sortQuestionOptionToBeUpdated[i].option,
          content: sortQuestionOptionToBeUpdated[i].content,
        };
        if (sortQuestionOptionToBeUpdated[i].id) {
          await SortQuestionOption.update(
            dataToBeUpdated,
            { where: { id: sortQuestionOptionToBeUpdated[i].id, questionId: id } },
            { transaction: t }
          );
        } else {
          await SortQuestionOption.create(
            {
              questionId: id,
              option: sortQuestionOptionToBeUpdated[i].option,
              content: sortQuestionOptionToBeUpdated.content,
            },
            { transaction: t }
          );
        }
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Sort Question Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async addSortQuestionOption(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addSortQuestionOptionSchema.validateAsync(req.body);

      console.log(values);
      let sortOptionsToBeAdded = values.optionsToBeAdded;

      for (let i = 0; i < sortOptionsToBeAdded.length; i++) {
        await SortQuestionOption.create(
          {
            questionId: values.questionId,
            option: sortOptionsToBeAdded[i].option,
            content: sortOptionsToBeAdded.content,
          },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Sort Questions Options Added!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteSortQuestionOption(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteSortQuestionOptionSchema.validateAsync({
        optionId: req.query.optionId,
      });
      console.log(values);

      await SortQuestionOption.destroy({ where: { id: values.optionId } }, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Sort option deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteSortQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let questionId = req.query.questionId;
      await QuestionTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionSubTopicMapping.destroy({
        where: {
          questionId,
        },
      });

      await QuestionVocabMapping.destroy({
        where: {
          questionId,
        },
      });
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

      await SortQuestionOption.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      await services.questionService.deleteQuestion(
        { where: { id: values.questionId } },
        { transaction: t }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Sort question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async createLongAnswer(req, res, next) {
    const t = await db.transaction();
    try {
    
      let values = await createQuestionsSchema.validateAsync(req.body);

      let question = await services.questionService.createQuestion(values, {
        transaction: t,
      });
      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async getQuestions(req, res, next) {
    try {
      let values = await getQuestionsSchema.validateAsync({ sheetId: req.query.sheetId });
      console.log(values,"vlues")
      let whereQuery = { sheetId: values.sheetId };
      if (req.query.isCheckedByPricer)
        whereQuery = { ...whereQuery, isCheckedByPricer: req.query.isCheckedByPricer };

      if (req.query.isCheckedByReviewer)
        whereQuery = { ...whereQuery, isCheckedByReviewer: req.query.isCheckedByReviewer };

      if (req.query.isErrorByReviewer)
        whereQuery = { ...whereQuery, isErrorByReviewer: req.query.isErrorByReviewer };

      if (req.query.isReCheckedByReviewer)
        whereQuery = { ...whereQuery, isReCheckedByReviewer: req.query.isReCheckedByReviewer };
      
      console.log("sucesss1")
      
      let questions = await Question.findAll({
        where: whereQuery,
        order: [["createdAt", "ASC"]],
        raw: true,
        nest:true
      });
      
      console.log(questions,"questions")

      let questionDetails = await services.questionService.findQuestions(questions);

      res.status(httpStatus.OK).send(questionDetails);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async updateSheetInprogress(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      console.log(values);

      let whereQuery = { where: { id: values.sheetId }, raw: true };

      let sheetData = await SheetManagement.findOne(whereQuery);

      let assignedTo = sheetData.assignedToUserId;
      let lifeCycle = sheetData.lifeCycle;
      let previousStatus = sheetData.statusForUploader;

      if (!sheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
      }

      if (assignedTo !== values.uploaderId || lifeCycle !== CONSTANTS.roleNames.Uploader2) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Sheet not assigned to Uploader or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current task status is already Inprogress");
      }

      let dataToBeUpdated = {
        statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
        statusForUploader: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForSheetUpdate = { where: { id: sheetData.id } };

      await SheetManagement.update(dataToBeUpdated, whereQueryForSheetUpdate, { transaction: t });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async updateSheetComplete(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      console.log(values);

      let whereQuery = { where: { id: values.sheetId }, raw: true };

      let sheetData = await SheetManagement.findOne(whereQuery);

      let assignedTo = sheetData.assignedToUserId;
      let lifeCycle = sheetData.lifeCycle;
      let previousStatus = sheetData.statusForUploader;

      if (!sheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
      }

      if (assignedTo !== values.uploaderId || lifeCycle !== CONSTANTS.roleNames.Uploader2) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Sheet not assigned to Uploader or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current task status is already Complete");
      }

      let dataToBeUpdated = {
        statusForUploader: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQueryForSheetUpdate = { where: { id: sheetData.id } };

      await SheetManagement.update(dataToBeUpdated, whereQueryForSheetUpdate, { transaction: t });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async submitToSupervisor(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await submitSheetToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let whereQueryForFindSheet = {
        where: {
          id: values.sheetId,
        },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let sheetData = await SheetManagement.findOne(whereQueryForFindSheet);

      if (!sheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (sheetData.assignedToUserId === sheetData.supervisorId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
      }

      // Checking if sheet status is complete for reviewer
      if (sheetData.statusForUploader !== CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
      }

      //UPDATE sheet assignment & sheet status
      let dataToBeUpdated = {
        assignedToUserId: sheetData.supervisorId,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQuery = {
        where: { id: sheetData.id },
      };

      await SheetManagement.update(dataToBeUpdated, whereQuery, {
        transaction: t,
      });

      responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
      responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";

      // Create sheetLog

      await services.sheetManagementService.createSheetLog(
        values.sheetId,
        sheetData.assignedToUserName.userName,
        sheetData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.uploaderAssignToSupervisor,
        { transaction: t }
      );

      responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";

      await t.commit();

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteDistractor(req, res, next) {
    const t = await db.transaction();
    try {
      await QuestionDistractor.destroy({where:{id:req.query.distracotrId}})
      res.status(httpStatus.OK).send("success");
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
};

module.exports = QuestionManagementController;