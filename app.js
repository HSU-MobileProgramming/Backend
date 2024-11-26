const express = require('express');
const http = require('http');
// const multer = require('multer');  // 파일 업로드
const bodyParser = require("body-parser");
const port = 3030;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // JSON 파싱 활성화

const userRouter = require('./routes/user.js');
const mapRouter = require('./routes/map.js');
const tripRouter = require('./routes/trip.js');

// temp code
const imageTestRouter = require('./routes/image_test.js');
app.use('/image', imageTestRouter);

app.use('/user', userRouter);
app.use('/maps', mapRouter);
app.use('/trip', tripRouter);

const server = http.createServer(app);

// const upload = multer({ storage: storage });  // 업로드

server.listen(port, () => {
    console.log(`서버 오픈 포트번호:${port}`);
});

module.exports = app;
