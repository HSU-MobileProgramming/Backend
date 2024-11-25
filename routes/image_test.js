const express = require("express");
const router = express.Router();
const db = require("../config/mysql.js");
const authenticateToken = require("../utils/auth.js");
const uploadImage = require("../utils/s3_util.js");

let con = db.init();
db.connect(con);

router.post("/test", uploadImage.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일 이름은 필수 항목입니다." });
  }

  console.log(req.file);
  res.json({
    imageUrl: req.file.location,
  });
});

module.exports = router;
