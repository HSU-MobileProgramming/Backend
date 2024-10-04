const mysql = require('mysql2');

// MySQL 데이터베이스 연결 설정
const db_info = require('./config.js')

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function (conn) {
        conn.connect(function (err) {
            if (err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    },
}
