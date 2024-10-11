const express = require("express");
const router = express.Router();
const crypto = require('crypto');  // 비밀번호 해싱
const db = require('../config/mysql.js');   // 설정 파일

let con = db.init();
db.connect(con);

// 비밀번호 해시 함수
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 회원가입 URL
router.post('/register', (req, res) => {
    const { name, email, password, phone, nickname, gender, profile_img, country, gps_consent, is_public } = req.body;
    // 필수값 확인
    if (!name || !email || !password) {
        return res.status(400).json({ message: "이름, 이메일, 비밀번호는 필수 항목입니다." });
    }
    // 비밀번호 해싱
    const hashedPassword = hashPassword(password);
    // MySQL 삽입 쿼리
    const query = `
        INSERT INTO users (name, email, password, phone, nickname, gender, profile_img, country, gps_consent, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, email, hashedPassword, phone, nickname, gender, profile_img, country, gps_consent, is_public];
    con.query(query, values, (err, result) => {
        if (err) {
            console.error("회원가입 실패:", err.message);
            return res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
        }
        console.log()
        res.status(201).json({ message: "회원가입 성공!", userId: result.insertId });
    });
});

// 로그인 URL 성공 시 유저 객체 json으로 반환
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호는 필수 항목입니다." });
    }
    // 비밀번호 해싱
    const hashedPassword = hashPassword(password);
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    const values = [email, hashedPassword];
    con.query(query, values, (err, results) => {
        if (err) {
            console.error("로그인 실패:", err.message);
            return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
        }
        // 로그인 성공
        res.status(200).json({ message: "로그인 성공!", user: results[0] });
    });
});

module.exports = router;
