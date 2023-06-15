const { S3Client } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const generateFileName = (bytes, originalname) => {
  let fileName = originalname.replace(/_/g, "");
  return `${crypto.randomBytes(bytes).toString("hex") + "%" + fileName}`;
};

module.exports = { s3Client, generateFileName };
