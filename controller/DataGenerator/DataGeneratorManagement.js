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
const { Topic, SubTopic } = require("../../models/Topic.js");
const { Vocabulary } = require("../../models/Vocabulary.js");

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

  // ******************* Topic Controller ********************** //

  async createTopic(req, res, next) {
    try {
      let values = await createTopicSchema.validateAsync(req.body);
      // Check if the topic name already exists
      const existingTopic = await services.topicService.checkTopicDuplicateName(values.name);
      const existingTopicInMapping = existingTopic
        ? await services.topicService.checkTopicDuplicateNamebyTaskId(existingTopic.id, values.topicTaskId)
        : null;

      if (!existingTopicInMapping) {
        if (existingTopic) {
          // If the topic name already exists, only add mapping
          const sentData = {
            topicTaskId: values.topicTaskId,
            topicId: existingTopic.id,
          };

          let mapData = await TaskTopicMapping.create(sentData);
          return res.status(httpStatus.CREATED).send(mapData);
        } else {
          let dataToBeCreated = {
            name: values.name,
          };
          console.log(dataToBeCreated);
          const topic = await services.topicService.createTopic(dataToBeCreated);

          const sentData = {
            topicTaskId: values.topicTaskId,
            topicId: topic.id,
          };

          await TaskTopicMapping.create(sentData);

          return res.status(httpStatus.CREATED).send(topic);
        }
      } else {
        return res.status(httpStatus.OK).send({ message: "Already Present" });
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async createSubTopic(req, res, next) {
    const values = req.body;
    const importNames = values.importNames;
    const newNames = values.newNames;
    try {
      if (newNames.length > 0) {
        // Check and create new subTopics from newNames
        const createdSubTopics = [];
        for (const nameObj of newNames) {
          let existingTopic = await services.topicService.checkSubTopicDuplicateName(nameObj.name);
          if (existingTopic === null) {
            // Create new subTopic and map it to the taskSubTopicMappping table
            const subtopic = await services.topicService.createSubTopic(nameObj.name);
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: subtopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData);
            createdSubTopics.push(subtopic);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: existingTopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData);
          }
        }
        res.status(httpStatus.CREATED).send(createdSubTopics);
      }
      // Map the data in taskSubTopicMapping table based on importNames.
      if (importNames.length > 0) {
        const createdMappings = [];
        for (const nameObj of importNames) {
          let existingSubTopic = await services.topicService.checkSubTopicDuplicateNamebyTaskId(
            nameObj.id,
            values.topicTaskId
          );
          if (!existingSubTopic) {
            const sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: nameObj.id,
            };
            await TaskSubTopicMapping.create(sentTaskData);
            createdMappings.push(sentTaskData);
          }
        }
        if (createdMappings.length > 0) {
          res.status(httpStatus.CREATED).send(createdMappings);
        } else {
          return res.status(httpStatus.OK).send({ message: "Already Present" });
        }
      }
    } catch (err) {
      next(err);
      console.log(err);
    }
  },

  async createVocabulary(req, res, next) {
    const values = req.body;
    const importNames = values.importNames;
    const newNames = values.newNames;
    try {
      if (newNames.length > 0) {
        // Check and create new Vocab from newNames
        const createdVocabs = [];
        for (const nameObj of newNames) {
          let existingVocab = await services.topicService.checkVocabDuplicateName(nameObj.name);
          if (existingVocab === null) {
            // Create new Vocab and map it to the taskVocabMappping table
            const vocab = await services.topicService.createVocabulary(nameObj.name);
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: vocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData);
            createdVocabs.push(vocab);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: existingVocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData);
          }
        }
        res.status(httpStatus.CREATED).send(createdVocabs);
      }
      // Map the data in taskVocabMapping table based on importNames.
      if (importNames.length > 0) {
        const createdMappings = [];
        for (const nameObj of importNames) {
          let existingVocab = await services.topicService.checkVocabDuplicateNamebyTaskId(
            nameObj.id,
            values.topicTaskId
          );
          if (!existingVocab) {
            const sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: nameObj.id,
            };
            await TaskVocabularyMapping.create(sentTaskData);
            createdMappings.push(sentTaskData);
          }
        }
        if (createdMappings.length > 0) {
          res.status(httpStatus.CREATED).send(createdMappings);
        } else {
          return res.status(httpStatus.OK).send({ message: "Already Present" });
        }
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

        let createLog = await services.topicTaskService.createTopicTaskLog(
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

  async MarkTopicTaskasInProgress(req, res) {
    const id = req.body.topicTaskId;
    try {
      let whereQueryForTaskFind = { where: { id: id }, raw: true };
      const sheetData = await services.topicTaskService.findTopicTasks(whereQueryForTaskFind)
      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };
      let whereQuery = {
        where: {
          id: id,
        },
      };
      await services.topicTaskService.updateTopicTask(statusToUpdate, whereQuery);
      return res.status(httpStatus.OK).send({
        message: "Sheet marked As InProgress Successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({ status: 501, error: err.message });
    }
  },

  async MarkTopicTaskascomplete(req, res) {
    const id = req.body.topicTaskId;

    try {
      let whereQueryForTaskFind = { where: { id: id }, raw: true };
      const sheetData = await services.topicTaskService.findTopicTasks(whereQueryForTaskFind);
      let statusToUpdate = {
        statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
      };
      let whereQuery = {
        where: {
          id: id,
        },
      };
      await services.topicTaskService.updateTopicTask(statusToUpdate, whereQuery);
      return res.status(httpStatus.OK).send({
        message: "Sheet marked As Complete Successfully",
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async EditSubTopic(req, res, next) {
    const values = req.body;
    const DeleteSubTopics = values.deleteSubTopics;
    const EditSubTopics = values.editSubTopics;

    try {
      if (EditSubTopics.length > 0) {
        // Check and create new subTopics from newNames
        const createdSubTopics = [];
        for (const nameObj of EditSubTopics) {
          let existingSubTopic = await services.topicService.checkSubTopicDuplicateName(nameObj.name);
          if (existingSubTopic === null) {
            // Create new subTopic and map it to the taskSubTopicMappping table
            const subtopic = await services.topicService.createSubTopic(nameObj.name);
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: subtopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData);
            createdSubTopics.push(subtopic);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              subTopicId: existingSubTopic.id,
            };
            await TaskSubTopicMapping.create(sentTaskData);
          }
        }
        res.status(httpStatus.CREATED).send(createdSubTopics);
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
            raw: true
          })
          if(findSubTopic.length === 0){
            await SubTopic.destroy({
              where: { id: subTopic.id }
            });
          }
        }
        res.status(httpStatus.OK).send({message: "Deleted Successfully"});
      }
    } catch (err) {
      console.log(err)
      next(err)
    }
  },

  async EditVocabulary(req, res, next) {
    const values = req.body;
    const DeleteVocab = values.deleteVocab;
    const EditVocab = values.editVocab;

    try {
      if (EditVocab.length > 0) {
        // Check and create new Vocab from newNames
        const createdVocabs = [];
        for (const nameObj of EditVocab) {
          let existingVocab = await services.topicService.checkVocabDuplicateName(nameObj.name);
          if (existingVocab === null) {
            // Create new Vocab and map it to the taskVocabMappping table
            const vocab = await services.topicService.createVocabulary(nameObj.name);
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: vocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData);
            createdVocabs.push(vocab);
          } else {
            let sentTaskData = {
              topicTaskId: values.topicTaskId,
              topicId: values.topicId,
              vocabularyId: existingVocab.id,
            };
            await TaskVocabularyMapping.create(sentTaskData);
          }
        }
        res.status(httpStatus.CREATED).send(createdVocabs);
      }
      // Delete mappings from TaskVocabMapping based 
      if (DeleteVocab.length > 0) {
        for (const Vocab of DeleteVocab) {
          await TaskVocabularyMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              vocabularyId: Vocab.id,
            },
          });
          let findVocab = await TaskVocabularyMapping.findAll({
            where: { vocabularyId: Vocab.id },
            raw: true
          })
          console.log(findVocab.length)
          if(findVocab.length === 0){
            await Vocabulary.destroy({
              where: { id: Vocab.id }
            });
          }
        }
        res.status(httpStatus.OK).send({message: "Deleted Successfully"});
      }
    } catch (err) {
      console.log(err)
      next(err)
    }
  },

  async DeleteTopicAndAllRelatedData(req, res, next){
    const values = req.body;
    try {
      let findTopicInSubTopicMapping = await TaskSubTopicMapping.findAll({
        where: { 
          topicId: values.topicId,
          topicTaskId: values.topicTaskId 
        },
        raw: true
      })
      if(findTopicInSubTopicMapping.length > 0) {
        for (const subTopic of findTopicInSubTopicMapping) {
          await TaskSubTopicMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              subTopicId: subTopic.subTopicId,
            },
          });
          let findSubTopic = await TaskSubTopicMapping.findAll({
            where: { subTopicId: subTopic.id },
            raw: true
          })
          if(findSubTopic.length === 0){
            await SubTopic.destroy({
              where: { id: subTopic.subTopicId }
            });
          }
        }
      }

      let findTopicInVocabMapping = await TaskVocabularyMapping.findAll({
        where: { 
          topicId: values.topicId,
          topicTaskId: values.topicTaskId 
        },
        raw: true
      })
      if(findTopicInVocabMapping.length > 0){
        for (const Vocab of findTopicInVocabMapping) {
          await TaskVocabularyMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              vocabularyId: Vocab.vocabularyId,
            },
          });
          let findVocab = await TaskVocabularyMapping.findAll({
            where: { vocabularyId: Vocab.vocabularyId },
            raw: true
          })
          if(findVocab.length === 0){
            await Vocabulary.destroy({
              where: { id: Vocab.vocabularyId }
            });
          }
        }
      }

      let findTopicInTopicMapping = await TaskTopicMapping.findAll({
        where: { 
          topicId: values.topicId,
          topicTaskId: values.topicTaskId 
        },
        raw: true
      })
      if(findTopicInTopicMapping.length > 0){
        for (const topic of findTopicInTopicMapping) {
          await TaskTopicMapping.destroy({
            where: {
              topicTaskId: values.topicTaskId,
              topicId: topic.topicId,
            },
          });
          let findTopic = await TaskTopicMapping.findAll({
            where: { topicId: topic.topicId },
            raw: true
          })
          if(findTopic.length === 0){
            await Topic.destroy({
              where: { id: topic.topicId }
            });
          }
        }
      }

      res.status(httpStatus.OK).send({message: "Deleted Successfully"});
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
};

module.exports = DataGeneratorController;
