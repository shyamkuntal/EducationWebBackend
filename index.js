const express = require("express");
const cors = require("cors");
// import multer from "multer";
require("dotenv").config();
const getSignedUrl = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const routes = require("./routes/index.js");
const db = require("./config/database.js");
const { generateFileName, s3Client } = require("./config/s3.js");
const upload = require("./config/multer.js");
const { convertToApiError, handleError } = require("./middlewares/apiError.js");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

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

app.use("/api", routes);

//API ERROR HANDLING
app.use(convertToApiError);
app.use((err, req, res, next) => {
  handleError(err, res);
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
