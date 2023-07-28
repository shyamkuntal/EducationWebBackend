const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumberSheet.js");
const httpStatus = require("http-status");
const services = require("../../services/index.js");
const { User, Roles } = require("../../models/User.js");
const CONSTANTS = require("../../constants/constants.js");
const {
  getPaperNumberByPaperNumberSheetSchema,
} = require("../../validations/PaperNumberValidations.js");
const {
  assignTopicTaskToSupervisorSchema,
  assignPaperNumberSheetToSupervisorSchema,
} = require("../../validations/DataGeneratorValidations.js");
const {
  getRecheckingCommentsSchema,
} = require("../../validations/PaperNumberReviewerValidations.js");
const {
  createTopicTaskSchema,
  createTopicSchema,
  createSubTopicSchema,
  createVocabularySchema,
} = require("../../validations/TopicManagementValidations.js");
const {
  TaskTopicMapping,
  TaskSubTopicMapping,
  TaskVocabularyMapping,
} = require("../../models/TopicTaskMapping.js");
const { SubTopicMapping, VocabularyMapping } = require("../../models/Topic.js");

const DataGeneratorController = {
  //take care of isarchived and ispublished later

  // Paper Number Controller

  async createPaperNumber(req, res, next) {
    try {
      const { paperNumberSheetId, paperNumber } = req.body;

      // Find the PaperNumberSheet
      const paperNumberSheet = await PaperNumberSheet.findByPk(paperNumberSheetId);
      if (!paperNumberSheet) {
        return res.status(404).json({ error: "PaperNumberSheet not found" });
      }

      // Create PaperNumbers
      // if single paperNumber
      if (!Array.isArray(paperNumber)) {
        const createdPaperNumber = await PaperNumber.create({
          paperNumberSheetId,
          paperNumber,
        });
        return res.status(200).json({ paperNumber: createdPaperNumber });
      } else {
        const createdPaperNumbers = await Promise.all(
          paperNumber.map(async (paperNumber) => {
            const createdPaperNumber = await PaperNumber.create({
              paperNumberSheetId,
              paperNumber,
            });
            return createdPaperNumber;
          })
        );
        return res.status(httpStatus.OK).send({ paperNumber: createdPaperNumbers });
      }
    } catch (error) {
      console.error("Error creating PaperNumbers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  async deletePaperNumber(req, res, next) {
    try {
      const { paperNumberId } = req.body;

      // Find the PaperNumber
      const paperNumber = await PaperNumber.findByPk(paperNumberId);
      if (!paperNumber) {
        return res.status(404).json({ error: "PaperNumber not found" });
      }

      // Delete the PaperNumber
      await paperNumber.destroy();

      return res.status(200).json({ message: "PaperNumber deleted successfully" });
    } catch (error) {
      console.error("Error deleting PaperNumber:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  async getAllPaperNumber(req, res, next) {
    try {
      const paperNumbers = await PaperNumber.findAll();
      res.status(httpStatus.OK).send(paperNumbers);
    } catch (error) {
      next(error);
      console.error("Error retrieving PaperNumbers:", error);
      res.status(500).json({ error: "Failed to retrieve PaperNumbers" });
    }
  },

  async getPaperNumberByPaperNumberSheet(req, res, next) {
    try {
      let values = await getPaperNumberByPaperNumberSheetSchema.validateAsync({
        paperNumberSheetId: req.query.paperNumberSheetId,
      });

      let whereQuery = { where: { paperNumberSheetId: values.paperNumberSheetId }, raw: true };

      let paperNumber = await services.paperNumberService.findPaperNumber(whereQuery);

      res.status(httpStatus.OK).send(paperNumber);
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async EditPaperNumber(req, res, next) {
    try {
      const { paperNumberSheetId, textFields } = req.body;

      // Find the PaperNumberSheet
      const paperNumberSheet = await PaperNumberSheet.findByPk(paperNumberSheetId);
      if (!paperNumberSheet) {
        return res.status(404).json({ error: "PaperNumberSheet not found" });
      }

      // Update PaperNumbers
      const updatedPaperNumbers = await Promise.all(
        textFields.map(async (field) => {
          const { id, paperNumber } = field;
          const existingPaperNumber = await PaperNumber.findOne({
            where: {
              paperNumberSheetId,
              id,
            },
          });

          if (!existingPaperNumber) {
            return res.status(404).json({ error: `PaperNumber not found for ID ${id}` });
          }

          existingPaperNumber.paperNumber = paperNumber;
          return existingPaperNumber.save();
        })
      );

      res
        .status(httpStatus.OK)
        .send({ message: "PaperNumber updated successfully", updatedPaperNumbers });
    } catch (error) {
      console.error("Error updating PaperNumber:", error);
      next(error);
      res.status(500).json({ error: "Failed to update PaperNumber" });
    }
  },

  async SubmitToSupervisor(req, res, next) {
    try {
      let values = await assignPaperNumberSheetToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let userData = await services.userService.finduser(
        values.dataGeneratorId,
        CONSTANTS.roleNames.DataGenerator
      );
      let sheetData = await services.paperNumberSheetService.findSheetAndUser(
        values.paperNumberSheetId
      );

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
        let statusToUpdate = await services.paperNumberSheetService.updatePaperNumberSheet(
          dataToBeUpdated,
          whereQuery
        );

        let createLog = await services.paperNumberSheetService.createSheetLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          CONSTANTS.sheetLogsMessages.DataGeneratorAssignToSupervisor
        );

        if (statusToUpdate.length > 0 && createLog) {
          responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
          responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
          responseMessage.sheetLog = "Log record for Task to supervisor added successfully";
        }

        res.status(httpStatus.OK).send({ message: responseMessage });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async MarkitasInProgress(req, res) {
    const id = req.body.paperNumberSheetId;

    try {
      const sheetData = await services.paperNumberSheetService.findPaperNumberSheetByPk(id);

      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };
      let whereQuery = {
        where: {
          id: sheetData.id,
        },
      };
      let response = await services.paperNumberSheetService.updatePaperNumberSheet(
        statusToUpdate,
        whereQuery
      );

      return res.status(httpStatus.OK).send({
        message: "Sheet marked InProgress successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({ status: 501, error: err.message });
    }
  },

  async Markitascomplete(req, res) {
    const id = req.body.paperNumberSheetId;

    try {
      const sheetData = await services.paperNumberSheetService.findPaperNumberSheetByPk(id);

      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
      };
      let whereQuery = {
        where: {
          id: sheetData.id,
        },
      };
      let response = await services.paperNumberSheetService.updatePaperNumberSheet(
        statusToUpdate,
        whereQuery
      );

      return res.status(httpStatus.OK).send({
        message: "Sheet marked Complete successfully",
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async getRecheckComment(req, res, next) {
    try {
      let values = await getRecheckingCommentsSchema.validateAsync({
        paperNumberSheetId: req.query.paperNumberSheetId,
      });

      console.log(values);

      let getRecheckComments = await services.paperNumberSheetService.findRecheckingComments(
        values.paperNumberSheetId
      );

      res.status(httpStatus.OK).send(getRecheckComments);
    } catch (err) {
      next(err);
    }
  },

  // ******************* Topic Controller **********************//

  async createTopic(req, res, next) {
    try {
      let values = await createTopicSchema.validateAsync(req.body);
      const names = values.name;
      console.log(names);

      // await services.topicTaskService.checkTopicTask(dataToBeCreated);
      if (!Array.isArray(names)) {
        let dataToBeCreated = {
          name: values.name,
        };
        const topic = await services.topicService.createTopic(dataToBeCreated);

        const sentData = {
          topicTaskId: values.topicTaskId,
          topicId: topic.id,
        };
        let taskMapData = await TaskTopicMapping.create(sentData);
        return res.status(httpStatus.CREATED).send(topic);
      } else {
        const topics = await Promise.all(
          names.map(async (topicName) => {
            const dataToBeCreated = {
              name: topicName,
            };
            const topic = await services.topicService.createTopic(dataToBeCreated);

            return { name: topic.name, topicTaskId: values.topicTaskId, topicId: topic.id };
          })
        );
        const taskMapData = await TaskTopicMapping.bulkCreate(topics);
        res.status(httpStatus.CREATED).send(topics);
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async createSubTopic(req, res, next) {
    try {
      let values = await createSubTopicSchema.validateAsync(req.body);
      const names = values.name;

      if (!Array.isArray(names)) {
        let dataToBeCreated = {
          name: values.name,
        };
        const subtopic = await services.topicService.createSubTopic(dataToBeCreated);

        // creating Task sub-topic mapping 

        let sentTaskData = {
          topicTaskId: values.topicTaskId,
          subTopicId: subtopic.id,
        };
        let taskMapData = await TaskSubTopicMapping.create(sentTaskData);

        // creating sub-topic mapping 

        let subTopicData = {
          topicId: values.topicId,
          subTopicId: subtopic.id,
        };

        let subTopicMapData = await SubTopicMapping.create(subTopicData);
        return res.status(httpStatus.CREATED).send(subtopic);
      } else {
        const subtopics = await Promise.all(
          names.map(async (subTopicName) => {
            const dataToBeCreated = {
              name: subTopicName,
            };
            const subtopic = await services.topicService.createSubTopic(dataToBeCreated);

            return { name: subtopic.name, topicTaskId: values.topicTaskId, subTopicId: subtopic.id, topicId: values.topicId };
          })
        );

        // creating Task sub-topic mapping 
        const taskMapData = await TaskSubTopicMapping.bulkCreate(subtopics);

        // creating sub-topic mapping 

        let subTopicMapData = await SubTopicMapping.bulkCreate(subtopics);

        res.status(httpStatus.CREATED).send(subtopics);
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async createVocabulary(req, res, next) {
    try {
      let values = await createVocabularySchema.validateAsync(req.body);
      const names = values.name;

      if (!Array.isArray(names)) {
        let dataToBeCreated = {
          name: values.name,
        };
        let vocabulary = await services.topicService.createVocabulary(dataToBeCreated);

        // creating Task sub-topic mapping 

        let sentTaskData = {
          topicTaskId: values.topicTaskId,
          vocabularyId: vocabulary.id,
        };
        let taskMapData = await TaskVocabularyMapping.create(sentTaskData);

        // creating sub-topic mapping 

        let vocabData = {
          topicId: values.topicId,
          vocabularyId: vocabulary.id,
        };

        let vocabMapData = await VocabularyMapping.create(vocabData);
        return res.status(httpStatus.CREATED).send(vocabulary);
      } else {
        const vocabulary = await Promise.all(
          names.map(async (vocab) => {
            const dataToBeCreated = {
              name: vocab,
            };
            let vocabularyData = await services.topicService.createVocabulary(dataToBeCreated);

            return { name: vocabularyData.name, topicTaskId: values.topicTaskId, vocabularyId: vocabularyData.id, topicId: values.topicId };
          })
        );

          console.log(vocabulary)
        // creating Task sub-topic mapping 
        let taskMapData = await TaskVocabularyMapping.bulkCreate(vocabulary);

        // creating sub-topic mapping 

        let vocabMapData = await VocabularyMapping.bulkCreate(vocabulary);

        res.status(httpStatus.CREATED).send(vocabulary);
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  //  log error
  async SubmitTopicTaskToSupervisor(req, res, next) {
    try {
      let values = await assignTopicTaskToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let userData = await services.userService.finduser(
        values.dataGeneratorId,
        CONSTANTS.roleNames.DataGenerator
      );
      let sheetData = await services.topicService.findSheetAndUser(values.topicTaskId);

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
          whereQuery
        );

        // let createLog = await services.topicTaskService(
        //   sheetData.id,
        //   sheetData.supervisor.Name,
        //   userData.Name,
        //   CONSTANTS.sheetLogsMessages.DataGeneratorAssignToSupervisor
        // );

        // if (statusToUpdate.length > 0 && createLog) {
        //   responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
        //   responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
        //   responseMessage.sheetLog = "Log record for Task to supervisor added successfully";
        // }

        res.status(httpStatus.OK).send({ message: responseMessage });
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async MarkTopicTaskasInProgress(req, res) {
    const id = req.body.topicTaskId;

    try {
      const sheetData = await services.topicService.findPaperNumberSheetByPk(id);

      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };
      let whereQuery = {
        where: {
          id: sheetData.id,
        },
      };
      let response = await services.topicService.updatePaperNumberSheet(statusToUpdate, whereQuery);

      return res.status(httpStatus.OK).send({
        message: "Sheet marked InProgress successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({ status: 501, error: err.message });
    }
  },

  async MarkTopicTaskascomplete(req, res) {
    const id = req.body.paperNumberSheetId;

    try {
      const sheetData = await services.topicService.findPaperNumberSheetByPk(id);

      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
      };
      let whereQuery = {
        where: {
          id: sheetData.id,
        },
      };
      let response = await services.topicService.updatePaperNumberSheet(statusToUpdate, whereQuery);

      return res.status(httpStatus.OK).send({
        message: "Sheet marked Complete successfully",
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },
};

module.exports = DataGeneratorController;
