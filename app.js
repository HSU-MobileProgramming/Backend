const express = require("express");
const http = require('http');
// const multer = require('multer');  // 파일 업로드
const app = express();
const port = 3000;

const userRouter = require('./routes/user.js');

app.use('/user',userRouter);

const server = http.createServer(app);

// const upload = multer({ storage: storage });  // 업로드 

server.listen(port, () => {
    console.log(`서버 오픈 포트번호:${port}`);
});