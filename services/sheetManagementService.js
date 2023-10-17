const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { User } = require("../models/User");
const CONSTANTS = require("../constants/constants");
const { s3Client } = require("../config/s3");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const uploadSheetManagementErrorReportFile = async (fileName, fileObj) => {
    try {
        const imageUploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: fileObj.buffer,
            Key: fileName,
            ContentType: fileObj.mimetype,
        };

        let fileUpload = await s3Client.send(new PutObjectCommand(imageUploadParams));

        if (fileUpload.$metadata.httpStatusCode === httpStatus.OK) {
            return fileName;
        } else {
            false;
        }
    } catch (err) {
        throw err;
    }
};

module.exports = {
    uploadSheetManagementErrorReportFile
  };
  