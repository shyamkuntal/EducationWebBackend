import express from "express";
import cors from "cors";
// import multer from "multer";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import indexRouter from "./routes/index.js";
import { db } from "./config/database.js";
import { generateFileName, s3Client } from "./config/s3.js";
import upload from "./config/multer.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Test DB
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const bucketName = process.env.AWS_BUCKET_NAME;

// const region = process.env.AWS_BUCKET_REGION;
// const accessKeyId = process.env.AWS_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// const s3Client = new S3Client({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey,
//   },
// });

app.post("/uploadimg", upload.single("image"), async (req, res) => {
  const fileBuffer = req.file.buffer;
  console.log(fileBuffer);

  // Configure the upload details to send to S3
  const fileName = generateFileName();
  console.log(bucketName);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: req.file.mimetype,
  };

  // Send the upload to S3
  await s3Client.send(new PutObjectCommand(uploadParams));

  res.send({});
});

app.get("/getimage", async (req, res) => {
  const imageName =
    "88123c7cb235b9494dcbc53d88083d5fa38bbac92cebed1f615a7f891e8ef092";
  const getObjectParams = {
    Bucket: bucketName,
    Key: imageName,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.send(url);
});

app.use("/api", indexRouter);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
