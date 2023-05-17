import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateFileName, s3Client } from "../../config/s3.js";
import { Subject, SubjectLevel } from "../../models/Subject.js";
import dotenv from "dotenv";
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
export const CreateSubject = async (req, res) => {
  const {
    boardId,
    SubBoardId,
    grade,
    subjectName,
    isArchived,
    isPublished,
    subjectLevels,
  } = req.body;

  try {
    // Create a new subject entry

    const fileBuffer = req.file.buffer;
    console.log(req.file);

    // Configure the upload details to send to S3
    const subjectImage = generateFileName();

    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: subjectImage,
      ContentType: req.file.mimetype,
    };

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    const subject = await Subject.create({
      boardId,
      SubBoardId,
      grade,
      subjectName,
      subjectImage,
      isArchived,
      isPublished,
    });

    //Create sub-board entries
    if (subjectLevels && subjectLevels.length > 0) {
      const SubjectLevels = subjectLevels.map((subjectLevel) => ({
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
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

//we can publish different subjects
export const TogglePublishSubject = async (req, res) => {
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
};

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

export const ToggleArchiveLevel = async (req, res) => {
  //const boardId = req.params.id;
  const isArchived = req.body.isArchived;
  const levelsId = req.body.levelsId; // Array of sub-board IDs
  // const { levelsId } = req.body;
  const subjectId = req.params.subjectId;

  try {
    // Update sub-boards

    if (levelsId && levelsId.length > 0) {
      await SubjectLevel.update(
        { isArchived },
        { where: { id: levelsId, subjectId } }
      );
    }

    return res.json({
      status: 200,
      message: "levels archived successfully",
    });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

export const UpdateSubject = async (req, res) => {
  const { id } = req.params;
  const {
    boardId,
    SubBoardId,
    grade,
    subjectName,
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
    subject.SubBoardId = SubBoardId;
    subject.grade = grade;
    subject.subjectName = subjectName;
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
};
