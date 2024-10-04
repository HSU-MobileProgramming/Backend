const express = require("express");
const router = express.Router();
const crypto = require('crypto');  // 비밀번호 해싱
const db = require('../config/mysql.js');   // 설정 파일

let con = db.init();

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


module.exports = router;