const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { generateFileName, s3Client } = require("../../config/s3.js");
const {
  Subject,
  SubjectLevel,
  subjectName,
} = require("../../models/Subject.js");

const {
  createSubjectSchema,
  getSubBoardsSchema,
  getSubjectBySubjectNameId,
  getSubjectByIds,
  archiveSubjectsLevels,
} = require("../../validations/subjectManagementValidations.js");
const httpStatus = require("http-status");
const services = require("../../services/index.js");
const { updateSubjectLevels } = require("../../services/subjectService.js");
require("dotenv").config();
const bucketName = process.env.AWS_BUCKET_NAME;

const SubjectManagementController = {
  async CreateSubject(req, res, next) {
    try {
      // Create a new subject entry
      let values = await createSubjectSchema.validateAsync({
        boardId: req.body.boardId,
        subBoardId: req.body.subBoardId,
        grade: req.body.grade,
        subjectName: req.body.subjectName,
        subjectNameId: req.body.subjectNameId,
        subjectImage: req.body.subjectImage,
        subjectLevels: req.body.subjectLevels,
        image: req.file,
      });

      console.log(values);

      // create subject name first if no subjectNameId
      if (!values.subjectNameId) {
        // Configure the upload details to send to S3
        const subjectImageName = `${
          process.env.AWS_BUCKET_SUBJECT_IMAGE_FOLDER
        }/${generateFileName()}`;
        const uploadParams = {
          Bucket: bucketName,
          Body: values.image.buffer,
          Key: subjectImageName,
          ContentType: req.file.mimetype,
        };

        console.log("subBoard", values.subBoardId);

        // Send the upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // check if subjectName alredy exists

        let subjectNameExists =
          await services.subjectService.findBySubjectNameInUniqueSubjectNames(
            values.subjectName
          );

        let subjectNameFromRequest = values.subjectName.toLowerCase();

        let subjectNameFetched = subjectNameExists
          ? subjectNameExists.subjectName.toLowerCase()
          : null;

        if (subjectNameFromRequest !== subjectNameFetched) {
          let subjectNameid = await services.subjectService.createSubjectName(
            values.subjectName
          );
          let subject = await Subject.create({
            boardId: values.boardId,
            subBoardId: values.subBoardId,
            grade: values.grade,
            subjectNameId: subjectNameid.id,
            subjectImage: subjectImageName,
          });
          // Create sub-board entries
          if (values.subjectLevels && values.subjectLevels.length > 0) {
            const SubjectLevels = values.subjectLevels.map((subjectLevel) => ({
              subjectLevelName: subjectLevel.subjectLevelName,
              isArchived: subjectLevel.isArchived || false,
              subjectId: subject.id, // Associate the sub-board with the created board
            }));
            await SubjectLevel.bulkCreate(SubjectLevels);
            console.log(values.subjectLevels);
          }
          return res.status(201).json({
            message: "Subject and levels created successfully",
            subject,
          });
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Subject Name already exists" });
        }
      }

      // create subject directly if  subjectNameId exists
      if (values.subjectNameId) {
        // check if subject exists

        let subjectExists = await services.subjectService.findSubjectByIds(
          values.boardId,
          values.subBoardId,
          values.grade,
          values.subjectNameId
        );
        console.log(values);
        if (!subjectExists) {
          let subject = await services.subjectService.createSubject({
            boardId: values.boardId,
            subBoardId: values.subBoardId,
            grade: values.grade,
            subjectNameId: values.subjectNameId,
            subjectImage: values.subjectImage,
          });

          //Create sub-board entries
          let subjectLevelsCreated;
          if (values.subjectLevels && values.subjectLevels.length > 0) {
            const SubjectLevels = values.subjectLevels.map((subjectLevel) => ({
              subjectLevelName: subjectLevel.subjectLevelName,
              isArchived: subjectLevel.isArchived || false,
              subjectId: subject.id, // Associate the sub-board with the created board
            }));

            subjectLevelsCreated =
              await services.subjectService.bulkCreateSubjectLevels(
                SubjectLevels
              );
          }
          return res.status(201).json({
            message: "Subject and levels created successfully",
            subject,
            subjectLevelsCreated,
          });
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Subject already exists!" });
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  //we can publish different subjects
  async TogglePublishSubject(req, res) {
    const ids = req.body.ids; // It will be an array
    const isPublished = req.body.isPublished; // It will be the same for all ids sent (either true to publish or false to unpublish)

    try {
      // Update the subjects
      const results = await Subject.update(
        { isPublished },
        { where: { id: ids } }
      );

      res.json({
        status: 200,
        message: `${results[0]} subjects updated successfully!`,
        subjects: results,
      });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  // export const ToggleArchiveLevel = async (req, res) => {
  //   try {
  //     const { levelsId } = req.body;
  //     const subjectId = req.params.subjectId;

  //     if (!levelsId || !subjectId) {
  //       return res.status(400).json({ message: "Missing required parameter" });
  //     }

  //     const subject = await Subject.findByPk(subjectId);

  //     if (!subject) {
  //       return res.status(404).json({ message: "Subject not found" });
  //     }

  //     const levelsToUpdate = await SubjectLevel.findAll({
  //       where: {
  //         id: levelsId,
  //         subjectId,
  //       },
  //     });

  //     if (levelsToUpdate.length === 0) {
  //       return res
  //         .status(404)
  //         .json({ message: "No levels found with given IDs" });
  //     }

  //     const updatedLevels = await Promise.all(
  //       levelsToUpdate.map(async (level) => {
  //         level.isArchived = !level.isArchived;
  //         await level.save();
  //         return level;
  //       })
  //     );

  //     return res.status(200).json({
  //       message: "Levels archived status updated successfully",
  //       subject,
  //       updatedLevels,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ status: 501, error: err.message });
  //   }
  // };

  async ToggleArchiveLevel(req, res, next) {
    //const boardId = req.params.id;
    const isArchived = req.body.isArchived;
    const levelsId = req.body.levelsId; // Array of sub-board IDs
    // const { levelsId } = req.body;
    const subjectId = req.params.subjectId;

    try {
      // Update sub-boards
      let values = await archiveSubjectsLevels.validateAsync(req.body);
      console.log(values);
      let dataTobeUpdated = { isArchived: values.isArchived };
      let whereQuery = { where: { id: levelsId, subjectId: values.subjectId } };
      console.log(whereQuery);
      let updateSubjectLevels;
      if (levelsId && levelsId.length > 0) {
        updateSubjectLevels = await services.subjectService.updateSubjectLevels(
          dataTobeUpdated,
          whereQuery
        );
      }
      console.log(updateSubjectLevels);
      if (updateSubjectLevels.length >= 1) {
        res
          .status(httpStatus.OK)
          .send({ message: "levels archived successfully" });
      }
    } catch (err) {
      next(err);
    }
  },

  async UpdateSubject(req, res) {
    const { id } = req.params;
    const {
      boardId,
      subBoardId,
      grade,
      subjectNameId,
      isArchived,
      isPublished,
      subjectLevels,
    } = req.body;

    try {
      // Find subject by ID
      const subject = await Subject.findByPk(id);

      if (!Subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const fileBuffer = req.file.buffer;

      // Configure the upload details to send to S3
      let subjectImage = subject.subjectImage;
      if (subject.subjectImage !== req.file.originalname) {
        subjectImage = generateFileName();
        const uploadParams = {
          Bucket: bucketName,
          Body: fileBuffer,
          Key: subjectImage,
          ContentType: req.file.mimetype,
        };

        // Send the upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));
      }

      // Update subject details
      subject.boardId = boardId;
      subject.subBoardId = subBoardId;
      subject.grade = grade;
      subject.subjectNameId = subjectNameId;
      subject.subjectImage = subjectImage;
      subject.isArchived = isArchived;
      subject.isPublished = isPublished;

      await subject.save();

      // Update subjectLevel details
      if (subjectLevels && subjectLevels.length > 0) {
        // Get the subjectLevel associated with the board
        const existinglevels = await SubjectLevel.findAll({
          where: { subjectId: subject.id },
        });

        // Map the existing subjectLevel to their IDs
        const existinglevelsID = existinglevels.map((level) => level.id);

        // Filter out the subjectLevel to be updated
        const levelsToUpdate = subjectLevels.filter(
          (level) => level.id && existinglevelsID.includes(level.id)
        );

        // Create new subjectLevel and update existing subjectLevel
        const levelsToCreateOrUpdate = subjectLevels.map((level) => ({
          id: level.id || null,
          subjectLevelName: level.subjectLevelName,
          isArchived: level.isArchived || false,
          subjectId: subject.id,
        }));

        // Bulk create/update the subjectLevel
        await SubjectLevel.bulkCreate(levelsToCreateOrUpdate, {
          updateOnDuplicate: ["subjectLevelName", "isArchived"],
        });

        // Update the existing subjectLevel
        await Promise.all(
          levelsToUpdate.map((level) =>
            SubjectLevel.update(
              {
                subjectLevelName: level.subjectLevelName,
                isArchived: level.isArchived || false,
              },
              {
                where: { id: level.id },
              }
            )
          )
        );
      }

      const alllevels = await SubjectLevel.findAll({
        where: { subjectId: subject.id },
      });

      return res.status(200).json({
        message: "subject and subjectLevel details updated successfully",
        subject,
        alllevels,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  async createsubjectName(req, res) {
    try {
      const name = req.body.subjectName;
      console.log(name);
      const subjectNameid = await subjectName.create({
        subjectName: name,
      });
      return res.status(200).json({ subjectNameid });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  async getsubjectName(req, res, next) {
    try {
      const subjectName = await services.subjectService.getSubjectNames();

      res.status(httpStatus.OK).send(subjectName);
    } catch (err) {
      next(err);
    }
  },

  async getAllboards(req, res, next) {
    try {
      let attributes = ["id", "boardName", "boardType"];
      let boards = await services.boardService.findAllBoards(attributes);

      res.status(httpStatus.OK).send(boards);
    } catch (err) {
      next(err);
    }
  },

  async getAllSubBoards(req, res) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });
      console.log(values);

      let subBoards = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );
      // const subBoards = await SubBoard.findAll({
      //   attributes: ["SubBoardName", "id", "boardId"],
      //   where: { boardId: boardIds },
      //   include: {
      //     model: Board,
      //     as: "board",
      //     attributes: ["boardName"],
      //   },
      //   group: ["board.id", "subBoard.id"],
      // });

      // const groupedSubBoards = subBoards.reduce((result, subBoard) => {
      //   const { SubBoardName, id, boardId, board } = subBoard;
      //   const { boardName } = board;

      //   if (!result[boardName]) {
      //     result[boardName] = [];
      //   }

      //   result[boardName].push({
      //     SubBoardName,
      //     id,
      //     boardId,
      //   });

      //   return result;
      // }, {});

      return res.status(200).json(subBoards);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getSubjectBySubjectNameId(req, res, next) {
    try {
      let values = await getSubjectBySubjectNameId.validateAsync({
        subjectNameId: req.query.subjectNameId,
      });

      let subject = await services.subjectService.getSubjectBySubjectNameId(
        values.subjectNameId
      );

      res.status(httpStatus.OK).send(subject);
    } catch (err) {
      next(err);
    }
  },

  async getSubjectDetailsByBoardSubBoardGrade(req, res, next) {
    try {
      let values = await getSubjectByIds.validateAsync({
        boardId: req.query.boardId,
        subBoardId: req.query.subBoardId,
        grade: req.query.grade,
      });

      let subjectsDetails =
        await services.subjectService.findSubjectDetailsByBoardSubBoardGrade(
          values.boardId,
          values.subBoardId,
          values.grade
        );

      res.status(httpStatus.OK).send(subjectsDetails);
    } catch (err) {
      next(err);
    }
  },
};
module.exports = SubjectManagementController;
