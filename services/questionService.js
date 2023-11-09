const { Question } = require("../models/Question");
const { LongAnswerQuestion } = require("../models/LongAnswerQuestion");
const { FillTextDropDownOption } = require("../models/FillDropDownOption");
const { ApiError } = require("../middlewares/apiError");
const httpStatus = require("http-status");
const { generateFileName, s3Client } = require("../config/s3");
const { PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const db = require("../config/database");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { MatchQuestionPair } = require("../models/MatchQuestionPair");
const CONSTANTS = require("../constants/constants");
const { QuestionItem } = require("../models/items");
const { QuestionCategory } = require("../models/category");
const { TableQuestion } = require("../models/Table");
const { Accordian } = require("../models/accordianItems");
const { DrawingQuestion } = require("../models/DrawingQuestion");
const { LabelDragQuestion } = require("../models/LabelDragQuestion");
const { LabelFillQuestion } = require("../models/LabelFillQuestion");
const { GeogebraGraphQuestion } = require("../models/GeogebraGraphQuestion");
const { DesmosGraphQuestion } = require("../models/DesmosGraphQuestion");
const { HotSpotQuestion } = require("../models/HotSpotQuestion");
const { FillDropDownOption } = require("../models/FillDropDownOption");
const { SortQuestionOption } = require("../models/sortQuestionOptions");
const { McqQuestionOption } = require("../models/McqQuestionOption");
const { TrueFalseQuestionOption } = require("../models/TrueFalseQuestionOption");
const { QuestionContent } = require("../models/QuestionContent");
const { QuestionDistractor } = require("../models/distractor");

const createQuestion = async (dataToBeCreated, options) => {
  try {
    console.log(dataToBeCreated);
    let createQuestion = await Question.create(dataToBeCreated, options);

    return createQuestion;
  } catch (err) {
    throw err;
  }
};

const checkFillDropDownOptions = async (questionId) => {
  try {
    let options = await FillTextDropDownOption.findAll({ where: { questionId }, raw: true });

    if (options.length >= 10) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only 10 options allowed per question!");
    }
  } catch (err) {
    throw err;
  }
};

const getQuestionsDetailsById = async (questionId) => {
  try {
    let questionDetails = await Question.findOne({ where: { id: questionId }, raw: true });
    return questionDetails;
  } catch (err) {
    throw err;
  }
};

const deleteQuestion = async (whereQuery, options) => {
  try {
    if (whereQuery.where) {
      let deletedQuestion = await Question.destroy(whereQuery, options);

      return deletedQuestion;
    }
  } catch (err) {
    throw err;
  }
};

const editQuestion = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let question = await Question.update(dataToBeUpdated, whereQuery, options);

    return question;
  } catch (err) {
    throw err;
  }
};

const checkMatchQuestionPairs = async (questionId) => {
  try {
    let options = await MatchQuestionPair.findAll({ where: { questionId }, raw: true });

    if (options.length >= 20) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only 20 pairs allowed per question!");
    }
  } catch (err) {
    throw err;
  }
};

const deleteS3File = async (fileObj) => {
  try {
    let deleteFileParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileObj.fileName,
    };
    await s3Client.send(new DeleteObjectCommand(deleteFileParams));
  } catch (err) {
    throw err;
  }
};

function determineFileType(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();

  if (fileExtension.match(/(jpg|jpeg|png|gif)/)) {
    return "image";
  } else if (fileExtension.match(/(mp4|avi|mkv)/)) {
    return "video";
  } else if (fileExtension.match(/(mp3|wav)/)) {
    return "audio";
  } else if (fileExtension.match(/(html)/)) {
    return "simulation";
  } else {
    return "other";
  }
}

function getFolderName(fileType) {
  switch (fileType) {
    case "image":
      return process.env.AWS_QUESTIONS_IMAGES_FOLDER_NAME;
    case "video":
      return process.env.AWS_QUESTIONS_VIDEO_FOLDER_NAME;
    case "audio":
      return process.env.AWS_QUESTIONS_AUDIO_FOLDER_NAME;
    case "simulation":
      return process.env.AWS_QUESTIONS_SIMULATION_FOLDER_NAME;
    default:
      return "other";
  }
}

async function uploadFileToS3(fileObj) {
 
  try {
    const fileType = determineFileType(fileObj.originalname);
    const folderName = getFolderName(fileType);

    const fileName = folderName + "/" + generateFileName(fileObj.originalname);
    const mimeType = fileObj.mimetype;

    const uploadParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Body: fileObj.buffer,
      Key: fileName,
      ContentType: mimeType,
      ContentEncoding: "base64",
      ACL: "public-read",
    };

    const fileUpload = await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_QUESTIONS_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;

    if (fileUpload.$metadata.httpStatusCode === httpStatus.OK) {
      return { fileName: fileName, fileUrl: fileUrl };
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}

async function deleteFileFromS3(fileName) {
  console.log(fileName)
  try {
    let filename = fileName.split("/")[1];
    const fileType = determineFileType(filename);
    const folderName = getFolderName(fileType);

    const listParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Prefix: `${folderName}/`,
    };
    const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
    const fileKey = listResponse.Contents.find((obj) => obj.Key === fileName);

    if (!fileKey) {
      return { message: "File not found" };
    }

    const deleteParams = {
      Bucket: process.env.AWS_QUESTIONS_BUCKET_NAME,
      Key: fileName,
    };

    const result = await s3Client.send(new DeleteObjectCommand(deleteParams));

    if (result.$metadata.httpStatusCode === httpStatus.NO_CONTENT) {
      return { message: "File deleted successfully" };
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateQuestion(questionId, updatedData) {
  try {
    const question = await Question.findByPk(questionId);

    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }

    await question.update(updatedData);

    return question;
  } catch (err) {
    throw err;
  }
}

async function updateCategory(categoryId, categoryData) {
  try {
    const question = await QuestionCategory.findByPk(categoryId);

    if (!question) {
      throw new Error(`Question with ID ${categoryId} not found`);
    }

    await question.update(categoryData);

    return question;
  } catch (err) {
    throw err;
  }
}

async function DeleteQues(questionId) {
  const t = await db.transaction();
  try {
    const question = await Question.findByPk(questionId);
    if (!question) {
      await t.rollback();
      return res.status(httpStatus.NOT_FOUND).json({ message: "Question not found" });
    }

    await question.destroy({ transaction: t });

    await t.commit();

    res.status(httpStatus.OK).send("Question Deleted Successfully");
  } catch (err) {
    console.error(err);
    await t.rollback();
    next(err);
  }
}

const findQuestionSubParts = async (questionsWithSubPart) => {
  let subParts = [];

  for (let j = 0; j < questionsWithSubPart.length; j++) {
    let questionwithSubpartType = questionsWithSubPart[j].questionType;
    switch (questionwithSubpartType) {
      case CONSTANTS.questionType.Long_Answer:
        subParts.push({ ...questionsWithSubPart[j] });
        break;

      case CONSTANTS.questionType.MCQ_Single:
        let mcqQuestion = questionsWithSubPart[j];

        let mcqOptions = await McqQuestionOption.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        mcqQuestion.options = mcqOptions;

        subParts.push(mcqQuestion);

        break;
      case CONSTANTS.questionType.MCQ_Multiple:
        let mcqMutipleQuestion = questionsWithSubPart[j];

        let mcqMultipleOptions = await McqQuestionOption.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        mcqMutipleQuestion.options = mcqMultipleOptions;

        subParts.push(mcqMutipleQuestion);
        break;

      case CONSTANTS.questionType.True_False:
        let trueFalseQuestion = questionsWithSubPart[j];

        let trueFalseStatements = await TrueFalseQuestionOption.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        trueFalseQuestion.options = trueFalseStatements;

        subParts.push(trueFalseQuestion);
        break;

      case CONSTANTS.questionType.Fill_Text:
        subParts.push(questionsWithSubPart[j]);
        break;

      case CONSTANTS.questionType.Fill_Dropdown:
        let dropDownQuestion = questionsWithSubPart[j];

        let dropDownQuestionOptions = await FillDropDownOption.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        dropDownQuestion.options = dropDownQuestionOptions;

        subParts.push(dropDownQuestion);

        break;

      case CONSTANTS.questionType.Match:
        let matchQuestion = questionsWithSubPart[j];

        let matchQuestionOptions = await MatchQuestionPair.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        matchQuestion.options = matchQuestionOptions;

        subParts.push(matchQuestion);

        break;

      case CONSTANTS.questionType.Sort:
        let sortQuestion = questionsWithSubPart[j];

        let sortQuestionOptions = await SortQuestionOption.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });

        sortQuestion.options = sortQuestionOptions;

        subParts.push(sortQuestion);
        break;

      case CONSTANTS.questionType.Classify:
        let classifyQuestion = questionsWithSubPart[j];

        let classifyQuestionCategory = await QuestionCategory.findAll({
          where: { questionId: questionsWithSubPart[j].id },
          raw: true,
        });

        for (let i = 0; i < classifyQuestionCategory.length; i++) {
          let classifyQuestionCategoryOptions = await QuestionItem.findAll({
            where: { categoryId: classifyQuestionCategory[i].id },
          });

          classifyQuestionCategory[i].options = classifyQuestionCategoryOptions;
        }

        classifyQuestion.categories = classifyQuestionCategory;

        subParts.push(classifyQuestion);
        break;

      case CONSTANTS.questionType.Drawing:
        let drawingQuestion = questionsWithSubPart[j];

        let drawingQuestionData = await DrawingQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["uploaderJson", "studentJson", "questionId"],
        });

        drawingQuestion.canvasData = drawingQuestionData;

        subParts.push(drawingQuestion);
        break;

      case CONSTANTS.questionType.Label_Fill:
        let labelFillQuestion = questionsWithSubPart[j];

        let labelFillQuestionData = await LabelFillQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["dataGeneratorJson", "studentJson", "questionId"],
        });

        labelFillQuestion.canvasData = labelFillQuestionData;

        subParts.push(labelFillQuestion);
        break;

      case CONSTANTS.questionType.Label_Drag:
        let labelDragQuestion = questionsWithSubPart[j];

        let labelDragQuestionData = await LabelDragQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["uploaderJson", "studentJson", "questionId"],
        });

        labelDragQuestion.canvasData = labelDragQuestionData;

        subParts.push(labelDragQuestion);

        break;

      case CONSTANTS.questionType.Hotspot:
        let hotSpotQuestion = questionsWithSubPart[j];

        let hotSpotQuestionData = await HotSpotQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["uploaderJson", "studentJson", "questionId"],
        });

        hotSpotQuestion.canvasData = hotSpotQuestionData;

        subParts.push(hotSpotQuestion);

        break;

      case CONSTANTS.questionType.Desmos_Graph:
        let desmosQuestion = questionsWithSubPart[j];

        let desmosQuestionData = await DesmosGraphQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["uploaderJson", "studentJson", "questionId"],
        });

        desmosQuestion.graphData = desmosQuestionData;

        subParts.push(desmosQuestion);

        break;

      case CONSTANTS.questionType.Geogebra_Graph:
        let geoGebraQuestion = questionsWithSubPart[j];

        let geoGebraQuestionData = await GeogebraGraphQuestion.findOne({
          where: { questionId: questionsWithSubPart[j].id },
          attributes: ["uploaderJson", "studentJson", "questionId"],
        });

        geoGebraQuestion.graphData = geoGebraQuestionData;

        subParts.push(geoGebraQuestion);
        break;

      // Content Type question

      case CONSTANTS.questionType.Text:
        subParts.push(questionsWithSubPart[j]);
        break;

      case CONSTANTS.questionType.Image:
        let imageQuestion = questionsWithSubPart[j];
        let image = await QuestionContent.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        imageQuestion.imagesData = image;
        subParts.push(imageQuestion);
        break;
      case CONSTANTS.questionType.Audio:
        let audioQuestion = questionsWithSubPart[j];
        let audio = await QuestionContent.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        audioQuestion.audioData = audio;
        subParts.push(audioQuestion);
        break;
      case CONSTANTS.questionType.Video:
        let videoQuestion = questionsWithSubPart[j];
        let video = await QuestionContent.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        videoQuestion.videoData = video[0];
        subParts.push(videoQuestion);
        break;
      case CONSTANTS.questionType.Simulation:
        let simulationQuestion = questionsWithSubPart[j];
        let simulation = await QuestionContent.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        simulationQuestion.simulationData = simulation[0];
        subParts.push(simulationQuestion);
        break;
      case CONSTANTS.questionType.PDF:
        let pdfQuestion = questionsWithSubPart[j];
        let pdf = await QuestionContent.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        pdfQuestion.pdfData = pdf;
        subParts.push(pdfQuestion);
        break;
      case CONSTANTS.questionType.Accordian:
        let accordianQuestion = questionsWithSubPart[j];
        let accordian = await Accordian.findAll({
          where: { questionId: questionsWithSubPart[j].id },
        });
        accordianQuestion.accordianData = accordian;
        subParts.push(accordianQuestion);
        break;

      default:
    }
  }

  return subParts;
};

const findQuestions = async (questions) => {
  let questionDetails = [];

  if (questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      let type = questions[i].questionType;

      switch (type) {
        case CONSTANTS.questionType.Long_Answer:
          if (questions[i].hasSubPart) {
            let subParts = [];
            let whereQuery = { parentQuestionId: questions[i].id };
            console.log(whereQuery,"whereQuery")
            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: false,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...questions[i], subParts });
          } else {
            questionDetails.push(questions[i]);
          }

          break;

        case CONSTANTS.questionType.MCQ_Single:
          let mcqQuestion = questions[i];

          let mcqOptions = await McqQuestionOption.findAll({
            where: { questionId: questions[i].id },
          });

          mcqQuestion.options = mcqOptions;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...questions[i], subParts });
          } else {
            questionDetails.push(mcqQuestion);
          }

          break;
        case CONSTANTS.questionType.MCQ_Multiple:
          let mcqMutipleQuestion = questions[i];

          let mcqMultipleOptions = await McqQuestionOption.findAll({
            where: { questionId: questions[i].id },
          });

          mcqMutipleQuestion.options = mcqMultipleOptions;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...mcqMutipleQuestion, subParts });
          } else {
            questionDetails.push(mcqMutipleQuestion);
          }

          break;

        case CONSTANTS.questionType.True_False:
          let trueFalseQuestion = questions[i];

          let trueFalseStatements = await TrueFalseQuestionOption.findAll({
            where: { questionId: questions[i].id },
          });

          trueFalseQuestion.options = trueFalseStatements;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...trueFalseQuestion, subParts });
          } else {
            questionDetails.push(trueFalseQuestion);
          }

          break;

        case CONSTANTS.questionType.Fill_Text:
          let filtextQuestion = questions[i];
          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...filtextQuestion, subParts });
          } else {
            questionDetails.push(filtextQuestion);
          }

          break;

        case CONSTANTS.questionType.Fill_Dropdown:
        //   let dropDownQuestion = questions[i];

        //   let dropDownQuestionOptions = await FillDropDownOption.findAll({
        //     where: { questionId: questions[i].id },
        //   });

        //   dropDownQuestion.options = dropDownQuestionOptions;

        //   if (questions[i].hasSubPart) {
        //     let subParts = [];

        //     let whereQuery = { parentQuestionId: questions[i].id };

        //     let questionsWithSubPart = await Question.findAll({
        //       where: whereQuery,
        //       order: [["createdAt", "ASC"]],
        //       raw: true,
        //       include:[
        //         {model:QuestionDistractor}
        //       ]
        //     });

        //     subParts = await findQuestionSubParts(questionsWithSubPart);

        //     questionDetails.push({ ...dropDownQuestion, subParts });
        //   } else {
        //     questionDetails.push(dropDownQuestion);
        //   }

        //   break;

        case CONSTANTS.questionType.Match:
          let matchQuestion = questions[i];

          let matchQuestionOptions = await MatchQuestionPair.findAll({
            where: { questionId: questions[i].id },
          });
          matchQuestion.options = matchQuestionOptions;

          let QuestionDistractorOptions = await QuestionDistractor.findAll({
            where: { questionId: questions[i].id },
          });
          matchQuestion.distractor = QuestionDistractorOptions;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
              include:[
                {model:QuestionDistractor}
              ]
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...matchQuestion, subParts });
          } else {
            questionDetails.push(matchQuestion);
          }

          break;

        case CONSTANTS.questionType.Sort:
          let sortQuestion = questions[i];

          let sortQuestionOptions = await SortQuestionOption.findAll({
            where: { questionId: questions[i].id },
          });

          sortQuestion.options = sortQuestionOptions;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...sortQuestion, subParts });
          } else {
            questionDetails.push(sortQuestion);
          }

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

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
              include:[
                {model:QuestionDistractor}
              ]
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...classifyQuestion, subParts });
          } else {
            questionDetails.push(classifyQuestion);
          }

          break;

        case CONSTANTS.questionType.Drawing:
          let drawingQuestion = questions[i];

          let drawingQuestionData = await DrawingQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["uploaderJson", "studentJson", "questionId"],
          });

          drawingQuestion.canvasData = drawingQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...drawingQuestion, subParts });
          } else {
            questionDetails.push(drawingQuestion);
          }

          break;

         case CONSTANTS.questionType.Label_Fill:
          let labelFillQuestion = questions[i];

          let labelFillQuestionData = await LabelFillQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["dataGeneratorJson", "studentJson", "questionId"],
          });

          labelFillQuestion.canvasData = labelFillQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...labelFillQuestion, subParts });
          } else {
            questionDetails.push(labelFillQuestion);
          }

          break;

         case CONSTANTS.questionType.Label_Drag:
          let labelDragQuestion = questions[i];

          let labelDragQuestionData = await LabelDragQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["uploaderJson", "studentJson", "questionId"],
          });

          labelDragQuestion.canvasData = labelDragQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...labelDragQuestion, subParts });
          } else {
            questionDetails.push(labelDragQuestion);
          }

          break;

        case CONSTANTS.questionType.Hotspot:
          let hotSpotQuestion = questions[i];

          let hotSpotQuestionData = await HotSpotQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["uploaderJson", "studentJson", "questionId"],
          });

          hotSpotQuestion.canvasData = hotSpotQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...hotSpotQuestion, subParts });
          } else {
            questionDetails.push(hotSpotQuestion);
          }

          break;

        case CONSTANTS.questionType.Desmos_Graph:
          let desmosQuestion = questions[i];

          let desmosQuestionData = await DesmosGraphQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["uploaderJson", "studentJson", "questionId"],
          });

          desmosQuestion.graphData = desmosQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...desmosQuestion, subParts });
          } else {
            questionDetails.push(desmosQuestion);
          }

          break;

        case CONSTANTS.questionType.Geogebra_Graph:
          let geoGebraQuestion = questions[i];

          let geoGebraQuestionData = await GeogebraGraphQuestion.findOne({
            where: { questionId: questions[i].id },
            attributes: ["uploaderJson", "studentJson", "questionId"],
          });

          geoGebraQuestion.graphData = geoGebraQuestionData;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...geoGebraQuestion, subParts });
          } else {
            questionDetails.push(geoGebraQuestion);
          }

          break;

        // Content Type question

        case CONSTANTS.questionType.Text:
          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...questions[i], subParts });
          } else {
            questionDetails.push(questions[i]);
          }

          break;

        case CONSTANTS.questionType.Image:
          let imageQuestion = questions[i];
          let image = await QuestionContent.findAll({
            where: { questionId: questions[i].id },
          });
          imageQuestion.imagesData = image;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...imageQuestion, subParts });
          } else {
            questionDetails.push(imageQuestion);
          }

          break;
        case CONSTANTS.questionType.Audio:
          let audioQuestion = questions[i];
          let audio = await QuestionContent.findAll({
            where: { questionId: questions[i].id },
          });
          audioQuestion.audioData = audio;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...audioQuestion, subParts });
          } else {
            questionDetails.push(audioQuestion);
          }

          break;
        case CONSTANTS.questionType.Video:
          let videoQuestion = questions[i];
          let video = await QuestionContent.findAll({
            where: { questionId: questions[i].id },
          });
          videoQuestion.videoData = video[0];

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...videoQuestion, subParts });
          } else {
            questionDetails.push(videoQuestion);
          }

          break;
        case CONSTANTS.questionType.Simulation:
          let simulationQuestion = questions[i];
          let simulation = await QuestionContent.findAll({
            where: { questionId: questions[i].id },
          });
          simulationQuestion.simulationData = simulation[0];

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...simulationQuestion, subParts });
          } else {
            questionDetails.push(simulationQuestion);
          }

          break;
        case CONSTANTS.questionType.PDF:
          let pdfQuestion = questions[i];
          let pdf = await QuestionContent.findAll({
            where: { questionId: questions[i].id },
          });
          pdfQuestion.pdfData = pdf;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...pdfQuestion, subParts });
          } else {
            questionDetails.push(pdfQuestion);
          }

          break;
        case CONSTANTS.questionType.Accordian:
          let accordianQuestion = questions[i];
          let accordian = await Accordian.findAll({
            where: { questionId: questions[i].id },
          });
          accordianQuestion.accordianData = accordian;

          if (questions[i].hasSubPart) {
            let subParts = [];

            let whereQuery = { parentQuestionId: questions[i].id };

            let questionsWithSubPart = await Question.findAll({
              where: whereQuery,
              order: [["createdAt", "ASC"]],
              raw: true,
            });

            subParts = await findQuestionSubParts(questionsWithSubPart);

            questionDetails.push({ ...accordianQuestion, subParts });
          } else {
            questionDetails.push(accordianQuestion);
          }

          break;

        default:
      }
    }
  }

  return questionDetails;
};

module.exports = {
  createQuestion,
  checkFillDropDownOptions,
  getQuestionsDetailsById,
  uploadFileToS3,
  deleteQuestion,
  editQuestion,
  deleteS3File,
  checkMatchQuestionPairs,
  updateQuestion,
  DeleteQues,
  deleteFileFromS3,
  findQuestions,
  updateCategory,
};
