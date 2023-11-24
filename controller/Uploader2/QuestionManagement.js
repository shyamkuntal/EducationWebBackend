const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { createQuestionsSchema } = require("../../validations/QuestionManagementValidation");
const { MatchQuestion } = require("../../models/MatchQuestionPair");
const { QuestionDistractor } = require("../../models/distractor");

const QuestionManagementController = {
  async MatchQues(req, res, next) {
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

      let options = data.options;
      let questionId = await createdQuestion.id;

      const createdOptions = await Promise.all(
        options.map(async (option) => {
          let contentFileName = null;
          if (option.content) {
            contentFileName = await services.questionService.uploadFile(option.content);
          }

          const createdOption = await MatchQuestion.create(
            {
              questionId,
              matchPhrase: option.matchPhrase,
              distractor: option.distractor,
              matchTarget: option.distractor,
              MatchPhraseContent: option.MatchPhraseContent || null,
              MatchTargetContent: option.MatchTargetContent || null,
              distractorContent: option.distractorContent || null,
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

  async createQuestion(req, res, next) {
    try {
      console.log(req.body);
      let values = await createQuestionsSchema.validateAsync(req.body);

      let question = await services.questionService.createQuestion(values);
      res.status(httpStatus.OK).send(question);
    } catch (err) {
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
      await t.rollback()
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
            where: { questionId: questionId, id: dataToBeUpdated[i].id },transaction: t
          },
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
      await t.rollback()
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
              where: { id: updatePairs[i].id, questionId: id }, transaction: t
            },
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
      let { dataGeneratorJson, studentJson, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let drawingQuestionValues = await createDrawingQuestionSchema.validateAsync({
        dataGeneratorJson,
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
          dataGeneratorJson: drawingQuestionValues.dataGeneratorJson,
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
          { where: { questionId: id }, transaction: t },
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

      let labelDragQuestionValues = await createLabelDragQuestionSchema.validateAsync({
        dataGeneratorJson: dataGeneratorJson,
        studentJson: studentJson,
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
          dataGeneratorJson: labelDragQuestionValues.dataGeneratorJson,
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
      let { newDataGeneratorCanvasJson, newStudentCanvasJson, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let labelDragQuestionValues = await editLabelDragQuestionSchema.validateAsync({
        newDataGeneratorCanvasJson,
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

      if (
        labelDragQuestionValues.newDataGeneratorCanvasJson &&
        labelDragQuestionValues.newStudentCanvasJson
      ) {
        await LabelDragQuestion.update(
          {
            dataGeneratorJson: labelDragQuestionValues.newDataGeneratorCanvasJson,
            studentJson: labelDragQuestionValues.newStudentCanvasJson,
          },
          { where: { questionId: questionValues.id },transaction: t  },
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
        await t.rollback();
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
      let { dataGeneratorData, studentData, allowAlgebraInput, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      let geogebraQuestionValues = await createGeogebraGraphQuestionSchema.validateAsync({
        dataGeneratorData,
        studentData,
        allowAlgebraInput,
      });

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        await t.rollback();
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createGeoGebraQuestion = await GeogebraGraphQuestion.create(
        {
          questionId: newQuestionData.id,
          dataGeneratorData: geogebraQuestionValues.dataGeneratorData,
          studentData: geogebraQuestionValues.studentData,
          allowAlgebraInput: geogebraQuestionValues.allowAlgebraInput,
        },
        { transaction: t }
      );

      res
        .status(httpStatus.OK)
        .send({ message: "Geogebra question created!", geogebraQuestion: createGeoGebraQuestion });

      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async editGeogebraQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { newDataGeneratorJson, newStudentJson, allowAlgebraInput, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let geogebraQuestionValues = await editGeogebraGraphQuestionSchema.validateAsync({
        newDataGeneratorJson,
        newStudentJson,
        allowAlgebraInput,
      });

      let { id, questionData } = questionValues;

      await services.questionService.editQuestion(
        questionData,
        { where: { id: id } },
        { transaction: t }
      );

      if (geogebraQuestionValues.newDataGeneratorJson && geogebraQuestionValues.newStudentJson) {
        await GeogebraGraphQuestion.update(
          {
            dataGeneratorJson: geogebraQuestionValues.newDataGeneratorJson,
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
      await t.rollback()
      next(err);
    }
  },
  async createDesmosGraphQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { dataGeneratorJson, studentJson, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync(rest);

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let desmosGraphQuestionValues = await createDesmosGraphQuestionSchema.validateAsync({
        dataGeneratorJson,
        studentJson,
      });

      let question = await services.questionService.createQuestion(questionValues, {
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      let createDesmosQuestion = await DesmosGraphQuestion.create(
        {
          questionId: newQuestionData.id,
          dataGeneratorJson: desmosGraphQuestionValues.dataGeneratorJson,
          studentJson: desmosGraphQuestionValues.studentJson,
        },
        { transaction: t }
      );

      await t.commit();

      res
        .status(httpStatus.OK)
        .send({ message: "Desmos Graph Question created!", desmosQuestion: createDesmosQuestion });
    } catch (err) {
      await t.rollback()
      next(err);
    }
  },
  async editDesmosGraphQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let { newDataGeneratorJson, newStudentJson, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      let desmosQuestionValues = await editDesmosGraphQuestionSchema.validateAsync({
        newDataGeneratorJson,
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
            dataGeneratorJson: desmosQuestionValues.newDataGeneratorJson,
            studentJson: desmosQuestionValues.newStudentJson,
          },
          { where: { questionId: id },transaction: t },
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Desmos Graph Question Updated!" });
    } catch (err) {
      await t.rollback()
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
      let { dataGeneratorJson, studentJson, hotSpotIds, ...rest } = req.body;
      let questionValues = await createQuestionsSchema.validateAsync(rest);

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        await t.commit();
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let hotSpotQuestionValues = await createHotSpotQuestionSchema.validateAsync({
        dataGeneratorJson,
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
          dataGeneratorJson: hotSpotQuestionValues.dataGeneratorJson,
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
      let { newDataGeneratorJson, newStudentJson, hotSpotIds, ...rest } = req.body;
      let questionValues = await editQuestionSchema.validateAsync(rest);

      console.log(questionValues);

      let hotSpotQuestionValues = await editHotSpotQuestionSchema.validateAsync({
        newDataGeneratorJson,
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
            dataGeneratorJson: hotSpotQuestionValues.newDataGeneratorJson,
            studentJson: hotSpotQuestionValues.newStudentJson,
          },
          { where: { questionId: id },transaction: t },
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
          { where: { id: sortQuestionOptionToBeUpdated[i].id, questionId: id },transaction: t },
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



  
};



module.exports = QuestionManagementController;
