import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
