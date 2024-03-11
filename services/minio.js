require('dotenv').config();
const Minio = require('minio');

const minioClient = new Minio.Client({
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.ENDPOINT,
  pathStyle: true,
  port: 9000,
  useSSL: false,
});
module.exports = minioClient;
