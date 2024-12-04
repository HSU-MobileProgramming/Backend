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

/*
CREATE TABLE travel (
    travel_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    city_id BIGINT,
    country_id BIGINT,
    title VARCHAR(255),
    start_date DATETIME,
    end_date DATETIME,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    travel_open TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES city(city_id) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES country(country_id) ON DELETE SET NULL
);

-- 여행 조각 테이블 생성
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

// 전체 여행 조각 리스트로 조회 API
router.get('/:travel_id', authenticateToken, (req, res) => {
    const user_id = req.user.userId;
    const travel_id = req.params.travel_id;

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

        // travel의 user_id와 현재 로그인한 user_id가 일치한 경우에만 조회
        const query = `
            SELECT p.travel_record_id, p.category, p.created_at
            FROM piece p
            JOIN travel t ON p.travel_id = t.travel_id
            WHERE t.travel_id = ? AND t.user_id = ?
        `;
        const values = [travel_id, user_id];
        con.query(query, values, (err, results) => {
            if (err) {
                console.error("여행 조각 조회 실패:", err.message);
                return res.status(500).json({ 
                    message: "여행 조각 조회 중 오류가 발생했습니다." 
                });
            }
            res.status(200).json({ pieces: results });
        });
    });
});

// 메모 조각 리스트로 조회 API
router.get('/memo/:travel_id', authenticateToken, (req, res) => {
    const user_id = req.user.userId;
    const travel_id = req.params.travel_id;

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

        // travel의 user_id와 현재 로그인한 user_id가 일치한 경우에만 조회
        // travel과 piece 테이블을 조인하여 category가 'text'인 데이터만 조회
        const query = `
            SELECT p.travel_record_id, p.created_at
            FROM piece p
            JOIN travel t ON p.travel_id = t.travel_id
            WHERE t.travel_id = ? AND t.user_id = ? AND p.category = 'text'
        `;
        const values = [travel_id, user_id];
        con.query(query, values, (err, results) => {
            if (err) {
                console.error("메모 조회 실패:", err.message);
                return res.status(500).json({ 
                    message: "메모 조회 중 오류가 발생했습니다." 
                });
            }
            res.status(200).json({ memos: results });
        });
    });
});

// 사진 조각 리스트로 조회 API
router.get('/photo/:travel_id', authenticateToken, (req, res) => {
    const user_id = req.user.userId;
    const travel_id = req.params.travel_id;

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

        // travel의 user_id와 현재 로그인한 user_id가 일치한 경우에만 조회
        // travel과 piece 테이블을 조인하여 category가 'photo'인 데이터만 조회
        const query = `
            SELECT p.travel_record_id, p.created_at
            FROM piece p
            JOIN travel t ON p.travel_id = t.travel_id
            WHERE t.travel_id = ? AND t.user_id = ? AND p.category = 'photo'
        `;
        const values = [travel_id, user_id];
        con.query(query, values, (err, results) => {
            if (err) {
                console.error("사진 조회 실패:", err.message);
                return res.status(500).json({ 
                    message: "사진 조회 중 오류가 발생했습니다." 
                });
            }
            res.status(200).json({ photos: results });
        });
    });
});

// 티켓 조각 리스트로 조회 API
router.get('/ticket/:travel_id', authenticateToken, (req, res) => {
    const user_id = req.user.userId;
    const travel_id = req.params.travel_id;

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

        // travel의 user_id와 현재 로그인한 user_id가 일치한 경우에만 조회
        // travel과 piece 테이블을 조인하여 category가 'ticket'인 데이터만 조회
        const query = `
            SELECT p.travel_record_id, p.created_at
            FROM piece p
            JOIN travel t ON p.travel_id = t.travel_id
            WHERE t.travel_id = ? AND t.user_id = ? AND p.category = 'ticket'
        `;
        const values = [travel_id, user_id];
        con.query(query, values, (err, results) => {
            if (err) {
                console.error("티켓 조회 실패:", err.message);
                return res.status(500).json({ 
                    message: "티켓 조회 중 오류가 발생했습니다." 
                });
            }
            res.status(200).json({ tickets: results });
        });
    });
});

module.exports = router;