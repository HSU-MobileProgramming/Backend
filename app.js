const express = require('express');
const http = require('http');
// const multer = require('multer');  // 파일 업로드
const bodyParser = require("body-parser");
const port = 8000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json()); // JSON 파싱 활성화

const userRouter = require('./routes/user.js');
const mapRouter = require('./routes/map.js');
const tripRouter = require('./routes/trip.js');
const ticketRouter = require('./routes/ticket.js');
const memoRouter = require('./routes/memo.js');
const photoRouter = require('./routes/photo.js');

app.use('/user', userRouter);
app.use('/maps', mapRouter);
app.use('/trip', tripRouter);
app.use('/piece/ticket',ticketRouter);
app.use('/piece/memo', memoRouter);
app.use('/piece/photo', photoRouter);

const server = http.createServer(app);

// const upload = multer({ storage: storage });  // 업로드

server.listen(port, () => {
    console.log(`서버 오픈 포트번호:${port}`);
});

module.exports = app;
