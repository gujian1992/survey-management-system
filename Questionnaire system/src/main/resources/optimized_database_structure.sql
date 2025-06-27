-- 数据库表结构优化
-- 移除冗余字段，简化结构，不使用外键约束
USE questionnaire_db;

-- ========================================
-- 表结构分析和优化建议
-- ========================================

/*
当前存在的问题:
1. 字段重复: questionnaire_response表和原answer表都有ip_address、user_agent字段
2. 冗余字段: 一些字段实际业务中用不到或可以通过查询获得
3. 外键约束: 影响性能且维护复杂
4. 表结构不统一: 有些表用deleted，有些用逻辑删除

优化策略:
1. 移除所有外键约束
2. 统一逻辑删除字段
3. 合并重复功能字段
4. 移除不必要的冗余字段
*/

-- ========================================
-- 1. 优化问卷表 (questionnaire)
-- ========================================
/*
保留字段分析:
✅ id - 主键，必需
✅ title - 问卷标题，必需
✅ description - 问卷描述，必需
✅ status - 状态，必需
✅ start_time - 开始时间，业务需要
✅ end_time - 结束时间，业务需要
✅ publish_time - 发布时间，业务需要
✅ creator_id - 创建者ID，必需
✅ creator_name - 创建者名称，避免关联查询
✅ create_time - 创建时间，审计需要
✅ update_time - 更新时间，审计需要
✅ deleted - 逻辑删除，必需

可以移除的字段:
❌ total_count - 可通过统计获得，冗余
❌ view_count - 如果不需要浏览统计可以移除
❌ settings - 如果没有复杂设置需求可以移除
*/

-- 优化问卷表
DROP TABLE IF EXISTS questionnaire_optimized;
CREATE TABLE questionnaire_optimized (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    title VARCHAR(200) NOT NULL COMMENT '问卷标题',
    description TEXT COMMENT '问卷描述',
    status INT NOT NULL DEFAULT 0 COMMENT '状态：0-草稿 1-发布 2-结束',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    publish_time DATETIME COMMENT '发布时间',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    creator_name VARCHAR(50) COMMENT '创建者姓名',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷表-优化版';

-- ========================================
-- 2. 优化问题表 (question)
-- ========================================
/*
保留字段分析:
✅ id - 主键，必需
✅ questionnaire_id - 关联问卷，必需
✅ title - 问题标题，必需
✅ type - 问题类型，必需
✅ options - 选项内容，必需
✅ required - 是否必填，必需
✅ sort_order - 排序，必需
✅ create_time - 创建时间，审计需要
✅ update_time - 更新时间，审计需要
✅ deleted - 逻辑删除，必需

可以移除的字段:
❌ settings - 如果没有复杂设置需求可以移除
*/

DROP TABLE IF EXISTS question_optimized;
CREATE TABLE question_optimized (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    title VARCHAR(500) NOT NULL COMMENT '问题标题',
    type INT NOT NULL COMMENT '问题类型：1-单选 2-多选 3-填空 4-下拉 5-评分 6-矩阵',
    options TEXT COMMENT '选项（JSON数组）',
    required BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否必填',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    
    INDEX idx_questionnaire_id (questionnaire_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表-优化版';

-- ========================================
-- 3. 优化问卷记录表 (questionnaire_response)
-- ========================================
/*
保留字段分析:
✅ id - 主键，必需
✅ questionnaire_id - 关联问卷，必需
✅ user_id - 填写用户，必需
✅ response_id - 响应标识，必需
✅ submit_time - 提交时间，必需
✅ start_time - 开始时间，统计需要
✅ duration_seconds - 答题时长，统计需要
✅ status - 状态，必需
✅ total_score - 总分，评分需要
✅ sub_scores - 分项得分，评分需要
✅ grade - 等级，评分需要
✅ is_passed - 是否通过，评分需要
✅ scorer_id - 评分者ID，必需
✅ scorer_name - 评分者姓名，避免关联查询
✅ score_time - 评分时间，必需
✅ feedback - 反馈，必需
✅ create_time - 创建时间，审计需要
✅ update_time - 更新时间，审计需要
✅ deleted - 逻辑删除，必需

可以移除的字段:
❌ ip_address - 如果不需要IP追踪可以移除
❌ user_agent - 如果不需要设备追踪可以移除
*/

DROP TABLE IF EXISTS questionnaire_response_optimized;
CREATE TABLE questionnaire_response_optimized (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    user_id BIGINT COMMENT '填写用户ID',
    response_id VARCHAR(50) UNIQUE NOT NULL COMMENT '响应唯一标识',
    
    -- 提交信息
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    start_time DATETIME COMMENT '开始答题时间',
    duration_seconds INT COMMENT '答题用时(秒)',
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'submitted' COMMENT '状态: submitted-已提交, reviewing-审核中, scored-已评分, completed-已完成, rejected-已拒绝',
    
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
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷填写记录表-优化版';

-- ========================================
-- 4. 优化答案表 (answer)
-- ========================================
/*
保留字段分析:
✅ id - 主键，必需
✅ questionnaire_id - 关联问卷，必需
✅ question_id - 关联问题，必需
✅ response_id - 响应标识，关联记录表必需
✅ answer_content - 答案内容，必需
✅ create_time - 创建时间，审计需要
✅ deleted - 逻辑删除，必需
✅ response_record_id - 关联记录表ID，新增字段

可以移除的字段:
❌ user_ip - 记录表已有，重复
❌ user_agent - 记录表已有，重复
*/

DROP TABLE IF EXISTS answer_optimized;
CREATE TABLE answer_optimized (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    question_id BIGINT NOT NULL COMMENT '问题ID',
    response_id VARCHAR(50) NOT NULL COMMENT '响应ID（同一次填写的唯一标识）',
    response_record_id BIGINT NOT NULL COMMENT '关联记录表ID',
    answer_content TEXT COMMENT '答案内容（JSON）',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    
    INDEX idx_questionnaire_id (questionnaire_id),
    INDEX idx_question_id (question_id),
    INDEX idx_response_id (response_id),
    INDEX idx_response_record (response_record_id),
    INDEX idx_create_time (create_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答案表-优化版';

-- ========================================
-- 5. 简化评分配置表 (scoring_config)
-- ========================================
/*
保留字段分析:
✅ id - 主键，必需
✅ questionnaire_id - 关联问卷，必需
✅ max_score - 最高分，必需
✅ pass_score - 及格分，必需
✅ grade_rules - 等级规则，必需
✅ is_enabled - 是否启用，必需
✅ create_time - 创建时间，审计需要
✅ update_time - 更新时间，审计需要
✅ deleted - 逻辑删除，必需

可以简化的字段:
📝 scoring_criteria - 简化为固定的三项评分标准
*/

DROP TABLE IF EXISTS scoring_config_optimized;
CREATE TABLE scoring_config_optimized (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    max_score INT DEFAULT 100 COMMENT '最高分',
    pass_score INT DEFAULT 60 COMMENT '及格分',
    grade_rules JSON COMMENT '等级规则配置',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT DEFAULT 0 COMMENT '逻辑删除',
    
    INDEX idx_questionnaire (questionnaire_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分配置表-优化版';

-- ========================================
-- 6. 用户表简化 (sys_user)
-- ========================================
/*
保持现有结构，但移除不必要索引
*/

-- ========================================
-- 数据迁移脚本（可选执行）
-- ========================================

-- 从原表迁移数据到优化表
-- INSERT INTO questionnaire_optimized SELECT id, title, description, status, start_time, end_time, publish_time, creator_id, creator_name, create_time, update_time, deleted FROM questionnaire;
-- INSERT INTO question_optimized SELECT id, questionnaire_id, title, type, options, required, sort_order, create_time, update_time, deleted FROM question;
-- INSERT INTO answer_optimized SELECT id, questionnaire_id, question_id, response_id, 0, answer_content, create_time, deleted FROM answer;

-- ========================================
-- 优化建议总结
-- ========================================
/*
移除的字段:
1. questionnaire表: total_count, view_count, settings
2. question表: settings  
3. questionnaire_response表: ip_address, user_agent (可选)
4. answer表: user_ip, user_agent
5. 所有外键约束

保留的核心字段:
1. 业务必需字段
2. 审计字段 (create_time, update_time, deleted)
3. 性能索引字段
4. 避免联表查询的冗余字段 (creator_name, scorer_name)

优化效果:
1. 减少存储空间占用
2. 提高查询性能
3. 简化维护复杂度
4. 避免外键约束带来的性能影响
*/ 