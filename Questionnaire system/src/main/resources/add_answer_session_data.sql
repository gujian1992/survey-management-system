-- =====================================
-- 添加答题会话测试数据
-- =====================================

USE questionnaire_db;

-- 确保有测试用户数据（如果不存在则插入）
INSERT IGNORE INTO sys_user (id, username, password, real_name, role, email, enabled) VALUES 
(1, 'admin', '$2a$10$7JB720yubVSOfvVaMWNNYe/RENMdLQS6.Q9Sw6U6.Q9Sw6U6.Q9Sw', '系统管理员', 'ADMIN', 'admin@test.com', TRUE),
(2, 'zhangsan', '$2a$10$7JB720yubVSOfvVaMWNNYe/RENMdLQS6.Q9Sw6U6.Q9Sw6U6.Q9Sw', '张三', 'USER', 'zhangsan@test.com', TRUE),
(3, 'lisi', '$2a$10$7JB720yubVSOfvVaMWNNYe/RENMdLQS6.Q9Sw6U6.Q9Sw6U6.Q9Sw', '李四', 'USER', 'lisi@test.com', TRUE),
(4, 'wangwu', '$2a$10$7JB720yubVSOfvVaMWNNYe/RENMdLQS6.Q9Sw6U6.Q9Sw6U6.Q9Sw', '王五', 'USER', 'wangwu@test.com', TRUE);

-- 插入答题会话测试数据
INSERT INTO answer_session (
    user_id, 
    session_code, 
    question_type, 
    total_count, 
    current_count, 
    total_score, 
    current_score, 
    auto_score, 
    final_score, 
    status, 
    start_time, 
    end_time, 
    timeout_minutes, 
    scoring_status
) VALUES 
-- 第一条：张三的进行中单选题会话
(
    2,                                    -- user_id: 张三
    'AS20241225001',                     -- session_code: 会话编码
    1,                                   -- question_type: 单选题
    10,                                  -- total_count: 计划答10题
    6,                                   -- current_count: 已答6题
    20,                                  -- total_score: 理论总分20分
    12,                                  -- current_score: 当前得分12分
    12,                                  -- auto_score: 自动评分12分
    12,                                  -- final_score: 最终得分12分
    1,                                   -- status: 进行中
    DATE_SUB(NOW(), INTERVAL 25 MINUTE), -- start_time: 25分钟前开始
    NULL,                                -- end_time: 未结束
    60,                                  -- timeout_minutes: 60分钟超时
    0                                    -- scoring_status: 未评分
),
-- 第二条：李四的已完成多选题会话
(
    3,                                    -- user_id: 李四
    'AS20241225002',                     -- session_code: 会话编码
    2,                                   -- question_type: 多选题
    8,                                   -- total_count: 计划答8题
    8,                                   -- current_count: 已答8题
    24,                                  -- total_score: 理论总分24分
    18,                                  -- current_score: 当前得分18分
    18,                                  -- auto_score: 自动评分18分
    18,                                  -- final_score: 最终得分18分
    2,                                   -- status: 已完成
    DATE_SUB(NOW(), INTERVAL 2 HOUR),    -- start_time: 2小时前开始
    DATE_SUB(NOW(), INTERVAL 45 MINUTE), -- end_time: 45分钟前结束
    90,                                  -- timeout_minutes: 90分钟超时
    2                                    -- scoring_status: 已完成评分
),
-- 第三条：王五的超时会话
(
    4,                                    -- user_id: 王五
    'AS20241225003',                     -- session_code: 会话编码
    0,                                   -- question_type: 混合题型
    15,                                  -- total_count: 计划答15题
    7,                                   -- current_count: 已答7题
    30,                                  -- total_score: 理论总分30分
    14,                                  -- current_score: 当前得分14分
    14,                                  -- auto_score: 自动评分14分
    14,                                  -- final_score: 最终得分14分
    3,                                   -- status: 已超时
    DATE_SUB(NOW(), INTERVAL 3 HOUR),    -- start_time: 3小时前开始
    DATE_SUB(NOW(), INTERVAL 1 HOUR),    -- end_time: 1小时前超时
    60,                                  -- timeout_minutes: 60分钟超时
    1                                    -- scoring_status: 部分评分
),
-- 第四条：张三的另一个已完成填空题会话
(
    2,                                    -- user_id: 张三（再次答题）
    'AS20241225004',                     -- session_code: 会话编码
    3,                                   -- question_type: 填空题
    5,                                   -- total_count: 计划答5题
    5,                                   -- current_count: 已答5题
    10,                                  -- total_score: 理论总分10分
    8,                                   -- current_score: 当前得分8分
    5,                                   -- auto_score: 自动评分5分（填空题需人工评分）
    8,                                   -- final_score: 最终得分8分
    2,                                   -- status: 已完成
    DATE_SUB(NOW(), INTERVAL 1 DAY),     -- start_time: 1天前开始
    DATE_SUB(NOW(), INTERVAL 23 HOUR),   -- end_time: 23小时前结束
    45,                                  -- timeout_minutes: 45分钟超时
    2                                    -- scoring_status: 已完成评分
);

-- 插入一些对应的答题记录（模拟真实答题）
INSERT INTO answer_record (
    session_id,
    question_id,
    question_type,
    question_content,
    question_options,
    user_answer,
    correct_answer,
    is_correct,
    auto_score,
    final_score,
    answer_time,
    time_spent_seconds,
    sequence_number
) VALUES 
-- 张三会话1的答题记录（部分题目）
(1, 1, 1, '中国的首都是哪里？', '["北京", "上海", "广州", "深圳"]', '北京', '北京', TRUE, 2, 2, DATE_SUB(NOW(), INTERVAL 20 MINUTE), 30, 1),
(1, 2, 1, '以下哪个是编程语言？', '["Java", "Word", "Excel", "Photoshop"]', 'Java', 'Java', TRUE, 2, 2, DATE_SUB(NOW(), INTERVAL 18 MINUTE), 45, 2),
(1, 3, 1, '1+1等于多少？', '["1", "2", "3", "4"]', '2', '2', TRUE, 1, 1, DATE_SUB(NOW(), INTERVAL 15 MINUTE), 15, 3),
(1, 4, 1, 'HTTP协议默认端口号是？', '["21", "22", "80", "443"]', '443', '80', FALSE, 0, 0, DATE_SUB(NOW(), INTERVAL 12 MINUTE), 60, 4),
(1, 5, 1, 'Java中String类型是？', '["基本数据类型", "引用数据类型", "包装类型", "接口类型"]', '引用数据类型', '引用数据类型', TRUE, 3, 3, DATE_SUB(NOW(), INTERVAL 8 MINUTE), 90, 5),
(1, 6, 1, 'SpringBoot的默认端口是？', '["8080", "8081", "9090", "3000"]', '8080', '8080', TRUE, 2, 2, DATE_SUB(NOW(), INTERVAL 5 MINUTE), 40, 6),

-- 李四会话2的答题记录（多选题，已完成）
(2, 7, 2, '以下哪些是水果？', '["苹果", "香蕉", "土豆", "萝卜", "橙子"]', '["苹果", "香蕉", "橙子"]', '["苹果", "香蕉", "橙子"]', TRUE, 3, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR 30 MINUTE), 120, 1),
(2, 8, 2, 'Java的特点包括哪些？', '["面向对象", "跨平台", "自动内存管理", "编译型语言"]', '["面向对象", "跨平台"]', '["面向对象", "跨平台", "自动内存管理"]', FALSE, 0, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR 25 MINUTE), 180, 2),
(2, 9, 2, '以下哪些是前端技术？', '["HTML", "CSS", "JavaScript", "MySQL", "Vue.js"]', '["HTML", "CSS", "JavaScript", "Vue.js"]', '["HTML", "CSS", "JavaScript", "Vue.js"]', TRUE, 3, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR 20 MINUTE), 150, 3),
(2, 10, 2, 'Spring框架的核心模块包括？', '["IOC容器", "AOP", "MVC", "Security", "JPA"]', '["IOC容器", "AOP", "MVC"]', '["IOC容器", "AOP", "MVC"]', TRUE, 4, 4, DATE_SUB(NOW(), INTERVAL 1 HOUR 15 MINUTE), 200, 4),
(2, 11, 2, '以下哪些是关系型数据库？', '["MySQL", "Redis", "PostgreSQL", "MongoDB", "Oracle"]', '["MySQL", "PostgreSQL", "Oracle"]', '["MySQL", "PostgreSQL", "Oracle"]', TRUE, 3, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR 10 MINUTE), 160, 5);

-- 查询验证数据
SELECT 
    s.id,
    s.session_code,
    u.real_name as user_name,
    CASE s.question_type 
        WHEN 0 THEN '混合题型'
        WHEN 1 THEN '单选题'
        WHEN 2 THEN '多选题'
        WHEN 3 THEN '填空题'
        WHEN 4 THEN '简答题'
        WHEN 5 THEN '评分题'
    END as question_type_name,
    s.current_count,
    s.total_count,
    s.current_score,
    CASE s.status 
        WHEN 1 THEN '进行中'
        WHEN 2 THEN '已完成'
        WHEN 3 THEN '已超时'
        WHEN 4 THEN '已放弃'
    END as status_name,
    s.start_time,
    s.end_time
FROM answer_session s
LEFT JOIN sys_user u ON s.user_id = u.id
ORDER BY s.start_time DESC;

COMMIT; 