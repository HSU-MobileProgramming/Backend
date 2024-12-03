const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const {
  AWS_S3_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_S3_ACCESS_KEY,
  AWS_S3_SECRET_KEY,
} = require("../config/config");

aws.config.update({
  region: AWS_S3_REGION,
  accessKeyId: AWS_S3_ACCESS_KEY,
  secretAccessKey: AWS_S3_SECRET_KEY,
});

const s3 = new aws.S3();
const allowedExt = [".jpg", ".jpeg", ".png", ".bmp"];

const uploadImage = multer({
  storage: multerS3({
    s3: new aws.S3(),
    bucket: AWS_S3_BUCKET_NAME,
    key: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      if (!allowedExt.includes(extension)) {
        return cb(new Error("Only jpg, jpeg, png, bmp are allowed"));
      }
      const key = `images/${Date.now()}_${file.originalname}`;
      const imageUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${key}`;
      console.log("uploadImageUrl: " + imageUrl);
      file.location = imageUrl; // Add image URL to file object
      cb(null, key);
    },
    acl: "public-read-write",
  }),
});

module.exports = uploadImage;