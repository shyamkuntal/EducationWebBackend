const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { McqQuestionOption } = require("../../models/McqQuestionOption");
const { TrueFalseQuestionOption } = require("../../models/TrueFalseQuestionOption");
const { McqSchema, createQuestionsSchema, createTextQuestionSchema, updateTextQuestionSchema } = require("../../validations/QuestionManagementValidation");
const { Question } = require("../../models/Question");
const { QuestionContent } = require("../../models/QuestionContent");
const { s3Client } = require("../../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { QuestionItem } = require("../../models/items");
const { QuestionCategory } = require("../../models/category");
const { TableQuestion } = require("../../models/Table");

const QuestionManagement = {

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

  async updateQuestion(req, res, next){
    const t = await db.transaction();
    try {
      const { questionId, questionData } = req.body;

      await updateTextQuestionSchema.validateAsync(req.body);

      const updatedData={
        questionData: questionData
      }

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

  async uploadFileToS3(req, res, next){
    try {
      let file = req.file
      let data = await services.questionService.uploadFileToS3(file);
      res.status(httpStatus.OK).send(data)
    } catch (err) {
      next(err)
    }
  },
  async deleteFileFromS3(req, res, next){
    try {
      let fileName = req.query.fileName
      let data = await services.questionService.deleteFileFromS3(fileName);
      res.status(httpStatus.OK).send(data)
    } catch (err) {
      next(err)
    }
  },

  async createContentQues(req, res, next) {
    // const t = await db.transaction();
    try {
      console.log("asvs")
      console.log("files----->  ",req.files)
      let data = req.body;
      // let questionData = {
      //   questionType: data.questionType,
      //   questionData: data.questionData,
      //   sheetId: data.sheetId,
      // };
  
      // let createdQuestion = await services.questionService.createQuestion(questionData, {
      //   transaction: t,
      // });
  
      // let files = data.files;
      // let questionId = await createdQuestion.id;
      // console.log(files)
      // const createdFiles = await Promise.all(
      //   files.map(async (file) => {
      //     let contentFileName = null;
  
      //     if (file.content) {
      //       contentFileName = await services.questionService.uploadFile(file.content);
      //     }
  
      //     const createdOption = await QuestionContent.create(
      //       {
      //         questionId,
      //         title: file.title || null,
      //         description: file.description || null,
      //         caption: file.caption || null,
      //         content: contentFileName,
      //       },
      //       { transaction: t }
      //     );
  
      //     return createdOption;
      //   })
      // );
  
      // await t.commit();
      res.status(httpStatus.OK)
      // .send({
      //   question: createdQuestion,
      //   files: createdFiles,
      // });
    } catch (err) {
      console.log(err);
      // await t.rollback();
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
          questionDescription: questionDescription
        });
      
      const contentFile = req.file;

      const createdQuestion = await services.questionService.createQuestion(
        {
          sheetId,
          questionType,
          questionData,
          questionDescription: questionDescription || null ,
        },
        { transaction: t }
      );
  
      const questionId = createdQuestion.id;
      let contentFileName = null;
      if (contentFile) {
        contentFileName = await services.questionService.uploadFile(contentFile);
      }

      const createdOption = await QuestionContent.create(
        {
          questionId,
          content: contentFileName,
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
      let data = await McqSchema.validateAsync(req.body);

      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      let options = data.options;
      let questionId = await createdQuestion.id;

      const createdOptions = await Promise.all(
        options.map(async (option) => {
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
      let data = req.body;

      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });

      let statements = data.statements;
      let questionId = await createdQuestion.id;

      const createdStatements = await Promise.all(
        statements.map(async (statement) => {
          let contentFileName = null;

          if (statement.content) {
            contentFileName = await services.questionService.uploadFile(statement.content);
          }

          const createdOption = await TrueFalseQuestionOption.create(
            {
              questionId,
              statement: statement.statement,
              isCorrectOption: statement.isCorrectOption,
              feedback: statement.feedback || null,
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
          let contentFileName = null;
          let categoryFile = category.content;
          if (categoryFile) {
            contentFileName = await services.questionService.uploadFile(categoryFile);
          }
          let categoryData = {
            questionId,
            category: category.category,
            content: contentFileName,
          };

          let createdCategory = await QuestionCategory.create(categoryData, {
            transaction: t,
          });

          let items = category.items;

          const createdItemFiles = await Promise.all(
            items.map(async (file) => {
              let contentItemFileName = null;
              let itemFile = category.content;
              if (itemFile) {
                contentItemFileName = await services.questionService.uploadFile(itemFile);
              }
              const createdOption = await QuestionItem.create(
                {
                  categoryId: createdCategory.id,
                  item: file.item,
                  content: contentItemFileName,
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
          let contentItemFileName = null;
          let itemFile = file.content;
          if (itemFile) {
            contentItemFileName = await services.questionService.uploadFile(itemFile);
          }
          const createdOption = await QuestionItem.create(
            {
              questionId,
              distractor: file.distractor,
              content: contentItemFileName,
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
      res.status(httpStatus.OK).send({ message: "Question and related files deleted successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  }

};

module.exports = QuestionManagement;
