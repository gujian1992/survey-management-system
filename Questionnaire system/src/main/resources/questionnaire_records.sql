-- 问卷记录与评分功能数据库设计
USE questionnaire_db;

-- 1. 问卷填写记录表
CREATE TABLE IF NOT EXISTS questionnaire_response (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    user_id BIGINT COMMENT '填写用户ID',
    response_id VARCHAR(50) UNIQUE NOT NULL COMMENT '响应唯一标识',
    
    -- 提交信息
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    start_time DATETIME COMMENT '开始答题时间',
    duration_seconds INT COMMENT '答题用时(秒)',
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'submitted' COMMENT '状态: draft-草稿, submitted-已提交, reviewing-审核中, scored-已评分, completed-已完成, rejected-已拒绝',
    
    -- 评分信息
    total_score DECIMAL(5,2) COMMENT '总评分(0-100)',
    sub_scores JSON COMMENT '分项评分JSON格式',
    grade VARCHAR(10) COMMENT '等级评定 A/B/C/D',
    is_passed BOOLEAN COMMENT '是否通过',
    
    -- 评分者信息
    scorer_id BIGINT COMMENT '评分者ID',
    scorer_name VARCHAR(50) COMMENT '评分者姓名',
    score_time DATETIME COMMENT '评分时间',
    feedback TEXT COMMENT '评语反馈',
    
    -- 系统信息
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    
    -- 审计字段
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除',
    
    -- 索引
    INDEX idx_questionnaire (questionnaire_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_submit_time (submit_time),
    INDEX idx_scorer (scorer_id),
    INDEX idx_response_id (response_id),
    
    -- 外键约束
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE SET NULL,
    FOREIGN KEY (scorer_id) REFERENCES sys_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷填写记录表';

-- 2. 评分配置表
CREATE TABLE IF NOT EXISTS scoring_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    scoring_criteria JSON COMMENT '评分标准配置',
    max_score INT DEFAULT 100 COMMENT '最高分',
    pass_score INT DEFAULT 60 COMMENT '及格分',
    grade_rules JSON COMMENT '等级规则配置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除',
    
    INDEX idx_questionnaire (questionnaire_id),
    
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分配置表';

-- 3. 更新原有答案表，添加响应记录关联
ALTER TABLE answer 
ADD COLUMN IF NOT EXISTS response_record_id BIGINT COMMENT '关联记录表ID',
ADD INDEX idx_response_record (response_record_id);

-- 4. 插入默认评分配置
INSERT INTO scoring_config (questionnaire_id, scoring_criteria, grade_rules) 
SELECT 
    id as questionnaire_id,
    '{"completeness": {"weight": 30, "name": "完整性", "description": "问卷填写的完整程度"}, "accuracy": {"weight": 40, "name": "准确性", "description": "答案的准确性和真实性"}, "quality": {"weight": 30, "name": "质量", "description": "答案的质量和深度"}}' as scoring_criteria,
    '{"A": {"min": 90, "max": 100, "name": "优秀"}, "B": {"min": 80, "max": 89, "name": "良好"}, "C": {"min": 60, "max": 79, "name": "及格"}, "D": {"min": 0, "max": 59, "name": "不及格"}}' as grade_rules
FROM questionnaire 
WHERE status = 1 AND deleted = 0
ON DUPLICATE KEY UPDATE questionnaire_id = questionnaire_id;

-- 5. 插入测试数据
INSERT INTO questionnaire_response (
    questionnaire_id, user_id, response_id, submit_time, start_time, 
    duration_seconds, status, ip_address, user_agent
) VALUES 
(1, 2, 'resp_001_user2', '2024-01-15 14:30:25', '2024-01-15 14:18:00', 745, 'submitted', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 3, 'resp_002_user3', '2024-01-14 16:45:12', '2024-01-14 16:32:00', 792, 'scored', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 2, 'resp_003_user2', '2024-01-13 10:22:33', '2024-01-13 10:15:00', 453, 'reviewing', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 4, 'resp_004_user4', '2024-01-12 15:18:45', '2024-01-12 15:05:00', 825, 'completed', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- 更新已评分记录的评分信息
UPDATE questionnaire_response 
SET 
    total_score = 85.5,
    sub_scores = '{"completeness": 80, "accuracy": 90, "quality": 87}',
    grade = 'B',
    is_passed = TRUE,
    scorer_id = 1,
    scorer_name = '系统管理员',
    score_time = '2024-01-14 17:30:00',
    feedback = '总体表现良好，答案完整且准确，建议在质量方面继续提升。'
WHERE response_id = 'resp_002_user3';

UPDATE questionnaire_response 
SET 
    total_score = 92.0,
    sub_scores = '{"completeness": 95, "accuracy": 90, "quality": 90}',
    grade = 'A',
    is_passed = TRUE,
    scorer_id = 1,
    scorer_name = '系统管理员',
    score_time = '2024-01-12 16:00:00',
    feedback = '优秀的答卷，逻辑清晰，内容详实，值得表扬！',
    status = 'completed'
WHERE response_id = 'resp_004_user4';

-- 6. 创建视图：问卷记录统计
CREATE OR REPLACE VIEW v_questionnaire_response_stats AS
SELECT 
    qr.questionnaire_id,
    q.title as questionnaire_title,
    COUNT(*) as total_responses,
    SUM(CASE WHEN qr.status = 'submitted' THEN 1 ELSE 0 END) as pending_review,
    SUM(CASE WHEN qr.status = 'reviewing' THEN 1 ELSE 0 END) as reviewing,
    SUM(CASE WHEN qr.status = 'scored' THEN 1 ELSE 0 END) as scored,
    SUM(CASE WHEN qr.status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN qr.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
    AVG(qr.total_score) as avg_score,
    SUM(CASE WHEN qr.is_passed = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100 as pass_rate
FROM questionnaire_response qr
LEFT JOIN questionnaire q ON qr.questionnaire_id = q.id
WHERE qr.deleted = 0 AND q.deleted = 0
GROUP BY qr.questionnaire_id, q.title;

-- 7. 验证数据
SELECT 'questionnaire_response表记录数:' as info, COUNT(*) as count FROM questionnaire_response WHERE deleted = 0
UNION ALL
SELECT 'scoring_config表记录数:' as info, COUNT(*) as count FROM scoring_config WHERE deleted = 0
UNION ALL
SELECT '待审核记录数:' as info, COUNT(*) as count FROM questionnaire_response WHERE status = 'submitted' AND deleted = 0
UNION ALL
SELECT '已评分记录数:' as info, COUNT(*) as count FROM questionnaire_response WHERE total_score IS NOT NULL AND deleted = 0; 