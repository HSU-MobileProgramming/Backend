const express = require('express');
const http = require('http');
// const multer = require('multer');  // 파일 업로드
const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const userRouter = require('./routes/user.js');
const mapRouter = require('./routes/map.js')

app.use('/user', userRouter);
app.use('/maps', mapRouter);

const server = http.createServer(app);

// const upload = multer({ storage: storage });  // 업로드

server.listen(port, () => {
    console.log(`서버 오픈 포트번호:${port}`);
});

module.exports = app;
