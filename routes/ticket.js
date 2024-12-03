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

// 티켓 생성 API
router.post('/', authenticateToken, (req, res) => {
    const { travel_id, place, ticket_date } = req.body;

    if (!travel_id || !place || !ticket_date) {
        return res.status(400).json({
            message: "여행 ID, 장소, 티켓 날짜는 필수 항목입니다."
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

        const pieceQuery = `
            INSERT INTO piece (travel_id, category, description)
            VALUES (?, 'ticket', ?)
        `;
        const pieceValues = [travel_id, `${place} 티켓`, new Date()];
        con.query(pieceQuery, pieceValues, (err, result) => {
            if (err) {
                console.error("티켓 조각 생성 실패:", err.message);
                return res.status(500).json({
                    message: "티켓 조각 생성 중 오류가 발생했습니다."
                });
            }

            const travel_record_id = result.insertId;  // piece 테이블에서 생성된 travel_record_id

            // ticket 테이블에 티켓 추가
            const ticketQuery = `
                INSERT INTO ticket (travel_record_id, place, ticket_date)
                VALUES (?, ?, ?)
            `;
            const ticketValues = [travel_record_id, place, ticket_date];
            con.query(ticketQuery, ticketValues, (err, result) => {
                if (err) {
                    console.error("티켓 추가 실패:", err.message);
                    return res.status(500).json({
                        message: "티켓 추가 중 오류가 발생했습니다."
                    });
                }
                res.status(201).json({
                    message: "티켓이 추가되었습니다!",
                    travel_record_id: travel_record_id
                });
            });
        });
    });
});

// 티켓 조회 API
router.get('/:travel_record_id', authenticateToken, (req, res) => {
    const travel_record_id = req.params.travel_record_id;

    const query = `
        SELECT t.travel_record_id, t.travel_id, t.place, t.ticket_date
        FROM ticket t
        WHERE t.travel_record_id = ?
    `;

    con.query(query, [travel_record_id], (err, results) => {
        if (err) {
            console.error("티켓 조회 실패:", err.message);
            return res.status(500).json({
                message: "티켓 조회 중 오류가 발생했습니다."
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                message: "존재하지 않는 티켓입니다."
            });
        }
        res.status(200).json(results[0]);
    });
});

module.exports = router;
