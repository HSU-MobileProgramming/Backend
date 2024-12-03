const express = require('express');
const router = express.Router();
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth.js');

let con = db.init();
db.connect(con);

// 여행 ID 검증 함수
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

// 사진 조각 생성 API
router.post('/', authenticateToken, (req, res) => {
    const { travel_id, url, description } = req.body;

    if (!travel_id || !url) {
        return res.status(400).json({
            message: "여행 ID와 URL은 필수 항목입니다."
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

        // piece 테이블에 사진 조각을 추가한 후, 생성된 travel_record_id를 사용해 photo 테이블에 사진을 추가
        const pieceQuery = `
            INSERT INTO piece (travel_id, category, description, created_at)
            VALUES (?, 'photo', ?, ?)
        `;
        const pieceValues = [travel_id, description, new Date()];
        con.query(pieceQuery, pieceValues, (err, result) => {
            if (err) {
                console.error("사진 조각 생성 실패:", err.message);
                return res.status(500).json({
                    message: "사진 조각 생성 중 오류가 발생했습니다."
                });
            }
            const travel_record_id = result.insertId;

            const photoQuery = `
                INSERT INTO photo (travel_record_id, url)
                VALUES (?, ?)
            `;
            const photoValues = [travel_record_id, url];
            con.query(photoQuery, photoValues, (err, result) => {
                if (err) {
                    console.error("사진 추가 실패:", err.message);
                    return res.status(500).json({
                        message: "사진 추가 중 오류가 발생했습니다."
                    });
                }
                res.status(201).json({
                    message: "사진이 추가되었습니다!",
                    travel_record_id: travel_record_id
                });
            });
        });
    });
});

// 사진 조각 조회 API
router.get('/:travel_record_id', authenticateToken, (req, res) => {
    const travel_record_id = req.params.travel_record_id;

    const query = `
        SELECT p.travel_record_id, p.travel_id, p.description, ph.url, p.created_at
        FROM piece p
        JOIN photo ph ON p.travel_record_id = ph.travel_record_id
        WHERE p.travel_record_id = ?
    `;

    con.query(query, [travel_record_id], (err, results) => {
        if (err) {
            console.error("사진 조각 조회 실패:", err.message);
            return res.status(500).json({
                message: "사진 조각 조회 중 오류가 발생했습니다."
            });
        }
        res.status(200).json(results[0]);
    });
});

module.exports = router;