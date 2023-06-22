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
  getSingleSubjectById,
  togglePublishSubject,
  updateSubjectSchema,
} = require("../../validations/subjectManagementValidations.js");
const httpStatus = require("http-status");
const services = require("../../services/index.js");
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
      // create subject name first if no subjectNameId
      if (!values.subjectNameId) {
        // Configure the upload details to send to S3
        const subjectImageName = `${
          process.env.AWS_BUCKET_SUBJECT_IMAGE_FOLDER
        }/${generateFileName(32, values.image.originalname)}`;
        const uploadParams = {
          Bucket: bucketName,
          Body: values.image.buffer,
          Key: subjectImageName,
          ContentType: req.file.mimetype,
        };

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
          }
          return res.status(201).json({
            message: "Subject and levels created successfully",
            subject,
          });
        } else {
          res.status(httpStatus.BAD_REQUEST).send({
            message: `${subjectNameExists.subjectName} Subject Name already exists`,
          });
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
          let whereQuery = {
            where: { id: subjectExists.subjectNameId },
            raw: true,
          };
          let findSubject = await services.subjectService.findSubjectName(
            whereQuery
          );

          res.status(httpStatus.BAD_REQUEST).send({
            message: `${findSubject[0].subjectName} Subject already exists for this board, subBoard & grade!`,
          });
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async TogglePublishSubject(req, res, next) {
    try {
      let values = await togglePublishSubject.validateAsync(req.body);

      let dataToBeUpdated = {
        isPublished: values.isPublished,
      };
      let whereQuery = { where: { id: values.subjectIds } };

      let updatedSubjects = await services.subjectService.updateSubject(
        dataToBeUpdated,
        whereQuery
      );

      res.status(httpStatus.OK).send({
        message: `${updatedSubjects[0]} subjects updated successfully!`,
      });
    } catch (err) {
      next(err);
    }
  },

  async ToggleArchiveLevel(req, res, next) {
    try {
      // Update sub-boards
      let values = await archiveSubjectsLevels.validateAsync(req.body);
      let dataTobeUpdated = { isArchived: values.isArchived };
      let whereQuery = {
        where: { id: values.levelsId, subjectId: values.subjectId },
      };

      let updateSubjectLevels;
      if (values.levelsId && values.levelsId.length > 0) {
        updateSubjectLevels = await services.subjectService.updateSubjectLevels(
          dataTobeUpdated,
          whereQuery
        );
      }

      if (updateSubjectLevels.length >= 1) {
        res
          .status(httpStatus.OK)
          .send({ message: "levels archived successfully" });
      }
    } catch (err) {
      next(err);
    }
  },

  async UpdateSubject(req, res, next) {
    try {
      let values = await updateSubjectSchema.validateAsync({
        id: req.body.id,
        boardId: req.body.boardId,
        subBoardId: req.body.subBoardId,
        grade: req.body.grade,
        subjectNameId: req.body.subjectNameId,
        subjectLevels: req.body.subjectLevels,
        image: req.file,
      });

      // Find subject by ID
      const subject = await Subject.findByPk(values.id);
      if (!Subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Configure the upload details to send to S3
      let subjectImage = subject.subjectImage;
      if (values.image) {
        const fileBuffer = values.image.buffer;
        subjectImage = `${
          process.env.AWS_BUCKET_SUBJECT_IMAGE_FOLDER
        }/${generateFileName(32, values.image.originalname)}`;
        const uploadParams = {
          Bucket: bucketName,
          Body: fileBuffer,
          Key: subjectImage,
          ContentType: req.file.mimetype,
        };

        console.log("in image");
        // Send the upload to S3
        await s3Client.send(new PutObjectCommand(uploadParams));
        // delete previous image below

        // Update subject details

        let dataToBeUpdated = {
          boardId: subject.boardId,
          subBoardId: subject.subBoardId,
          grade: subject.grade,
          subjectNameId: subject.subjectNameId,
          subjectImage: subjectImage,
        };

        let whereQuery = {
          where: {
            boardId: subject.boardId,
            subBoardId: subject.subBoardId,
            grade: subject.grade,
            subjectNameId: subject.subjectNameId,
          },
        };

        let updatedSubject = await services.subjectService.updateSubject(
          dataToBeUpdated,
          whereQuery
        );
      }

      // console.log(updatedSubject);
      // Update subjectLevel details
      if (values.subjectLevels && values.subjectLevels.length > 0) {
        // Get the subjectLevel associated with the board
        const existinglevels = await SubjectLevel.findAll({
          where: { subjectId: subject.id },
        });
        // Map the existing subjectLevel to their IDs
        const existinglevelsID = existinglevels.map((level) => level.id);
        // Filter out the subjectLevel to be updated
        const levelsToUpdate = values.subjectLevels.filter(
          (level) => level.id && existinglevelsID.includes(level.id)
        );
        // Create new subjectLevel and update existing subjectLevel
        const levelsToCreateOrUpdate = values.subjectLevels.map((level) => ({
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
      console.log(err);
      next(err);
    }
  },

  async createsubjectName(req, res) {
    try {
      const name = req.body.subjectName;
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

      let subBoards = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );
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

  async getSubjectDetailsByBoardSubBoardGradeSubjectNameId(req, res, next) {
    try {
      let values = await getSingleSubjectById.validateAsync({
        subjectNameId: req.query.subjectNameId,
        boardId: req.query.boardId,
        subBoardId: req.query.subBoardId,
        grade: req.query.grade,
      });

      let whereQuery = {
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        subjectNameId: values.subjectNameId,
        grade: values.grade,
      };

      let include = [{ model: subjectName, attributes: ["subjectName"] }];
      let subject = await services.subjectService.findSubject(
        whereQuery,
        include
      );

      res.status(httpStatus.OK).send(subject);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SubjectManagementController;
