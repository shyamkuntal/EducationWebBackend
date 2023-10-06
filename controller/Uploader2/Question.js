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
  updateTextQuestionSchema,
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
      const { questionId, questionData } = req.body;

      await updateTextQuestionSchema.validateAsync(req.body);

      const updatedData = {
        questionData: questionData,
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
      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      let files = data.files;
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
  async createAccordian(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      const createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      const tabs = data.tabs || [];

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
      const { questionId } = req.params;
      const data = req.body;

      await Question.update(data.questionData, {
        where: { id: questionId },
        transaction: t,
      });

      const tabs = data.tabs || [];

      await QuestionContent.destroy({
        where: { questionId },
        transaction: t,
      });

      const createdTabs = await Promise.all(
        tabs.map(async (tab) => {
          const createdTab = await QuestionContent.create(
            {
              questionId,
              title: tab.title || null,
              description: tab.description || null,
              caption: tab.caption || null,
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
      const { questionType, questionData, questionDescription, sheetId, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        sheetId,
        questionType: questionType,
        questionData: questionData,
        questionDescription: questionDescription,
      });

      const contentFile = req.file;

      const createdQuestion = await services.questionService.createQuestion(
        {
          sheetId,
          questionType,
          questionData,
          questionDescription: questionDescription || null,
        },
        { transaction: t }
      );

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
  async editContentQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;
      let questionId = data.questionId;

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
          const fileId = file.id;
          const existingFile = await QuestionContent.findByPk(fileId);

          if (existingFile) {
            existingFile.title = file.title || existingFile.title;
            existingFile.caption = file.caption || existingFile.caption;
            existingFile.description = file.description || existingFile.description;

            await existingFile.save({ transaction: t });
            updatedFiles.push(existingFile);
          } else {
            const createdOption = await QuestionContent.create(
              {
                questionId,
                title: file.title || null,
                description: file.description || null,
                caption: file.caption || null,
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
      let data = await McqSchema.validateAsync(req.body);
      let questionId = data.questionId;

      // Update the McqQuestion
      if (data.questionData) {
        await services.questionService.updateQuestion(questionId, {
          questionData: data.questionData,
        });
      }

      let updatedOptions = data.optionsToUpdate || [];
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

          const existingOption = await McqQuestionOption.findByPk(option.optionId);

          if (existingOption) {
            existingOption.option = option.option || existingOption.option;
            existingOption.isCorrectOption =
              option.isCorrectOption || existingOption.isCorrectOption;
            existingOption.feedback = option.feedback || existingOption.feedback;
            existingOption.content = contentFileName || existingOption.content;

            await existingOption.save({ transaction: t });
            updatedOptionsList.push(existingOption);
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
    console.log(questionId);
    const t = await db.transaction();

    try {
      const option = await McqQuestionOption.findOne({
        where: { id: optionId, questionId: questionId },
      });

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
        await services.questionService.updateQuestion(questionId, {
          questionData: data.questionData,
        });
      }

      let updatedStatements = data.statementsToUpdate || [];
      let statementsToAdd = data.statementsToAdd || [];
      let statementsToDelete = data.statementsToDelete || [];

      const updatedStatementsList = [];

      // add new statements
      await Promise.all(
        statementsToAdd.map(async (statement) => {
          let contentFileName = null;

          if (statement.content) {
            contentFileName = await services.questionService.uploadFile(statement.content);
          }

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
      let questionId = data.questionId;

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
          const fileId = file.id;
          const existingFile = await QuestionContent.findByPk(fileId);

          if (existingFile) {
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

      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
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
          const createdOption = await QuestionItem.create(
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
      const questionId = req.params.questionId;
      const data = req.body;

      await services.questionService.updateQuestion(
        questionId,
        {
          questionType: data.questionType,
          questionData: data.questionData,
          sheetId: data.sheetId,
        },
        { transaction: t }
      );

      const categories = data.categories;

      // Update or create categories
      const updatedCategories = await Promise.all(
        categories.map(async (category) => {
          const categoryId = category.id;
          const contentFileName = category.content
            ? await services.questionService.uploadFile(category.content)
            : null;

          const categoryData = {
            category: category.category,
            content: contentFileName,
          };

          if (categoryId) {
            await services.questionService.updateCategory(categoryId, categoryData, {
              transaction: t,
            });
          } else {
            const createdCategory = await QuestionCategory.create(questionId, ...categoryData, {
              transaction: t,
            });

            categoryId = createdCategory.id;
          }

          const items = category.items;

          const updatedItemFiles = await Promise.all(
            items.map(async (file) => {
              const itemId = file.id;
              const contentItemFileName = file.content
                ? await services.questionService.uploadFile(file.content)
                : null;

              const itemData = {
                categoryId,
                item: file.item,
                content: contentItemFileName,
              };

              if (itemId) {
                await QuestionItem.save(itemId, itemData, { transaction: t });
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

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question updated successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async deleteClassifyQues(req, res, next) {
    const t = await db.transaction();
    try {
      const { questionId } = req.params;

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
  async createTableQues(req, res, next) {
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
          const createdOption = await TableQuestion.create(
            {
              questionId,
              item: file.item,
              tableData: file.tableData,
              autoPlot: file.autoPlot || false,
              allowPrefilledText: file.allowPrefilledText || false,
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
  async editTableQues(req, res, next) {
    const t = await db.transaction();
    try {
      const id = req.body.id;
      const data = req.body;

      const questionUpdateData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      await services.questionService.updateQuestion(id, questionUpdateData, {
        transaction: t,
      });

      const files = data.Files;

      const updatedFiles = await Promise.all(
        files.map(async (file) => {
          const { fileId, item, tableData, autoPlot, allowPrefilledText } = file;

          if (fileId) {
            const updatedFile = await TableQuestion.update(
              {
                item,
                tableData,
                autoPlot: autoPlot || false,
                allowPrefilledText: allowPrefilledText || false,
              },
              { where: { id: fileId }, transaction: t }
            );

            return updatedFile;
          } else {
            const createdFile = await TableQuestion.create(
              {
                questionId: id,
                item,
                tableData,
                autoPlot: autoPlot || false,
                allowPrefilledText: allowPrefilledText || false,
              },
              { transaction: t }
            );

            return createdFile;
          }
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Question and files updated successfully",
        updatedFiles,
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
      const id = req.query.id;

      await TableQuestion.destroy({ where: { questionId: id }, transaction: t });

      await services.questionService.DeleteQues(id, { transaction: t });

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
      const { dropDownOptions, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        questionType: CONSTANTS.questionType.Fill_Dropdown,
      });

      let fillDropDownValues = await createFillDropDownQuestionOptionsSchema.validateAsync(
        dropDownOptions
      );

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      if (fillDropDownValues.length > 10) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only 10 options can be added!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        raw: true,
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      for (let i = 0; i < fillDropDownValues.length; i++) {
        await FillDropDownOption.create(
          {
            option: fillDropDownValues[i].option,
            isCorrectOption: fillDropDownValues[i].isCorrectOption,
            questionId: newQuestionData.id,
          },
          { transaction: t }
        );
      }
      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "FillDropDown options & New Question added!", newQuestionData });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async addFillDropDownOptions(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addFillDropDownQuestionOptionsSchema.validateAsync(req.body);

      await services.questionService.checkFillDropDownOptions(values.questionId);

      let = dataToBeAdded = values.optionsToBeAdded;

      for (let i = 0; i < dataToBeAdded.length; i++) {
        await FillDropDownOption.create(
          {
            option: dataToBeAdded[i].option,
            isCorrectOption: dataToBeAdded[i].isCorrectOption,
            questionId: values.questionId,
          },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "New dropDown Options added!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteFillDropDownOption(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteFillDropDownQuestionOptionsSchema.validateAsync({
        optionId: req.query.optionId,
      });
      await FillDropDownOption.destroy({ where: { id: values.optionId } });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "option deleted!" });
    } catch (err) {
      next(err);
    }
  },
  async editFillDropDownOption(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await editFillDropDownQuestionOptionsSchema.validateAsync(req.body);

      let questionId = values.questionId;
      let dataToBeUpdated = values.dataToBeUpdated;

      for (let i = 0; i < dataToBeUpdated.length; i++) {
        await FillDropDownOption.update(
          {
            option: dataToBeUpdated[i].option,
            isCorrectOption: dataToBeUpdated[i].isCorrectOption,
          },
          {
            where: { questionId: questionId, id: dataToBeUpdated[i].id },
          },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "options updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async getfillDropDownOptions(req, res, next) {
    try {
      let values = await getFillDropDownQuestionOptionsSchema.validateAsync({
        questionId: req.query.questionId,
      });

      console.log(values);

      let questionDetails = await services.questionService.getQuestionsDetailsById(
        values.questionId
      );

      let fillDropDownOptions = await FillDropDownOption.findAll({
        where: { questionId: values.questionId },
        attributes: ["id", "option", "isCorrectOption"],
        raw: true,
      });
      res.status(httpStatus.OK).send({ questionDetails, options: fillDropDownOptions });
    } catch (err) {
      next(err);
    }
  },
  async deleteFillDropDownQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteFillDropDownQuestionSchema.validateAsync({
        questionId: req.query.questionId,
      });

      await FillDropDownOption.destroy(
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
      let values = await createQuestionsSchema.validateAsync(req.body);

      console.log(values);

      let dataToBeCreated = { ...values, questionType: CONSTANTS.questionType.Fill_Text };

      if (dataToBeCreated.isQuestionSubPart === true && !dataToBeCreated.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      await services.questionService.createQuestion(dataToBeCreated, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Fill Text question created!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteFillTextQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      let responseMessage = { message: "Fill Text question deleted" };

      let whereQuery = {
        where: {
          id: values.questionId,
          questionType: CONSTANTS.questionType.Fill_Text,
        },
      };

      let deletedQuestion = await services.questionService.deleteQuestion(whereQuery, {
        transaction: t,
      });

      console.log(deletedQuestion);

      if (deletedQuestion <= 0) {
        responseMessage.message = "Cannot delete Fill Text question!";
      }

      await t.commit();

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
      next();
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
        // if (matchPairs[i].matchPhraseContent) {
        //   let buffer = Buffer.from(
        //     matchPairs[i].matchPhraseContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
        //     "base64"
        //   );

        //   let fileObj = {
        //     originalname: matchPairs[i].matchPhraseContent.filename,
        //     mimetype: matchPairs[i].matchPhraseContent.mimetype,
        //     buffer: buffer,
        //   };

        //   let fileName = await services.questionService.uploadFile(fileObj);
        //   console.log(fileName);
        //   dataToBeCreated.matchPhraseContent = fileName;
        // }

        // if (matchPairs[i].matchTargetContent) {
        //   let buffer = Buffer.from(
        //     matchPairs[i].matchTargetContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
        //     "base64"
        //   );

        //   let fileObj = {
        //     originalname: matchPairs[i].matchTargetContent.filename,
        //     mimetype: matchPairs[i].matchTargetContent.mimetype,
        //     buffer: buffer,
        //   };

        //   let fileName = await services.questionService.uploadFile(fileObj);
        //   console.log(fileName);
        //   dataToBeCreated.matchTargetContent = fileName;
        // }
        await MatchQuestionPair.create(dataToBeCreated, { transaction: t });
      }

      await t.commit();

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
      let { pairsToBeUpdated, pairsToBeAdded, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let updateValues = await editMatchQuestionPairsSchema.validateAsync({
        pairsToBeUpdated,
        pairsToBeAdded,
      });

      let { id, ...questionData } = questionValues;

      const updatePairs = updateValues.pairsToBeUpdated;

      if (updatePairs && updatePairs.length > 0) {
        for (let i = 0; i < updatePairs.length; i++) {
          let dataToBeUpdated = {
            matchPhrase: updatePairs[i].matchPhrase,
            matchTarget: updatePairs[i].matchTarget,
          };

          if (updatePairs[i].newMatchPhraseContent && updatePairs[i].matchPhraseContent) {
            let buffer = Buffer.from(
              updatePairs[i].newMatchPhraseContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
              "base64"
            );

            let fileObj = {
              originalname: updatePairs[i].newMatchPhraseContent.filename,
              mimetype: updatePairs[i].newMatchPhraseContent.mimetype,
              buffer: buffer,
            };

            let fileName = await services.questionService.uploadFile(fileObj);

            dataToBeUpdated.matchPhraseContent = fileName;

            // Deleting previous matchTargetContent
            await services.questionService.deleteS3File({
              fileName: updatePairs[i].matchPhraseContent,
            });
          }

          if (updatePairs[i].newMatchTargetContent && updatePairs[i].matchTargetContent) {
            let buffer = Buffer.from(
              updatePairs[i].newMatchTargetContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
              "base64"
            );

            let fileObj = {
              originalname: updatePairs[i].newMatchTargetContent.filename,
              mimetype: updatePairs[i].newMatchTargetContent.mimetype,
              buffer: buffer,
            };

            let fileName = await services.questionService.uploadFile(fileObj);

            dataToBeUpdated.matchTargetContent = fileName;

            // Deleting previous matchTargetContent
            await services.questionService.deleteS3File({
              fileName: updatePairs[i].matchTargetContent,
            });
          }

          await MatchQuestionPair.update(
            dataToBeUpdated,
            {
              where: { id: updatePairs[i].id, questionId: id },
            },
            { transaction: t }
          );
        }

        await services.questionService.editQuestion(
          questionData,
          { where: { id: id } },
          { transaction: t }
        );

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
        // if (dataToBeAdded[i].matchPhraseContent) {
        //   let buffer = Buffer.from(
        //     dataToBeAdded[i].matchPhraseContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
        //     "base64"
        //   );

        //   let fileObj = {
        //     originalname: dataToBeAdded[i].matchPhraseContent.filename,
        //     mimetype: dataToBeAdded[i].matchPhraseContent.mimetype,
        //     buffer: buffer,
        //   };

        //   let fileName = await services.questionService.uploadFile(fileObj);
        //   console.log(fileName);
        //   dataToBeCreated.matchPhraseContent = fileName;
        // }

        // if (dataToBeAdded[i].matchTargetContent) {
        //   let buffer = Buffer.from(
        //     dataToBeAdded[i].matchTargetContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
        //     "base64"
        //   );

        //   let fileObj = {
        //     originalname: dataToBeAdded[i].matchTargetContent.filename,
        //     mimetype: dataToBeAdded[i].matchTargetContent.mimetype,
        //     buffer: buffer,
        //   };

        //   let fileName = await services.questionService.uploadFile(fileObj);
        //   console.log(fileName);
        //   dataToBeCreated.matchTargetContent = fileName;
        // }
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
    try {
      let values = await deleteQuestionSchema.validateAsync({
        questionId: req.query.questionId,
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
      let { newCanvasJson, questionId, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let drawingQuestionValues = await editDrawingQuestionSchema.validateAsync({
        newCanvasJson: newCanvasJson,
      });

      let { id, questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        {
          where: { id: id },
        },
        { transaction: t }
      );

      if (drawingQuestionValues.newCanvasJson && drawingQuestionValues.newCanvasJson.length > 0) {
        await DrawingQuestion.update(
          { canvasJson: drawingQuestionValues.newCanvasJson },
          { where: { questionId: id } },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "drawing Question Updated!" });
    } catch (err) {
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

      await DrawingQuestion.destroy(
        { where: { questionId: values.questionId } },
        { transaction: t }
      );

      await services.questionService.deleteQuestion(
        { where: { id: values.questionId } },
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
      let { newuploaderJson, newStudentCanvasJson, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let labelDragQuestionValues = await editLabelDragQuestionSchema.validateAsync({
        newuploaderJson,
        newStudentCanvasJson,
      });

      let { id, questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        {
          where: { id: id },
        },
        { transaction: t }
      );

      if (labelDragQuestionValues.newuploaderJson && labelDragQuestionValues.newStudentCanvasJson) {
        await LabelDragQuestion.update(
          {
            uploaderJson: labelDragQuestionValues.newuploaderJson,
            studentJson: labelDragQuestionValues.newStudentCanvasJson,
          },
          { where: { questionId: questionValues.id } },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label drag updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteLabelDrawQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

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
      let { newDataGeneratorJson, newStudentJson, newFillAnswer, newFillAnswerId, ...rest } =
        req.body;

      let questionValues = await editQuestionSchema.validateAsync(rest);

      let labelFillQuestionValues = await editLabelFillQuestionSchema.validateAsync({
        newDataGeneratorJson,
        newStudentJson,
        newFillAnswer,
        newFillAnswerId,
      });

      let { id, questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        {
          where: { id: id },
        },
        { transaction: t }
      );
      if (
        labelFillQuestionValues.newDataGeneratorJson &&
        labelFillQuestionValues.newStudentJson &&
        labelFillQuestionValues.newFillAnswer &&
        labelFillQuestionValues.fillAnswerId
      ) {
        await LabelFillQuestion.update(
          {
            dataGeneratorJson: labelFillQuestionValues.newDataGeneratorJson,
            studentJson: labelFillQuestionValues.newStudentJson,
            fillAnswer: labelFillQuestionValues.newFillAnswer,
            fillAnswerId: labelFillQuestionValues.fillAnswerId,
          },
          { where: { questionId: questionValues.id } }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Label Fill question updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async deleteLabelFillQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

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
      console.log(err)
      await t.rollback();
      next(err);
    }
  },
  async editGeogebraQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { newUploaderJson, newStudentJson, allowAlgebraInput, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let geogebraQuestionValues = await editGeogebraGraphQuestionSchema.validateAsync({
        newUploaderJson,
        newStudentJson,
        allowAlgebraInput,
      });

      let { id, questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );

      if (geogebraQuestionValues.newUploaderJson && geogebraQuestionValues.newStudentJson) {
        await GeogebraGraphQuestion.update(
          {
            dataGeneratorJson: geogebraQuestionValues.newUploaderJson,
            studentJson: geogebraQuestionValues.newStudentJson,
            allowAlgebraInput: geogebraQuestionValues.allowAlgebraInput,
          },
          { where: { questionId: questionValues.id } }
        );
      }

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

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
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
      let { newUploaderJson, newStudentJson, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let desmosQuestionValues = await editDesmosGraphQuestionSchema.validateAsync({
        newUploaderJson,
        newStudentJson,
      });

      let { id, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );

      if (desmosQuestionValues.newDataGeneratorJson && desmosQuestionValues.newStudentJson) {
        await DesmosGraphQuestion.update(
          {
            uploaderJson: desmosQuestionValues.newUploaderJson,
            studentJson: desmosQuestionValues.newStudentJson,
          },
          { where: { questionId: id } },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Desmos Graph Question Updated!" });
    } catch (err) {
      next(err);
    }
  },
  async deleteDesmosQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteQuestionSchema.validateAsync({ questionId: req.query.questionId });

      console.log(values);

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
      let { newUploaderJson, newStudentJson, hotSpotIds, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      console.log(questionValues);

      let hotSpotQuestionValues = await editHotSpotQuestionSchema.validateAsync({
        newUploaderJson,
        newStudentJson,
        hotSpotIds,
      });

      let { id, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );

      if (hotSpotQuestionValues.newDataGeneratorJson && hotSpotQuestionValues.newStudentJson) {
        await HotSpotQuestion.update(
          {
            uploaderJson: hotSpotQuestionValues.newUploaderJson,
            studentJson: hotSpotQuestionValues.newStudentJson,
          },
          { where: { questionId: id } },
          { transaction: t }
        );
      }

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
      let { optionsToBeUpdated, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let sortQuestionValues = await editSortQuestionSchema.validateAsync({ optionsToBeUpdated });

      let { id, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );

      let sortQuestionOptionToBeUpdated = sortQuestionValues.optionsToBeUpdated;

      for (let i = 0; i < sortQuestionOptionToBeUpdated.length; i++) {
        let dataToBeUpdated = {
          option: sortQuestionOptionToBeUpdated[i].option,
          content: sortQuestionOptionToBeUpdated[i].content,
        };
        await SortQuestionOption.update(
          dataToBeUpdated,
          { where: { id: sortQuestionOptionToBeUpdated[i].id, questionId: id } },
          { transaction: t }
        );
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

      console.log(values);

      let questions = await Question.findAll({
        where: { sheetId: values.sheetId },
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      let questionDetails = [];

      for (let i = 0; i < questions.length; i++) {
        let type = questions[i].questionType;

        console.log(type);

        switch (type) {
          case CONSTANTS.questionType.Long_Answer:
            questionDetails.push(questions[i]);
            break;

          case CONSTANTS.questionType.MCQ_Single:
            let mcqQuestion = questions[i];

            let mcqOptions = await McqQuestionOption.findAll({
              where: { questionId: questions[i].id },
            });

            mcqQuestion.options = mcqOptions;

            questionDetails.push(mcqQuestion);

            break;
          case CONSTANTS.questionType.MCQ_Multiple:
            let mcqMutipleQuestion = questions[i];

            let mcqMultipleOptions = await McqQuestionOption.findAll({
              where: { questionId: questions[i].id },
            });

            mcqMutipleQuestion.options = mcqMultipleOptions;

            questionDetails.push(mcqMutipleQuestion);
            break;

          case CONSTANTS.questionType.True_False:
            let trueFalseQuestion = questions[i];

            let trueFalseStatements = await TrueFalseQuestionOption.findAll({
              where: { questionId: questions[i].id },
            });

            trueFalseQuestion.options = trueFalseStatements;

            questionDetails.push(trueFalseQuestion);
            break;

          case CONSTANTS.questionType.Fill_Text:
            questionDetails.push(questions[i]);
            break;

          case CONSTANTS.questionType.Fill_Dropdown:
            let dropDownQuestion = questions[i];

            let dropDownQuestionOptions = await FillDropDownOption.findAll({
              where: { questionId: questions[i].id },
            });

            dropDownQuestion.options = dropDownQuestionOptions;

            questionDetails.push(dropDownQuestion);

            break;

          case CONSTANTS.questionType.Match:
            let matchQuestion = questions[i];

            let matchQuestionOptions = await MatchQuestionPair.findAll({
              where: { questionId: questions[i].id },
            });

            matchQuestion.options = matchQuestionOptions;

            questionDetails.push(matchQuestion);

            break;

          case CONSTANTS.questionType.Sort:
            let sortQuestion = questions[i];

            let sortQuestionOptions = await SortQuestionOption.findAll({
              where: { questionId: questions[i].id },
            });

            sortQuestion.options = sortQuestionOptions;

            questionDetails.push(sortQuestion);
            break;

          case CONSTANTS.questionType.Classify:
            let classifyQuestion = questions[i];

            let classifyQuestionCategory = await QuestionCategory.findAll({
              where: { questionId: questions[i].id },
              raw: true,
            });

            for (let i = 0; i < classifyQuestionCategory.length; i++) {
              let classifyQuestionCategoryOptions = await QuestionItem.findAll({
                where: { categoryId: classifyQuestionCategory[i].id },
              });

              classifyQuestionCategory[i].options = classifyQuestionCategoryOptions;
            }

            classifyQuestion.categories = classifyQuestionCategory;

            questionDetails.push(classifyQuestion);
            break;

          case CONSTANTS.questionType.Drawing:
            let drawingQuestion = questions[i];

            let drawingQuestionData = await DrawingQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["uploaderJson", "studentJson", "questionId"],
            });

            drawingQuestion.canvasData = drawingQuestionData;

            questionDetails.push(drawingQuestion);
            break;

          case CONSTANTS.questionType.Label_Fill:
            let labelFillQuestion = questions[i];

            let labelFillQuestionData = await LabelFillQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["dataGeneratorJson", "studentJson", "questionId"],
            });

            labelFillQuestion.canvasData = labelFillQuestionData;

            questionDetails.push(labelFillQuestion);
            break;

          case CONSTANTS.questionType.Label_Drag:
            let labelDragQuestion = questions[i];

            let labelDragQuestionData = await LabelDragQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["uploaderJson", "studentJson", "questionId"],
            });

            labelDragQuestion.canvasData = labelDragQuestionData;

            questionDetails.push(labelDragQuestion);

            break;

          case CONSTANTS.questionType.Hotspot:
            let hotSpotQuestion = questions[i];

            let hotSpotQuestionData = await HotSpotQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["uploaderJson", "studentJson", "questionId"],
            });

            hotSpotQuestion.canvasData = hotSpotQuestionData;

            questionDetails.push(hotSpotQuestion);

            break;

          case CONSTANTS.questionType.Desmos_Graph:
            let desmosQuestion = questions[i];

            let desmosQuestionData = await DesmosGraphQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["uploaderJson", "studentJson", "questionId"],
            });

            desmosQuestion.graphData = desmosQuestionData;

            questionDetails.push(desmosQuestion);

            break;

          case CONSTANTS.questionType.Geogebra_Graph:
            let geoGebraQuestion = questions[i];

            let geoGebraQuestionData = await GeogebraGraphQuestion.findOne({
              where: { questionId: questions[i].id },
              attributes: ["uploaderJson", "studentJson", "questionId"],
            });

            geoGebraQuestion.graphData = geoGebraQuestionData;

            questionDetails.push(geoGebraQuestion);
            break;

          default:
        }
      }

      res.status(httpStatus.OK).send(questionDetails);
    } catch (err) {
      console.log(err)
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
};

module.exports = QuestionManagementController;
