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

// 메모 조각 조회 API
router.get('/:travel_record_id', authenticateToken, (req, res) => {
    const travel_record_id = req.params.travel_record_id;

    const query = `
        SELECT travel_record_id, travel_id, description, created_at
        FROM piece
        WHERE travel_record_id = ?
    `;

    con.query(query, [travel_record_id], (err, results) => {
        if (err) {
            console.error("메모 조회 실패:", err.message);
            return res.status(500).json({ 
                message: "메모 조회 중 오류가 발생했습니다." 
            });
        }
        if (results.length === 0) {
            return res.status(404).json({ 
                message: "존재하지 않는 메모 조각입니다." 
            });
        }
        res.status(200).json(results[0]);
    });
});

module.exports = router;