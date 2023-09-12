const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const {
  createQuestionsSchema,
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
} = require("../../validations/QuestionManagementValidation");
const { FillDropDownOption } = require("../../models/FillDropDownOption");
const { Question } = require("../../models/Question");
const { ApiError } = require("../../middlewares/apiError");
const { MatchQuestionPair } = require("../../models/MatchQuestionPair");
const { DrawingQuestion } = require("../../models/DrawingQuestion");

const QuestionManagementSarveshController = {
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

      console.log(values);

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

      let { id, ...rest } = values;

      let whereQuery = { where: { id: id } };

      let dataToBeUpdated = rest;

      await services.questionService.editQuestion(dataToBeUpdated, whereQuery, {
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
        if (matchPairs[i].matchPhraseContent) {
          let buffer = Buffer.from(
            matchPairs[i].matchPhraseContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          let fileObj = {
            originalname: matchPairs[i].matchPhraseContent.filename,
            mimetype: matchPairs[i].matchPhraseContent.mimetype,
            buffer: buffer,
          };

          let fileName = await services.questionService.uploadFile(fileObj);
          console.log(fileName);
          dataToBeCreated.matchPhraseContent = fileName;
        }

        if (matchPairs[i].matchTargetContent) {
          let buffer = Buffer.from(
            matchPairs[i].matchTargetContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          let fileObj = {
            originalname: matchPairs[i].matchTargetContent.filename,
            mimetype: matchPairs[i].matchTargetContent.mimetype,
            buffer: buffer,
          };

          let fileName = await services.questionService.uploadFile(fileObj);
          console.log(fileName);
          dataToBeCreated.matchTargetContent = fileName;
        }
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

      console.log(questionValues);

      let updateValues = await editMatchQuestionPairsSchema.validateAsync({
        pairsToBeUpdated,
        pairsToBeAdded,
      });

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
              where: { id: updatePairs[i].id, questionId: questionValues.id },
            },
            { transaction: t }
          );
        }

        await services.questionService.editQuestion(
          questionValues,
          { where: { id: questionValues.id } },
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
        if (dataToBeAdded[i].matchPhraseContent) {
          let buffer = Buffer.from(
            dataToBeAdded[i].matchPhraseContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          let fileObj = {
            originalname: dataToBeAdded[i].matchPhraseContent.filename,
            mimetype: dataToBeAdded[i].matchPhraseContent.mimetype,
            buffer: buffer,
          };

          let fileName = await services.questionService.uploadFile(fileObj);
          console.log(fileName);
          dataToBeCreated.matchPhraseContent = fileName;
        }

        if (dataToBeAdded[i].matchTargetContent) {
          let buffer = Buffer.from(
            dataToBeAdded[i].matchTargetContent.buffer.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );

          let fileObj = {
            originalname: dataToBeAdded[i].matchTargetContent.filename,
            mimetype: dataToBeAdded[i].matchTargetContent.mimetype,
            buffer: buffer,
          };

          let fileName = await services.questionService.uploadFile(fileObj);
          console.log(fileName);
          dataToBeCreated.matchTargetContent = fileName;
        }
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
      let { canvasJson, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let drawingQuestionValues = await createDrawingQuestionSchema.validateAsync({
        canvasJson: canvasJson,
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
          canvasJson: drawingQuestionValues.canvasJson,
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

      let { id, ...questionData } = questionValues;

      await services.questionService.editQuestion(
        questionValues,
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
      let { dataGeneratorJson, studentJson, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      console.log(questionValues);

      let labelDragQuestionValues = await createLabelDragQuestionSchema.validateAsync({
        dataGeneratorJson: dataGeneratorJson,
        studentJson: studentJson,
      });

      // let question = await services.questionService.createQuestion()

      console.log(labelDragQuestionValues);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = QuestionManagementSarveshController;
