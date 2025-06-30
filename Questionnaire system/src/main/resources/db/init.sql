-- =====================================
-- 问卷答题系统完整数据库初始化脚本
-- 新产品逻辑：题库管理 + 动态出题 + 评分系统
-- 无外键约束版本
-- =====================================

USE questionnaire_db;

-- =====================================
-- 创建表结构
-- =====================================

-- 1. 用户表（使用原有结构）
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密后）',
    real_name VARCHAR(100) NOT NULL COMMENT '真实姓名',
    role VARCHAR(20) NOT NULL COMMENT '用户角色：ADMIN-管理员，USER-用户',
    email VARCHAR(100) COMMENT '邮箱',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_create_time (create_time)
) COMMENT '用户表';

-- 2. 题库表（核心：管理员管理的题目库）
CREATE TABLE IF NOT EXISTS question_bank (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '题目ID',
    title TEXT NOT NULL COMMENT '题目标题',
    type INT NOT NULL COMMENT '题型：1-单选 2-多选 3-填空 4-简答 5-评分',
    content TEXT COMMENT '题目描述详细说明',
    options JSON COMMENT '选项内容（JSON格式，适用于选择题）',
    correct_answer TEXT COMMENT '正确答案（客观题使用，主观题为NULL）',
    priority INT DEFAULT 1 COMMENT '优先级：1-低 2-中 3-高（影响出题概率）',
    score INT DEFAULT 1 COMMENT '题目分数',
    difficulty INT DEFAULT 1 COMMENT '难度等级：1-简单 2-中等 3-困难',
    tags VARCHAR(500) COMMENT '标签（便于分类筛选，逗号分隔）',
    status INT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
    creator_id BIGINT COMMENT '创建者ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_difficulty (difficulty),
    INDEX idx_status (status),
    INDEX idx_creator (creator_id),
    INDEX idx_create_time (create_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库表';

-- 3. 答题会话表（记录用户的答题过程）
CREATE TABLE IF NOT EXISTS answer_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_code VARCHAR(50) NOT NULL COMMENT '会话唯一编码',
    question_type INT NOT NULL COMMENT '选择的题型：1-单选 2-多选 3-填空 4-简答 5-评分 0-混合',
    total_count INT NOT NULL COMMENT '计划答题总数',
    current_count INT DEFAULT 0 COMMENT '当前已答题数',
    total_score INT DEFAULT 0 COMMENT '理论总分',
    current_score INT DEFAULT 0 COMMENT '当前得分',
    auto_score INT DEFAULT 0 COMMENT '自动评分总分',
    manual_score INT COMMENT '人工评分总分',
    final_score INT DEFAULT 0 COMMENT '最终总分',
    status INT DEFAULT 1 COMMENT '会话状态：1-进行中 2-已完成 3-已超时 4-已放弃',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    last_activity_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后活动时间',
    timeout_minutes INT DEFAULT 60 COMMENT '超时时间（分钟）',
    scoring_status INT DEFAULT 0 COMMENT '评分状态：0-未评分 1-部分评分 2-已完成评分',
    
    INDEX idx_user (user_id),
    INDEX idx_session_code (session_code),
    INDEX idx_question_type (question_type),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_scoring_status (scoring_status),
    UNIQUE KEY uk_session_code (session_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答题会话表';

-- 4. 答题记录表（记录每道题的答题情况）
CREATE TABLE IF NOT EXISTS answer_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '答题记录ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    question_id BIGINT NOT NULL COMMENT '题目ID',
    question_type INT NOT NULL COMMENT '题型',
    question_content TEXT COMMENT '题目描述快照（防止题目被修改影响记录）',
    question_options JSON COMMENT '题目选项快照',
    user_answer TEXT COMMENT '用户答案',
    correct_answer TEXT COMMENT '正确答案',
    is_correct BOOLEAN COMMENT '是否正确（客观题自动判断，主观题为NULL）',
    auto_score INT DEFAULT 0 COMMENT '自动评分',
    manual_score INT COMMENT '人工评分（主观题使用）',
    final_score INT DEFAULT 0 COMMENT '最终得分',
    answer_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
    time_spent_seconds INT COMMENT '答题用时（秒）',
    sequence_number INT COMMENT '题目序号（在本次会话中的顺序）',
    
    INDEX idx_session (session_id),
    INDEX idx_question (question_id),
    INDEX idx_question_type (question_type),
    INDEX idx_answer_time (answer_time),
    INDEX idx_sequence (sequence_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答题记录表';

-- 5. 评分记录表（管理员评分记录）
CREATE TABLE IF NOT EXISTS scoring_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '评分记录ID',
    answer_record_id BIGINT NOT NULL COMMENT '答题记录ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    scorer_id BIGINT NOT NULL COMMENT '评分者ID',
    score INT NOT NULL COMMENT '评分',
    max_score INT NOT NULL COMMENT '满分',
    feedback TEXT COMMENT '评分反馈',
    scoring_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评分时间',
    
    INDEX idx_answer_record (answer_record_id),
    INDEX idx_session (session_id),
    INDEX idx_scorer (scorer_id),
    INDEX idx_scoring_time (scoring_time),
    UNIQUE KEY uk_answer_scorer (answer_record_id, scorer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分记录表';

-- 6. 问卷回复记录表（保持向后兼容）
CREATE TABLE IF NOT EXISTS questionnaire_response (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '回复ID',
    questionnaire_id BIGINT COMMENT '原问卷ID（可为NULL，兼容旧数据）',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    session_id BIGINT COMMENT '答题会话ID（新系统）',
    question_type INT COMMENT '题型',
    total_questions INT COMMENT '总题数',
    auto_score INT DEFAULT 0 COMMENT '自动评分总分',
    manual_score INT COMMENT '人工评分总分',
    final_score INT DEFAULT 0 COMMENT '最终总分',
    scoring_status INT DEFAULT 0 COMMENT '评分状态：0-未评分 1-部分评分 2-已完成评分',
    scorer_id BIGINT COMMENT '评分者ID',
    scoring_time DATETIME COMMENT '评分完成时间',
    
    INDEX idx_questionnaire (questionnaire_id),
    INDEX idx_user (user_id),
    INDEX idx_submit_time (submit_time),
    INDEX idx_session (session_id),
    INDEX idx_question_type (question_type),
    INDEX idx_scoring_status (scoring_status),
    INDEX idx_scorer (scorer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷回复记录表';

-- =====================================
-- 插入初始示例数据
-- =====================================

-- 插入示例题目数据
INSERT INTO question_bank (title, type, content, options, correct_answer, priority, score, difficulty, tags, creator_id) VALUES
-- 单选题
('中国的首都是哪里？', 1, '请选择中华人民共和国的首都城市', '["北京", "上海", "广州", "深圳"]', '北京', 2, 2, 1, '地理,常识', 1),
('以下哪个是编程语言？', 1, '请选择下列选项中的编程语言', '["Java", "Word", "Excel", "Photoshop"]', 'Java', 2, 2, 1, '计算机,编程', 1),
('1+1等于多少？', 1, '基础数学计算题', '["1", "2", "3", "4"]', '2', 1, 1, 1, '数学,基础', 1),
('HTTP协议默认端口号是？', 1, '计算机网络基础知识', '["21", "22", "80", "443"]', '80', 2, 2, 2, '计算机,网络', 1),
('Java中String类型是？', 1, 'Java基础知识', '["基本数据类型", "引用数据类型", "包装类型", "接口类型"]', '引用数据类型', 3, 3, 2, '计算机,Java', 1),
('SpringBoot的默认端口是？', 1, 'SpringBoot基础知识', '["8080", "8081", "9090", "3000"]', '8080', 2, 2, 2, '计算机,SpringBoot', 1),

-- 多选题  
('以下哪些是水果？', 2, '请选择所有属于水果的选项', '["苹果", "香蕉", "土豆", "萝卜", "橙子"]', '["苹果", "香蕉", "橙子"]', 2, 3, 2, '生活,常识', 1),
('Java的特点包括哪些？', 2, '选择Java语言的主要特点', '["面向对象", "跨平台", "自动内存管理", "编译型语言"]', '["面向对象", "跨平台", "自动内存管理"]', 3, 4, 3, '计算机,Java', 1),
('以下哪些是前端技术？', 2, '选择属于前端开发的技术', '["HTML", "CSS", "JavaScript", "MySQL", "Vue.js"]', '["HTML", "CSS", "JavaScript", "Vue.js"]', 2, 3, 2, '计算机,前端', 1),
('Spring框架的核心模块包括？', 2, 'Spring框架组成', '["IOC容器", "AOP", "MVC", "Security", "JPA"]', '["IOC容器", "AOP", "MVC"]', 3, 4, 3, '计算机,Spring', 1),
('以下哪些是关系型数据库？', 2, '选择关系型数据库', '["MySQL", "Redis", "PostgreSQL", "MongoDB", "Oracle"]', '["MySQL", "PostgreSQL", "Oracle"]', 2, 3, 2, '计算机,数据库', 1),

-- 填空题
('请填写中华人民共和国成立的年份：_____年', 3, '中华人民共和国成立年份', NULL, '1949', 2, 2, 2, '历史,中国', 1),
('Spring框架的核心特性是_____和_____', 3, 'Spring框架核心特性（请用英文简称，逗号分隔）', NULL, 'IOC,AOP', 3, 3, 3, '计算机,Spring', 1),
('HTTP状态码中，_____表示请求成功', 3, 'HTTP状态码知识', NULL, '200', 2, 2, 2, '计算机,网络', 1),
('MySQL中，_____语句用于查询数据', 3, 'SQL基础语句', NULL, 'SELECT', 2, 2, 1, '计算机,数据库', 1),
('Vue.js中，_____指令用于双向数据绑定', 3, 'Vue.js基础指令', NULL, 'v-model', 2, 2, 2, '计算机,Vue', 1),
('CSS中，_____属性用于设置文字颜色', 3, 'CSS基础属性', NULL, 'color', 1, 1, 1, '计算机,CSS', 1),

-- 简答题
('请简述面向对象编程的三大特性', 4, '简述面向对象编程的封装、继承、多态三大特性及其含义', NULL, NULL, 3, 5, 3, '计算机,面向对象', 1),
('描述你对人工智能的理解', 4, '谈谈你对AI技术的认识和看法，包括应用场景、发展趋势等', NULL, NULL, 2, 4, 2, '科技,AI', 1),
('简述RESTful API的设计原则', 4, '请说明RESTful API的主要设计原则和特点', NULL, NULL, 3, 5, 3, '计算机,API', 1),
('什么是数据库事务？有哪些特性？', 4, '解释数据库事务的概念和ACID特性', NULL, NULL, 3, 5, 3, '计算机,数据库', 1),
('请谈谈你对敏捷开发的理解', 4, '简述敏捷开发的理念、方法和优势', NULL, NULL, 2, 4, 2, '软件工程,管理', 1),
('简述MVC设计模式的优点', 4, '请说明MVC模式的结构和优势', NULL, NULL, 3, 4, 3, '计算机,设计模式', 1),

-- 评分题
('请为这次系统使用体验打分', 5, '1-5分评价系统使用体验（1分最低，5分最高）', '["1分-很差", "2分-较差", "3分-一般", "4分-较好", "5分-很好"]', NULL, 1, 2, 1, '评价,体验', 1),
('请评价本次答题难度', 5, '1-5分评价题目难度', '["1分-很简单", "2分-较简单", "3分-适中", "4分-较难", "5分-很难"]', NULL, 1, 2, 1, '评价,难度', 1),
('您对我们产品的推荐度如何？', 5, '1-10分评价推荐度', '["1分", "2分", "3分", "4分", "5分", "6分", "7分", "8分", "9分", "10分"]', NULL, 2, 3, 1, '评价,推荐', 1),
('请评价界面美观度', 5, '1-5分评价界面设计', '["1分-很丑", "2分-较丑", "3分-一般", "4分-较美", "5分-很美"]', NULL, 1, 2, 1, '评价,界面', 1);

-- =====================================
-- 创建实用视图
-- =====================================

-- 用户答题统计视图
CREATE OR REPLACE VIEW user_answer_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.real_name,
    u.role,
    u.enabled,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 2 THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 1 THEN s.id END) as ongoing_sessions,
    SUM(CASE WHEN s.status = 2 THEN s.final_score ELSE 0 END) as total_score,
    ROUND(AVG(CASE WHEN s.status = 2 THEN s.final_score END), 2) as avg_score,
    MAX(s.start_time) as last_answer_time,
    COUNT(DISTINCT ar.id) as total_answers,
    COUNT(DISTINCT CASE WHEN ar.is_correct = 1 THEN ar.id END) as correct_answers
FROM sys_user u
LEFT JOIN answer_session s ON u.id = s.user_id
LEFT JOIN answer_record ar ON s.id = ar.session_id
WHERE u.role = 'USER' AND u.enabled = TRUE
GROUP BY u.id, u.username, u.real_name, u.role, u.enabled;

-- 题目使用统计视图
CREATE OR REPLACE VIEW question_usage_stats AS
SELECT 
    qb.id as question_id,
    qb.title,
    CASE qb.type 
        WHEN 1 THEN '单选题'
        WHEN 2 THEN '多选题'
        WHEN 3 THEN '填空题'
        WHEN 4 THEN '简答题'
        WHEN 5 THEN '评分题'
        ELSE '未知'
    END as type_name,
    qb.type,
    qb.priority,
    qb.score,
    qb.difficulty,
    qb.tags,
    qb.status,
    COUNT(ar.id) as total_answers,
    COUNT(CASE WHEN ar.is_correct = 1 THEN 1 END) as correct_answers,
    COUNT(CASE WHEN ar.is_correct = 0 THEN 1 END) as wrong_answers,
    COUNT(CASE WHEN ar.is_correct IS NULL THEN 1 END) as subjective_answers,
    ROUND(COUNT(CASE WHEN ar.is_correct = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN ar.is_correct IS NOT NULL THEN 1 END), 0), 2) as correct_rate,
    ROUND(AVG(ar.time_spent_seconds), 2) as avg_time_spent,
    MAX(ar.answer_time) as last_used_time,
    qb.create_time,
    qb.update_time
FROM question_bank qb
LEFT JOIN answer_record ar ON qb.id = ar.question_id
WHERE qb.deleted = 0
GROUP BY qb.id, qb.title, qb.type, qb.priority, qb.score, qb.difficulty, qb.tags, qb.status, qb.create_time, qb.update_time;

-- 评分工作量统计视图
CREATE OR REPLACE VIEW scoring_workload AS
SELECT 
    s.id as session_id,
    s.session_code,
    u.username as student_name,
    u.real_name as student_real_name,
    CASE s.question_type 
        WHEN 0 THEN '混合题型'
        WHEN 1 THEN '单选题'
        WHEN 2 THEN '多选题'
        WHEN 3 THEN '填空题'
        WHEN 4 THEN '简答题'
        WHEN 5 THEN '评分题'
        ELSE '未知'
    END as question_type_name,
    s.question_type,
    s.total_count,
    s.current_count,
    s.start_time,
    s.end_time,
    CASE s.scoring_status
        WHEN 0 THEN '未评分'
        WHEN 1 THEN '部分评分'
        WHEN 2 THEN '已完成评分'
        ELSE '未知'
    END as scoring_status_name,
    s.scoring_status,
    COUNT(ar.id) as total_records,
    COUNT(CASE WHEN ar.question_type IN (4, 5) THEN 1 END) as subjective_records,
    COUNT(sr.id) as scored_records,
    COUNT(CASE WHEN ar.question_type IN (4, 5) THEN 1 END) - COUNT(sr.id) as pending_records,
    s.final_score
FROM answer_session s
JOIN sys_user u ON s.user_id = u.id
LEFT JOIN answer_record ar ON s.id = ar.session_id
LEFT JOIN scoring_record sr ON ar.id = sr.answer_record_id
WHERE s.status = 2  -- 已完成的会话
GROUP BY s.id, s.session_code, u.username, u.real_name, s.question_type, s.total_count, s.current_count, s.start_time, s.end_time, s.scoring_status, s.final_score
HAVING subjective_records > 0  -- 只显示有主观题的会话
ORDER BY s.end_time DESC;

-- =====================================
-- 创建存储过程
-- =====================================

-- 自动计算会话总分的存储过程
DELIMITER //
CREATE PROCEDURE UpdateSessionScore(IN session_id_param BIGINT)
BEGIN
    DECLARE auto_total INT DEFAULT 0;
    DECLARE manual_total INT DEFAULT 0;
    DECLARE final_total INT DEFAULT 0;
    DECLARE subjective_count INT DEFAULT 0;
    DECLARE scored_count INT DEFAULT 0;
    DECLARE new_scoring_status INT DEFAULT 0;
    
    -- 计算自动评分总分
    SELECT IFNULL(SUM(auto_score), 0) INTO auto_total
    FROM answer_record
    WHERE session_id = session_id_param;
    
    -- 计算人工评分总分
    SELECT IFNULL(SUM(manual_score), 0) INTO manual_total
    FROM answer_record
    WHERE session_id = session_id_param AND manual_score IS NOT NULL;
    
    -- 计算最终总分
    SELECT IFNULL(SUM(final_score), 0) INTO final_total
    FROM answer_record
    WHERE session_id = session_id_param;
    
    -- 计算主观题数量和已评分数量
    SELECT 
        COUNT(CASE WHEN question_type IN (4, 5) THEN 1 END),
        COUNT(CASE WHEN question_type IN (4, 5) AND manual_score IS NOT NULL THEN 1 END)
    INTO subjective_count, scored_count
    FROM answer_record
    WHERE session_id = session_id_param;
    
    -- 确定评分状态
    IF subjective_count = 0 THEN
        SET new_scoring_status = 2; -- 无主观题，自动完成评分
    ELSEIF scored_count = 0 THEN
        SET new_scoring_status = 0; -- 未评分
    ELSEIF scored_count = subjective_count THEN
        SET new_scoring_status = 2; -- 已完成评分
    ELSE
        SET new_scoring_status = 1; -- 部分评分
    END IF;
    
    -- 更新会话记录
    UPDATE answer_session 
    SET auto_score = auto_total,
        manual_score = manual_total,
        final_score = final_total,
        current_score = final_total,
        scoring_status = new_scoring_status
    WHERE id = session_id_param;
    
END//
DELIMITER ;

-- =====================================
-- 完成初始化
-- =====================================

-- 显示初始化结果
SELECT '数据库初始化完成！' as message;
SELECT '已创建表:' as info;
SELECT TABLE_NAME as '表名', TABLE_COMMENT as '说明', TABLE_ROWS as '数据行数'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('sys_user', 'question_bank', 'answer_session', 'answer_record', 'scoring_record', 'questionnaire_response')
ORDER BY TABLE_NAME;

-- 显示题目统计
SELECT 
    '题库初始化完成' as status,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN type = 1 THEN 1 END) as single_choice,
    COUNT(CASE WHEN type = 2 THEN 1 END) as multiple_choice,
    COUNT(CASE WHEN type = 3 THEN 1 END) as fill_blank,
    COUNT(CASE WHEN type = 4 THEN 1 END) as essay,
    COUNT(CASE WHEN type = 5 THEN 1 END) as rating
FROM question_bank 
WHERE deleted = 0;

-- 显示视图列表
SELECT '已创建视图:' as info;
SELECT TABLE_NAME as '视图名', TABLE_COMMENT as '说明'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_TYPE = 'VIEW'
ORDER BY TABLE_NAME;
-- 为question_bank表添加答案解析字段
-- 执行时间：2024-12-27

ALTER TABLE question_bank 
ADD COLUMN explanation TEXT COMMENT '答案解析' 
AFTER correct_answer;
ALTER TABLE answer_session ADD COLUMN question_types VARCHAR(255) COMMENT '选择的题型列表，JSON格式';
UPDATE answer_session SET question_types = CONCAT('[', question_type, ']') WHERE question_types IS NULL;
ALTER TABLE answer_session
ADD COLUMN create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' AFTER scoring_status,
ADD COLUMN update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER create_time,
ADD COLUMN is_deleted INT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除' AFTER update_time,
ADD INDEX idx_create_time (create_time),
ADD INDEX idx_update_time (update_time),
ADD INDEX idx_is_deleted (is_deleted);