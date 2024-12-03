const express = require("express");
const router = express.Router();
const crypto = require('crypto');  // 비밀번호 해싱
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth');
const uploadImage = require("../utils/s3_util.js"); 

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config.js');

let con = db.init();
db.connect(con);

// 비밀번호 해시 함수
function hashPassword(password) { 
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 회원가입 URL
router.post("/register", uploadImage.single("profile_img"), (req, res) => {
    const { name, email, password, nickname, gender, country, gps_consent, is_public } = req.body;
    const profile_img = req.file?.location || null; 
    if (!name || !email || !password) {
      return res.status(400).json({ message: "이름, 이메일, 비밀번호는 필수 항목입니다." });
    }
  
    const emailCheckQuery = `SELECT * FROM users WHERE email = ?`;
    con.query(emailCheckQuery, [email], (err, results) => {
      if (err) {
        console.error("이메일 중복 확인 실패:", err.message);
        return res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
      }
  
      if (results.length > 0) {
        return res.status(409).json({ message: "이미 사용중인 이메일입니다." });
      }
  
      const hashedPassword = hashPassword(password);
      const query = `
        INSERT INTO users (name, email, password, nickname, gender, profile_img, country, gps_consent, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        name,
        email,
        hashedPassword,
        nickname,
        gender,
        profile_img,
        country,
        gps_consent === "true",
        is_public === "true",
      ];
      con.query(query, values, (err, result) => {
        if (err) {
          console.error("회원가입 실패:", err.message);
          return res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
        }
        console.log("회원가입 성공! 이미지 url : "+profile_img);
        res.status(201).json({
          message: "회원가입 성공!",
          userId: result.insertId,
          imageUrl: profile_img, // 업로드된 이미지 URL 반환
        });
      });
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
        const user = results[0];
        const token = jwt.sign(
            { userId: user.user_id, email: user.email }, 
            SECRET_KEY,
            { expiresIn: '24h' } // 토큰 유효 시간 1h
        );
        res.status(200).json({ message: "로그인 성공!", user: results[0], token: token });
    });
});

// 사용자 정보 조회
router.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId; // JWT에서 userId 추출
    const query = `SELECT * FROM users WHERE user_id = ?`;
    con.query(query, [userId], (err, results) => {
        if (err) {
            console.error("사용자 정보 조회 실패:", err.message);
            return res.status(500).json({ message: "사용자 정보를 가져오는 중 오류가 발생했습니다." });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        res.status(200).json({ user: results[0] });
    });
});

module.exports = router;
