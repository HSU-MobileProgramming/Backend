const express = require("express");
const router = express.Router();
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth');

let con = db.init();
db.connect(con);

// 방문 국가 저장 API
router.post('/visit', authenticateToken, (req, res) => {
    const { color, country_id } = req.body;
    const user_id = req.user.userId; // JWT에서 추출한 사용자 ID

    // 필수값 확인
    if (!color || !country_id) {
        return res.status(400).json({ 
            message: "색상과 국가 ID는 필수 항목입니다." 
        });
    }

    // MySQL 삽입 쿼리
    const query = `
        INSERT INTO map (user_id, color, country_id)
        VALUES (?, ?, ?)
    `;
    const values = [user_id, color, country_id];

    con.query(query, values, (err, result) => {
        if (err) {
            console.error("방문 기록 저장 실패:", err.message);
            return res.status(500).json({ 
                message: "방문 기록 저장 중 오류가 발생했습니다." 
            });
        }
        res.status(201).json({ 
            message: "방문 기록이 저장되었습니다!", 
            visit_id: result.insertId 
        });
    });
});

// 사용자의 방문 기록 조회 API
router.get('/visits', authenticateToken, (req, res) => {
    const user_id = req.user.userId;

    const query = `
        SELECT * FROM map 
        WHERE user_id = ? 
        ORDER BY visit_id DESC
    `;

    con.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("방문 기록 조회 실패:", err.message);
            return res.status(500).json({ 
                message: "방문 기록을 가져오는 중 오류가 발생했습니다." 
            });
        }
        res.status(200).json({ visits: results });
    });
});

module.exports = router;