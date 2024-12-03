const express = require("express");
const router = express.Router();
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth');

let con = db.init();
db.connect(con);

// 여행 기록 생성 
router.post("/travel_create", authenticateToken, (req, res) => {
    const { cityId, countryId, title, startDate, endDate, description } = req.body;
    const userId = req.user.userId;
    const query = `
      INSERT INTO travel (user_id, city_id, country_id, title, start_date, end_date, description, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    con.query(query, [userId, cityId, countryId, title, startDate, endDate, description, 1], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "여행 기록 생성 실패" });
        }
        res.status(201).json({ travelId: result.insertId, message: "여행 기록 생성 완료" });
    });
});

  
// 여행기 종료
router.put("/travel/complete/:travelId", authenticateToken, (req, res) => {
    const travelId = req.params.travelId;
    const query = "UPDATE travel SET is_active = 0 WHERE travel_id = ?";
    con.query(query, [travelId], (err) => {
        if (err) {
            return res.status(500).json({ message: "여행 기록 종료 실패" }); // JSON 형식으로 에러 메시지 반환
        }
        res.status(200).json({ message: "여행 기록 종료 완료", travelId }); // 성공 메시지와 travelId 반환
    });
});


// user_id로 여행 기록 전체 조회 (도시 이름과 나라 이름 포함)
router.get("/travels", authenticateToken, (req, res) => {
    const userId = req.user.userId; // 인증된 유저의 ID
    const query = `
      SELECT t.travel_id, t.title, t.start_date, t.end_date, t.description, 
             c.name AS city_name, co.name AS country_name
      FROM travel t
      JOIN city c ON t.city_id = c.city_id
      JOIN country co ON t.country_id = co.country_id
      WHERE t.user_id = ? AND t.is_active = 0
    `;
    con.query(query, [userId], (err, results) => {
        if (err) 
            return res.status(500).send("여행 기록 조회 실패");
        
        res.send(results);
    });
});

// userId로 현재 여행중인 나라 조회
router.get("/current_travel", authenticateToken, (req, res) => {
    const userId = req.user.userId; // 인증된 유저의 ID
    const query = `
      SELECT t.travel_id, t.title, t.start_date, t.end_date, t.description, 
             c.name AS city_name, co.name AS country_name
      FROM travel t
      JOIN city c ON t.city_id = c.city_id
      JOIN country co ON t.country_id = co.country_id
      WHERE t.user_id = ? AND t.is_active = 1
    `;
    con.query(query, [userId], (err, results) => {
        if (err) 
            return res.status(500).send("여행 기록 조회 실패");
        
        res.send(results);
    });
});

// travels_id와 user_id로 특정 여행 기록 조회
router.get("/travel/:travelId", authenticateToken, (req, res) => {
    const userId = req.user.userId; // 인증된 유저의 ID
    const travelId = req.params.travelId; // 요청 경로에서 travels_id 추출
    const query = `
      SELECT t.travel_id, t.title, t.start_date, t.end_date, t.description, 
             t.created_at, t.updated_at, t.travel_open,
             c.name AS city_name, c.comment AS city_comment, c.city_image,
             co.name AS country_name, co.country_image
      FROM travel t
      JOIN city c ON t.city_id = c.city_id
      JOIN country co ON t.country_id = co.country_id
      WHERE t.travel_id = ? AND t.user_id = ?
    `;
    con.query(query, [travelId, userId], (err, results) => {
        if (err) 
            return res.status(500).send("여행 기록 조회 실패");
        
        if (results.length === 0) 
            return res.status(404).send("해당 여행 기록을 찾을 수 없습니다.");
        res.send(results[0]); // 상세 정보는 단일 객체로 반환
    });
});

// 모든 여행 기록 조회 (유저의 모든 여행)
router.get("/all_travels", authenticateToken, (req, res) => {
    const userId = req.user.userId; // 인증된 유저의 ID
    const query = `
      SELECT 
          t.travel_id, 
          t.title, 
          t.start_date, 
          t.end_date, 
          c.name AS city_name, 
          co.name AS country_name, 
          u.nickname, 
          u.profile_img
      FROM travel t
      JOIN city c ON t.city_id = c.city_id
      JOIN country co ON t.country_id = co.country_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.user_id != ? AND t.travel_open = 1 AND t.is_active = 0
    `;
    con.query(query, [userId], (err, results) => {
        if (err) {
            console.error("여행 기록 조회 실패:", err.message);
            return res.status(500).send("여행 기록 조회 실패"); // 서버 오류
        }
        if (results.length === 0) {
            return res.status(404).send("여행 기록이 없습니다."); // 결과가 없을 때
        }
        res.status(200).json(results); // 정상 조회
    });
});




module.exports = router;