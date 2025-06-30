-- 简化版答题会话测试数据
USE questionnaire_db;

-- 插入两条基础的答题会话数据
INSERT INTO answer_session (
    user_id, 
    session_code, 
    question_type, 
    total_count, 
    current_count, 
    current_score, 
    status, 
    start_time
) VALUES 
-- 第一条：用户ID=1的进行中会话
(1, 'SESSION001', 1, 10, 6, 12, 1, NOW() - INTERVAL 30 MINUTE),
-- 第二条：用户ID=1的已完成会话  
(1, 'SESSION002', 2, 8, 8, 18, 2, NOW() - INTERVAL 2 HOUR);

-- 查询验证
SELECT * FROM answer_session; 