const express = require("express");
const router = express.Router();
const db = require('../config/mysql.js');
const authenticateToken = require('../utils/auth');

let con = db.init();
db.connect(con);

// 여행 기록 생성
router.post("/travel_create", authenticateToken, (req, res) => {
    const { userId, cityId, countryId, title, startDate, endDate, description } = req.body;
    const query = `
      INSERT INTO travel (user_id, city_id, country_id, title, start_date, end_date, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    con.query(query, [userId, cityId, countryId, title, startDate, endDate, description], (err, result) => {
    if (err) 
        return res.status(500).send("여행 기록 생성 실패");
    
    res.status(201).send({ travelId: result.insertId, message: "여행 기록 생성 완료" });
    });
});
  
// 여행 기록 종료
router.put("/travel/complete/:travelId", authenticateToken, (req, res) => {
    const travelId = req.params.travelId;
    // 추가적인 종료 정보 처리 로직
    const query = "UPDATE travel SET travel_open = 1 WHERE travel_id = ?";
    con.query(query, [travelId], (err) => {
    if (err) 
        return res.status(500).send("여행 기록 종료 실패");
    
    res.send("여행 기록 종료 완료");
    });
});

// user_id로 여행 기록 전체 조회 (도시 이름과 나라 이름 포함)
router.get("/travels", authenticateToken, (req, res) => {
    const userId = req.user.id; // 인증된 유저의 ID
    const query = `
      SELECT t.travel_id, t.title, t.start_date, t.end_date, t.description, 
             c.name AS city_name, co.name AS country_name
      FROM travel t
      JOIN city c ON t.city_id = c.city_id
      JOIN country co ON t.country_id = co.country_id
      WHERE t.user_id = ? AND t.travel_open = 1
    `;
    con.query(query, [userId], (err, results) => {
        if (err) 
            return res.status(500).send("여행 기록 조회 실패");
        
        res.send(results);
    });
});

// travels_id와 user_id로 특정 여행 기록 조회
router.get("/travel/:travelId", authenticateToken, (req, res) => {
    const userId = req.user.id; // 인증된 유저의 ID
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


  
module.exports = router;