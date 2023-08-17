const httpStatus = require("http-status");
const services = require("../../services/index.js");
const { User, Roles } = require("../../models/User.js");
const CONSTANTS = require("../../constants/constants.js");
const {
  assignTopicTaskToSupervisorSchema,
} = require("../../validations/DataGeneratorValidations.js");
const {
  createTopicSchema,
} = require("../../validations/TopicManagementValidations.js");
const {
  TaskTopicMapping,
  TaskSubTopicMapping,
  TaskVocabularyMapping,
} = require("../../models/TopicTaskMapping.js");
const { Topic, SubTopic } = require("../../models/Topic.js");
const { Vocabulary } = require("../../models/Vocabulary.js");
const db = require("../../config/database.js");


const TopicDGController = {

  async createTopic(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await createTopicSchema.validateAsync(req.body);
      // Check if the topic name already exists
      const existingTopic = await services.topicService.checkTopicDuplicateName(values.name, { transaction: t });
      const existingTopicInMapping = existingTopic
        ? await services.topicService.checkTopicDuplicateNamebyTaskId(
            existingTopic.id,
            values.topicTaskId, 
            { transaction: t }
          )
        : null;

      if (!existingTopicInMapping) {
        if (existingTopic) {
          // If the topic name already exists, only add mapping
          const sentData = {
            topicTaskId: values.topicTaskId,
            topicId: existingTopic.id,
          };

          let mapData = await TaskTopicMapping.create(sentData, { transaction: t });
          await t.commit();
          return res.status(httpStatus.CREATED).send(mapData);
        } else {
          let dataToBeCreated = {
            name: values.name,
          };
          
          const topic = await services.topicService.createTopic(dataToBeCreated, { transaction: t });

          const sentData = {
            topicTaskId: values.topicTaskId,
            topicId: topic.id,
          };

          await TaskTopicMapping.create(sentData, { transaction: t });
          await t.commit();
          return res.status(httpStatus.CREATED).send(topic);
        }
      } else {
        await t.commit();
        return res.status(httpStatus.OK).send({ message: "Already Present" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async createSubTopic(req, res, next) {
    const values = req.body;
    const importNames = values.importNames;
    const newNames = values.newNames;
    const t = await db.transaction();
    try {
      let responseMessage = {}
      if (newNames.length > 0) {
        // Check and create new subTopics from newNames
        const createdSubTopics = [];
        for (const nameObj of newNames) {
          let existingTopic = await services.topicService.checkSubTopicDuplicateName(nameObj.name);
          if (existingTopic === null) {
            // Create new subTopic and map it to the taskSubTopicMappping table
            const subtopic = await services.topicService.createSubTopic(nameObj.name, { transaction: t });
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: subtopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData, { transaction: t });
            createdSubTopics.push(subtopic);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: existingTopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData, { transaction: t });
          }
        }
        responseMessage.createdNewSubTopics = createdSubTopics
        // res.status(httpStatus.CREATED).send(createdSubTopics);
      }
      // Map the data in taskSubTopicMapping table based on importNames.
      if (importNames.length > 0) {
        const createdMappings = [];
        for (const nameObj of importNames) {
          let existingSubTopic = await services.topicService.checkSubTopicDuplicateNamebyTaskId(
            values.topicTaskId,
            values.topicId,
            nameObj.id,
            { transaction: t }
          );
          
          if (!existingSubTopic) {
            const sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: nameObj.id,
            };
            await TaskSubTopicMapping.create(sentTaskData, { transaction: t });
            createdMappings.push(sentTaskData);
          }
        }
        if (createdMappings.length > 0) {
          responseMessage.createdNewMappings = createdMappings
          // res.status(httpStatus.CREATED).send(createdMappings);
        } else {
          // await t.commit();
          responseMessage.AlreadyPresentSubTopic = "Already Present"
          // return res.status(httpStatus.OK).send({ message: "Already Present" });
        }
      }
      await t.commit();
      res.status(httpStatus.OK).send(responseMessage)
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async createVocabulary(req, res, next) {
    const values = req.body;
    const importNames = values.importNames;
    const newNames = values.newNames;
    const t = await db.transaction();
    try {
      let responseMessage = {}
      if (newNames.length > 0) {
        // Check and create new Vocab from newNames
        const createdVocabs = [];
        for (const nameObj of newNames) {
          let existingVocab = await services.topicService.checkVocabDuplicateName(nameObj.name, { transaction: t });
          if (existingVocab === null) {
            // Create new Vocab and map it to the taskVocabMappping table
            const vocab = await services.topicService.createVocabulary(nameObj.name, { transaction: t });
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: vocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData, { transaction: t });
            createdVocabs.push(vocab);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: existingVocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData, { transaction: t });
          }
        }
        responseMessage.createdNewVocabs = createdVocabs
        // res.status(httpStatus.CREATED).send(createdVocabs);
      }
      // Map the data in taskVocabMapping table based on importNames.
      if (importNames.length > 0) {
        const createdMappings = [];
        for (const nameObj of importNames) {
          let existingVocab = await services.topicService.checkVocabDuplicateNamebyTaskId(
            values.topicTaskId,
            values.topicId,
            nameObj.id,
            { transaction: t }
          );
          if (!existingVocab) {
            const sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: nameObj.id,
            };
            await TaskVocabularyMapping.create(sentTaskData, { transaction: t });
            createdMappings.push(sentTaskData);
          }
        }
        if (createdMappings.length > 0) {
          responseMessage.createdNewMappings = createdMappings
          // res.status(httpStatus.CREATED).send(createdMappings);
        } else {
          responseMessage.AlreadyPresentVocab = "Already Present"
          // return res.status(httpStatus.OK).send({ message: "Already Present" });
        }
      }
      await t.commit();
      res.status(httpStatus.OK).send(responseMessage)
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  //  log error
  async SubmitTopicTaskToSupervisor(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignTopicTaskToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let userData = await services.userService.finduser(
        values.dataGeneratorId,
        CONSTANTS.roleNames.DataGenerator, 
        { transaction: t }
      );
      let sheetData = await services.topicService.findSheetAndUser(values.topicTaskId, { transaction: t });

      if (sheetData) {
        let dataToBeUpdated = {
          statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
          assignedToUserId: sheetData.supervisorId,
          lifeCycle: CONSTANTS.roleNames.Supervisor,
        };
        let whereQuery = {
          where: {
            id: sheetData.id,
          },
        };
        let statusToUpdate = await services.topicService.updateTopicTaskSheet(
          dataToBeUpdated,
          whereQuery, 
          { transaction: t }
        );

        let createLog = await services.topicTaskService.createTopicTaskLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          CONSTANTS.sheetLogsMessages.DataGeneratorAssignToSupervisor, 
          { transaction: t }
        );

        if (statusToUpdate.length > 0 && createLog) {
          responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
          responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
          responseMessage.sheetLog = "Log record for Task to supervisor added successfully";
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

  async MarkTopicTaskasInProgress(req, res) {
    const id = req.body.topicTaskId;
    const t = await db.transaction();
    try {
      let whereQueryForTaskFind = { where: { id: id }, raw: true };
      const sheetData = await services.topicTaskService.findTopicTasks(whereQueryForTaskFind, { transaction: t });
      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };
      let whereQuery = {
        where: {
          id: id,
        },
      };
      await services.topicTaskService.updateTopicTask(statusToUpdate, whereQuery, { transaction: t });
      await t.commit();
      return res.status(httpStatus.OK).send({
        message: "Sheet marked As InProgress Successfully",
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      return res.json({ status: 501, error: err.message });
    }
  },

  async MarkTopicTaskascomplete(req, res) {
    const id = req.body.topicTaskId;
    const t = await db.transaction();
    try {
      let whereQueryForTaskFind = { where: { id: id }, raw: true };
      const sheetData = await services.topicTaskService.findTopicTasks(whereQueryForTaskFind, { transaction: t });
      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
      };
      let whereQuery = {
        where: {
          id: id,
        },
      };
      await services.topicTaskService.updateTopicTask(statusToUpdate, whereQuery, { transaction: t });
      await t.commit();
      return res.status(httpStatus.OK).send({
        message: "Sheet marked As Complete Successfully",
      });
    } catch (err) {
      await t.rollback();
      return res.json({ status: 501, error: err.message });
    }
  },

  async EditSubTopic(req, res, next) {
    const values = req.body;
    const DeleteSubTopics = values.deleteSubTopics;
    const EditSubTopics = values.editSubTopics;
    const t = await db.transaction();
    try {
      let responseMessage = {}
      if (EditSubTopics.length > 0) {
        // Check and create new subTopics from newNames
        const createdSubTopics = [];
        for (const nameObj of EditSubTopics) {
          let existingSubTopic = await services.topicService.checkSubTopicDuplicateName(
            nameObj.name, 
            { transaction: t }
          );
          if (existingSubTopic === null) {
            // Create new subTopic and map it to the taskSubTopicMappping table
            const subtopic = await services.topicService.createSubTopic(nameObj.name, { transaction: t });
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: subtopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData, { transaction: t });
            createdSubTopics.push(subtopic);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: existingSubTopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData, { transaction: t });
          }
        }
        responseMessage.createdNewSubTopics = createdSubTopics
        // res.status(httpStatus.CREATED).send(createdSubTopics);
      }
      // Delete mappings from TaskSubTopicMapping based on deleteSubTopics array
      if (DeleteSubTopics.length > 0) {
        for (const subTopic of DeleteSubTopics) {
          await TaskSubTopicMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              subTopicId: subTopic.id,
            },
          });
          let findSubTopic = await TaskSubTopicMapping.findAll({
            where: { subTopicId: subTopic.id },
            raw: true,
            transaction: t
          });
          if (findSubTopic.length === 0) {
            await SubTopic.destroy({
              where: { id: subTopic.id },
              transaction: t
            });
          }
        }
        responseMessage.DeletedSubTopics = "Deleted Successfully"
        // res.status(httpStatus.OK).send({ message: "Deleted Successfully" });
      }
      await t.commit();
      res.status(httpStatus.OK).send({responseMessage})
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async EditVocabulary(req, res, next) {
    const values = req.body;
    const DeleteVocab = values.deleteVocab;
    const EditVocab = values.editVocab;
    const t = await db.transaction();
    try {
      let responseMessage = {}
      if (EditVocab.length > 0) {
        // Check and create new Vocab from newNames
        const createdVocabs = [];
        for (const nameObj of EditVocab) {
          let existingVocab = await services.topicService.checkVocabDuplicateName(nameObj.name, { transaction: t });
          if (existingVocab === null) {
            // Create new Vocab and map it to the taskVocabMappping table
            const vocab = await services.topicService.createVocabulary(nameObj.name, { transaction: t });
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: vocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData, { transaction: t });
            createdVocabs.push(vocab);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: existingVocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData, { transaction: t });
          }
        }
        responseMessage.createdNewVocabs = createdVocabs
        // res.status(httpStatus.CREATED).send(createdVocabs);
      }
      // Delete mappings from TaskVocabMapping based
      if (DeleteVocab.length > 0) {
        for (const Vocab of DeleteVocab) {
          await TaskVocabularyMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              vocabularyId: Vocab.id,
            },
            transaction: t
          });
          let findVocab = await TaskVocabularyMapping.findAll({
            where: { vocabularyId: Vocab.id },
            raw: true,
            transaction: t
          });
          
          if (findVocab.length === 0) {
            await Vocabulary.destroy({
              where: { id: Vocab.id },
              transaction: t
            });
          }
        }
        responseMessage.DeletedVocab = "Deleted Successfully"
        // res.status(httpStatus.OK).send({ message: "Deleted Successfully" });
      }
      await t.commit();
      res.status(httpStatus.OK).send({responseMessage})
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async DeleteTopicAndAllRelatedData(req, res, next) {
    const values = req.body;
    const t = await db.transaction();
    try {
      let findTopicInSubTopicMapping = await TaskSubTopicMapping.findAll({
        where: {
          topicId: values.topicId,
          topicTaskId: values.topicTaskId,
        },
        raw: true,
        transaction: t,
      });
      if (findTopicInSubTopicMapping.length > 0) {
        for (const subTopic of findTopicInSubTopicMapping) {
          await TaskSubTopicMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              subTopicId: subTopic.subTopicId,
            },
            transaction: t,
          });
          let findSubTopic = await TaskSubTopicMapping.findAll({
            where: { subTopicId: subTopic.subTopicId },
            raw: true,
            transaction: t,
          });
          console.log(findSubTopic, findSubTopic.length, subTopic.subTopicId);
          if (findSubTopic.length === 0) {
            await SubTopic.destroy({
              where: { id: subTopic.subTopicId },
              transaction: t,
            });
          }
        }
      }

      let findTopicInVocabMapping = await TaskVocabularyMapping.findAll({
        where: {
          topicId: values.topicId,
          topicTaskId: values.topicTaskId,
        },
        raw: true,
        transaction: t,
      });
      if (findTopicInVocabMapping.length > 0) {
        for (const Vocab of findTopicInVocabMapping) {
          await TaskVocabularyMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              vocabularyId: Vocab.vocabularyId,
            },
            transaction: t,
          });
          let findVocab = await TaskVocabularyMapping.findAll({
            where: { vocabularyId: Vocab.vocabularyId },
            raw: true,
            transaction: t,
          });
          if (findVocab.length === 0) {
            await Vocabulary.destroy({
              where: { id: Vocab.vocabularyId },
              transaction: t,
            });
          }
        }
      }

      let findTopicInTopicMapping = await TaskTopicMapping.findAll({
        where: {
          topicId: values.topicId,
          topicTaskId: values.topicTaskId,
        },
        raw: true,
        transaction: t,
      });
      if (findTopicInTopicMapping.length > 0) {
        for (const topic of findTopicInTopicMapping) {
          await TaskTopicMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              topicId: topic.topicId,
            },
            transaction: t,
          });
          let findTopic = await TaskTopicMapping.findAll({
            where: { topicId: topic.topicId },
            raw: true,
            transaction: t,
          });
          if (findTopic.length === 0) {
            await Topic.destroy({
              where: { id: topic.topicId },
              transaction: t,
            });
          }
        }
      }
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Deleted Successfully" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
};

module.exports = TopicDGController;
