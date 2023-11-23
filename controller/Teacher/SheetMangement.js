const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { Topic, SubTopic } = require("../../models/Topic");
const { Vocabulary } = require("../../models/Vocabulary");
const { updateInprogressTaskStatusSchema } = require("../../validations/PricerValidation");
const { SheetManagement } = require("../../models/SheetManagement");
const { ApiError } = require("../../middlewares/apiError");
const { User } = require("../../models/User");
const { Question } = require("../../models/Question");
const { s3Client } = require("../../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName } = require("../../config/s3");
const { TaskTopicMapping } = require("../../models/TopicTaskMapping");

const TeacherSheetManagementController = {
  async createTopicSubTopicMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const topicIds = data.topicIds;
      const subTopicIds = data.subTopicIds;

      const createdTopicMappings = await Promise.all(
        topicIds.map(async (topicId) => {
          return await QuestionTopicMapping.create(
            {
              questionId,
              topicId,
            },
            { transaction: t }
          );
        })
      );

      const createdSubTopicMappings = await Promise.all(
        subTopicIds.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.create(
            {
              questionId,
              subTopicId,
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        topicMappings: createdTopicMappings,
        subTopicMapping: createdSubTopicMappings,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editTopicSubTopicMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const createNewTopics = data.createNewTopics || [];
      const deleteTopics = data.deleteTopics || [];
      const createNewSubTopics = data.createNewSubTopics || [];
      const deleteSubTopics = data.deleteSubTopics || [];

      const createdTopicMappings = await Promise.all(
        createNewTopics.map(async (topicId) => {
          return await QuestionTopicMapping.create(
            {
              questionId,
              topicId,
            },
            { transaction: t }
          );
        })
      );

      const deletedTopicMappings = await Promise.all(
        deleteTopics.map(async (topicId) => {
          return await QuestionTopicMapping.destroy(
            {
              where: {
                questionId,
                topicId,
              },
            },
            { transaction: t }
          );
        })
      );

      const createdSubTopicMappings = await Promise.all(
        createNewSubTopics.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.create(
            {
              questionId,
              subTopicId,
            },
            { transaction: t }
          );
        })
      );

      const deletedSubTopicMappings = await Promise.all(
        deleteSubTopics.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.destroy(
            {
              where: {
                questionId,
                subTopicId,
              },
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        topicMappings: {
          created: createdTopicMappings,
          deleted: deletedTopicMappings,
        },
        subTopicMappings: {
          created: createdSubTopicMappings,
          deleted: deletedSubTopicMappings,
        },
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async createVocabMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const vocabIds = data.vocabIds;

      const createdVocabMappings = await Promise.all(
        vocabIds.map(async (vocabId) => {
          return await QuestionVocabMapping.create(
            {
              questionId,
              vocabId,
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        vocabMappings: createdVocabMappings,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editVocabMapping(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const createNewVocab = data.createNewVocab || [];
      const deleteVocab = data.deleteVocab || [];

      const createVocabMapping = await Promise.all(
        createNewVocab.map(async (vocabId) => {
          return await QuestionVocabMapping.create(
            {
              questionId,
              vocabId,
            },
            { transaction: t }
          );
        })
      );

      const deletedVocabMapping = await Promise.all(
        deleteVocab.map(async (vocabId) => {
          return await QuestionVocabMapping.destroy(
            {
              where: {
                questionId,
                vocabId,
              },
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        vocabMappings: {
          created: createVocabMapping,
          deleted: deletedVocabMapping,
        },
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async getTopicSubTopicVocabMappingsForQuestion(req, res, next) {
    try {
      const questionId = req.query.questionId;

      const topicMappings = await QuestionTopicMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["topicId"],
        include: [{ model: Topic, attributes: ["name"] }],
        raw: true,
      });

      const subTopicMappings = await QuestionSubTopicMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["subTopicId"],
        include: [{ model: SubTopic, attributes: ["name"] }],
        raw: true,
      });

      const vocabMappings = await QuestionVocabMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["vocabId"],
        include: [{ model: Vocabulary, attributes: ["name"] }],
        raw: true,
      });

      res.status(httpStatus.OK).send({
        questionId,
        topicMappings,
        subTopicMappings,
        vocabMappings,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  // async getTopicSubTopicVocabMappingsForQuestion(req, res, next) {
  //   try {
  //     const questionId = req.query.questionId;

  //     let response = {};

  //     const topicMappings = await QuestionTopicMapping.findAll({
  //       where: {
  //         questionId,
  //       },
  //       attributes: ["topicId"],
  //       include: [
  //         {
  //           model: Topic,
  //           attributes: ["name"],
  //         },
  //       ],
  //       raw: true,
  //     });

  //     response = await Promise.all(
  //       topicMappings.map(async (topicMapping) => {
  //         const { topicId, name } = topicMapping;

  //         const subTopicMappings = await QuestionSubTopicMapping.findAll({
  //           where: {
  //             questionId,
  //             topicId, 
  //           },
  //           attributes: ["subTopicId"],
  //           include: [
  //             {
  //               model: SubTopic,
  //               attributes: ["name"],
  //             },
  //           ],
  //           raw: true,
  //         });

  //         const vocabMappings = await QuestionVocabMapping.findAll({
  //           where: {
  //             questionId,
  //             topicId,
  //           },
  //           attributes: ["vocabId"],
  //           include: [
  //             {
  //               model: Vocabulary,
  //               attributes: ["name"],
  //             },
  //           ],
  //           raw: true,
  //         });

  //         return {
  //           topicId,
  //           name,
  //           subTopics: subTopicMappings.map((subTopicMapping) => ({
  //             subTopicId: subTopicMapping.subTopicId,
  //             subTopicName: subTopicMapping.SubTopic.name,
  //           })),
  //           vocabularies: vocabMappings.map((vocabMapping) => ({
  //             vocabId: vocabMapping.vocabId,
  //             vocabName: vocabMapping.Vocabulary.name,
  //           })),
  //         };
  //       })
  //     );

  //     res.status(httpStatus.OK).send({
  //       questionId,
  //       response,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     next(err);
  //   }
  // },

  async markQuestionAsChecked(req, res, next) {
    const t = await db.transaction();
    try {
      let whereQuery = { where: { id: req.body.id }, raw: true };

      let { questionDetailsForSubPart, questionDetails } = req.body;

      let question = await Question.findOne(whereQuery);

      if (!question) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
      }

      if (question.hasSubPart) {
        let whereQuery = { parentQuestionId: question.id };

        let subPart = await Question.findAll(
          {
            where: whereQuery,
            order: [["createdAt", "ASC"]],
            raw: true,
          },
          { transaction: t }
        );

        for (var i = 0; i < subPart.length; i++) {
          console.log(questionDetailsForSubPart[i].criteriaPoints)
          let whereQuery = { where: { id: subPart[i].id }, raw: true, transaction: t };
          let request = {
            criteriaPoints: JSON.stringify(questionDetailsForSubPart[i].criteriaPoints),
            errorReportByTeacher: questionDetailsForSubPart[i].errorReportByTeacher,
            isPremium: questionDetailsForSubPart[i].isPremium,
            marks: questionDetailsForSubPart[i].marks,
            requiredTime: questionDetailsForSubPart[i].requiredTime,
            videoLink: questionDetailsForSubPart[i].videoLink,
          };
          await Question.update(request, whereQuery);
        }
      }

      let request = {
        isCheckedByTeacher: true,
        isErrorByTeacher: false,
        ...questionDetails,
      };
      // let values = await updatePriceInQuestionSchema.validateAsync(request);
      await Question.update(request, { ...whereQuery, transaction: t });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
    } catch (err) {
      await t.rollback();
      console.log(err);
      next(err);
    }
  },
  async markQuestionAsError(req, res, next) {
    const t = await db.transaction();
    try {
      let whereQuery = { where: { id: req.body.id }, raw: true };

      let { questionDetailsForSubPart, questionDetails } = req.body;

      let question = await Question.findOne(whereQuery);

      if (!question) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
      }

      if (question.hasSubPart) {
        let whereQuery = { parentQuestionId: question.id };

        let subPart = await Question.findAll(
          {
            where: whereQuery,
            order: [["createdAt", "ASC"]],
            raw: true,
          },
          { transaction: t }
        );

        for (var i = 0; i < subPart.length; i++) {
          console.log(questionDetailsForSubPart[i].criteriaPoints)
          let whereQuery = { where: { id: subPart[i].id }, raw: true, transaction: t };
          let request = {
            criteriaPoints: JSON.stringify(questionDetailsForSubPart[i].criteriaPoints),
            errorReportByTeacher: questionDetailsForSubPart[i].errorReportByTeacher,
            isPremium: questionDetailsForSubPart[i].isPremium,
            marks: questionDetailsForSubPart[i].marks,
            requiredTime: questionDetailsForSubPart[i].requiredTime,
            videoLink: questionDetailsForSubPart[i].videoLink,
          };
          await Question.update(request, { ...whereQuery, transaction: t });
        }
      }

      let request = {
        isCheckedByTeacher: false,
        isErrorByTeacher: true,
        ...questionDetails,
      };

      console.log("-------", request);
      // let values = await updatePriceInQuestionSchema.validateAsync(request);
      await Question.update(request, whereQuery);

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
    } catch (err) {
      await t.rollback();
      console.log(err);
      next(err);
    }
  },
  async removeQuestionAsError(req, res, next) {
    const t = await db.transaction();
    try {
      const questionId = req.query.questionId;

      const updatedData = {
        isErrorByTeacher: false,
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
  async removeQuestionAsChecked(req, res, next) {
    const t = await db.transaction();
    try {
      const questionId = req.query.questionId;

      const updatedData = {
        isCheckedByTeacher: false,
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
  async updateCompletedTaskStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = req.body;
      let whereQuery = { where: { id: values.id }, raw: true };

      let sheetData = await SheetManagement.findOne(whereQuery);

      if (!sheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let assignedTo = sheetData.assignedToUserId;
      let lifeCycle = sheetData.lifeCycle;

      if (assignedTo !== values.teacherId || lifeCycle !== CONSTANTS.roleNames.Teacher) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to Teacher or lifecycle mismatch"
        );
      }

      await SheetManagement.update(
        {
          statusForTeacher: CONSTANTS.sheetStatuses.Complete,
        },
        whereQuery
      );

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async updateInProgressTaskStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = req.body;
      let whereQuery = { where: { id: values.id }, raw: true };

      let sheetData = await SheetManagement.findOne(whereQuery);

      if (!sheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let assignedTo = sheetData.assignedToUserId;
      let lifeCycle = sheetData.lifeCycle;
      let previousStatus = sheetData.statusForPricer;

      if (assignedTo !== values.teacherId || lifeCycle !== CONSTANTS.roleNames.Teacher) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to Teacher or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
      }

      await SheetManagement.update(
        {
          statusForTeacher: CONSTANTS.sheetStatuses.InProgress,
        },
        whereQuery
      );

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async SubmitSheetToSupervisor(req, res, next) {
    const t = await db.transaction();
    try {
      let values = req.body;

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let userData = await services.userService.finduser(
        values.teacherId,
        CONSTANTS.roleNames.Teacher,
        { transaction: t }
      );

      let sheetData = await SheetManagement.findOne({
        where: { id: values.id },
        include: [
          {
            model: User,
            as: "supervisor",
          },
        ],
        raw: true,
        nest: true,
      });

      if (sheetData) {
        let dataToBeUpdated = {
          statusForTeacher: CONSTANTS.sheetStatuses.Complete,
          assignedToUserId: sheetData.supervisorId,
          lifeCycle: CONSTANTS.roleNames.Supervisor,
        };
        let whereQuery = {
          where: {
            id: values.id,
          },
          transaction: t,
        };
        let statusToUpdate = await SheetManagement.update(dataToBeUpdated, whereQuery);

        let createLog = await services.sheetManagementService.createSheetLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          CONSTANTS.sheetLogsMessages.uploaderAssignToSupervisor,
          { transaction: t }
        );

        if (statusToUpdate.length > 0 && createLog) {
          responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
          responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
          responseMessage.sheetLog = "Log record for Sheet to supervisor added successfully";
        }

        await t.commit();
        res.status(httpStatus.OK).send({ message: responseMessage });
      } else {
        await t.commit();
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async addCheckCommentInSheet(req, res, next) {
    const t = await db.transaction();
    try {
      let values = req.body;
      let userData = await services.userService.finduser(
        values.teacherId,
        CONSTANTS.roleNames.Teacher,
        { transaction: t }
      );

      let sheetData = await SheetManagement.findOne({
        where: { id: values.id },
        include: [
          {
            model: User,
            as: "supervisor",
          },
        ],
        raw: true,
        nest: true,
      });
      if (sheetData) {
        let dataToBeUpdated = {
          statusForTeacher: CONSTANTS.sheetStatuses.Complete,
          assignedToUserId: sheetData.supervisorId,
          lifeCycle: CONSTANTS.roleNames.Supervisor,
          errorReportByTeacher: values.comment,
        };
        let whereQuery = {
          where: {
            id: values.id,
          },
          transaction: t,
        };
        let statusToUpdate = await SheetManagement.update(dataToBeUpdated, whereQuery);

        let createLog = await services.sheetManagementService.createSheetLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          CONSTANTS.sheetLogsMessages.uploaderAssignToSupervisor,
          { transaction: t }
        );

        await t.commit();
        res.status(httpStatus.OK).send({ message: "Sheet Assigned and Error Marked Successfully" });
      } else {
        await t.commit();
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async addHighlightPdfToQuestion(req, res, next) {
    const t = await db.transaction();
    try {

      let questionData = await Question.findOne({ where: { id: req.body.questionId }, transaction: t });
      if (!questionData) {
        await t.rollback();
        throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
      }

      if (questionData.teacherHighlightErrorPdf !== null) {
        await t.commit();
        return res.status(httpStatus.OK).send({ message: "Highlight Already Exist" })
      }

      let dataToBeUpdated = {
        teacherHighlightErrorPdf: req.body.file,
      };

      await Question.update(dataToBeUpdated, { where: { id: req.body.questionId }, transaction: t })
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Added pdf In Question Sucessfully" });
    } catch (err) {
      await t.rollback();
      console.log(err)
      next(err);
    }
  },
  async getHighlightPdfQuestion(req, res, next) {
    try {

      let questionData = await Question.findOne({ where: { id: req.query.questionId } });
      if (!questionData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
      }

      res.status(httpStatus.OK).send({ dataURL: questionData.teacherHighlightErrorPdf });

    } catch (err) {
      console.log(err)
      next(err);
    }
  },
  async saveHighlightDataInQuestions(req, res, next) {
    const t = await db.transaction();
    try {

      let questionData = await Question.findOne({ where: { id: req.body.questionId }, transaction: t });
      if (!questionData) {
        await t.rollback()
        throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
      }

      let dataToBeUpdated = {
        teacherHighlightErrorPdf: req.body.report,
      };

      await Question.update(dataToBeUpdated, { where: { id: req.body.questionId }, transaction: t })
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Updated Error In Question Sucessfully" });

    } catch (err) {
      console.log(err)
      next(err);
    }
  },
};

module.exports = TeacherSheetManagementController;
