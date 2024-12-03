const express = require("express");
const router = express.Router();
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth.js');

let con = db.init();
db.connect(con);

// travel_id 검증 함수
function validateTravelId(travel_id, callback) {
    const query = 'SELECT COUNT(*) AS count FROM travel WHERE travel_id = ?';
    con.query(query, [travel_id], (err, results) => {
        if (err) {
            console.error("여행 ID 검증 실패:", err.message);
            return callback(err, null);
        }
        const exists = results[0].count > 0;
        callback(null, exists);
    });
}

// 메모 조각 생성 API
router.post('/', authenticateToken, (req, res) => {
    const { travel_id, description } = req.body;

    if (!travel_id || !description) {
        return res.status(400).json({ 
            message: "여행 ID와 내용은 필수 항목입니다." 
        });
    }

    // travel_id 유효성 확인
    validateTravelId(travel_id, (err, exists) => {
        if (err) {
            return res.status(500).json({ 
                message: "여행 ID 검증 중 오류가 발생했습니다." 
            });
        }
        if (!exists) {
            return res.status(400).json({ 
                message: "유효하지 않은 여행 ID입니다." 
            });
        }

        /*
            CREATE TABLE piece (
                travel_record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                travel_id BIGINT,
                category ENUM('photo', 'text', 'ticket') NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (travel_id) REFERENCES travel(travel_id) ON DELETE CASCADE
            );
        */

        const query = `
            INSERT INTO piece (travel_id, category, description, created_at)
            VALUES (?, 'text', ?, ?)
        `;

        const values = [travel_id, description, new Date()];

        con.query(query, values, (err, result) => {
            if (err) {
                console.error("메모 조각 생성 실패:", err.message);
                return res.status(500).json({ 
                    message: "메모 조각 생성 중 오류가 발생했습니다." 
                });
            }
            res.status(201).json({ 
                message: "메모 조각이 생성되었습니다!", 
                piece_id: result.insertId 
            });
        });
    });
});

module.exports = router;