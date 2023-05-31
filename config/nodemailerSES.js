const nodemailer = require("nodemailer");
let aws = require("@aws-sdk/client-ses");

const region = process.env.AWS_BUCKET_REGION;
const host = process.env.AWS_SES_HOST;
const UserName = process.env.AWS_SES_USERNAME;
const Password = process.env.AWS_SES_PASSWORD;

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: host,
  port: 587,
  secure: false,
  requireTLS: true,
  debug: true,
  logger: true,
  auth: {
    user: UserName,
    pass: Password,
  },
});

module.exports = transporter;
