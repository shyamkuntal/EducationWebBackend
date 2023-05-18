import { PutObjectCommand } from "@aws-sdk/client-s3";
import { generateFileName, s3Client } from "../../config/s3.js";
import { PastPaper } from "../../models/PastPaper.js";
//import { Sheet } from "../../models/Sheet.js";
import dotenv from "dotenv";
dotenv.config();

// const bucketName = process.env.AWS_BUCKET_NAME;
// export const getAssignedSheets = async (req, res) => {
//   const assignedTo = req.params.userId;
//   console.log(assignedTo);
//   try {
//     const allAssignedSheeets = await Sheet.findAll({ where: { assignedTo } });

//     return res.json({ status: 200, AssignedSheets: allAssignedSheeets });
//   } catch (error) {
//     res.json({ status: 501, message: error.message });
//   }
// };

export const createPastPaper = async (req, res) => {
  const { paperNumber, googleLink } = req.body;

  // Get the uploaded image buffer
  const imageBuffer = req.files["image"].buffer;

  // Get the uploaded PDF buffers
  const questionpdfBuffer = req.files["pdf"][0].buffer;
  const answerpdfBuffer = req.files["pdf"][1].buffer;

  // Upload the image buffer to S3
  const imagebanner = generateFileName();

  const imageUploadParams = {
    Bucket: bucketName,
    Body: imageBuffer,
    Key: imagebanner,
    ContentType: req.files["image"].mimetype,
  };
  const questionPdf = generateFileName();
  const answerPdf = generateFileName();
  // Upload each PDF buffer to S3

  const quepdfUploadParams = {
    Bucket: bucketName,
    Body: questionpdfBuffer,
    Key: questionPdf,
    ContentType: req.files["pdf"][0].mimetype,
  };
  const anspdfUploadParams = {
    Bucket: bucketName,
    Body: answerpdfBuffer,
    Key: answerPdf,
    ContentType: req.files["pdf"][1].mimetype,
  };

  try {
    // Upload the image buffer to S3
    await s3Client.send(new PutObjectCommand(imageUploadParams));

    // Upload the question PDF buffer to S3
    await s3Client.send(new PutObjectCommand(quepdfUploadParams));

    // Upload the answer PDF buffer to S3
    await s3Client.send(new PutObjectCommand(anspdfUploadParams));

    const pastpaper = await PastPaper.create({
      paperNumber,
      googleLink,
      imagebanner,
      questionPdf,
      answerPdf,
    });

    return res.status(201).json({
      message: "Past Paper created successfully",
      pastpaper,
    });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};
