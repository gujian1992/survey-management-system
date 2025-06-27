-- 创建数据库
CREATE DATABASE IF NOT EXISTS questionnaire_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE questionnaire_db;

-- 问卷表
CREATE TABLE IF NOT EXISTS questionnaire (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    title VARCHAR(200) NOT NULL COMMENT '问卷标题',
    description TEXT COMMENT '问卷描述',
    status INT NOT NULL DEFAULT 0 COMMENT '状态：0-草稿 1-发布 2-结束',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    publish_time DATETIME COMMENT '发布时间',
    total_count INT NOT NULL DEFAULT 0 COMMENT '总回复数',
    view_count INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    creator_id BIGINT COMMENT '创建者ID',
    creator_name VARCHAR(50) COMMENT '创建者姓名',
    settings TEXT COMMENT '问卷设置（JSON）',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷表';

-- 问题表
CREATE TABLE IF NOT EXISTS question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    title VARCHAR(500) NOT NULL COMMENT '问题标题',
    type INT NOT NULL COMMENT '问题类型：1-单选 2-多选 3-填空 4-下拉 5-评分 6-矩阵',
    options TEXT COMMENT '选项（JSON数组）',
    required BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否必填',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    settings TEXT COMMENT '问题设置（JSON）',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_questionnaire_id (questionnaire_id),
    INDEX idx_sort_order (sort_order),
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表';

-- 答案表
CREATE TABLE IF NOT EXISTS answer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
    question_id BIGINT NOT NULL COMMENT '问题ID',
    response_id VARCHAR(50) NOT NULL COMMENT '响应ID（同一次填写的唯一标识）',
    answer_content TEXT COMMENT '答案内容（JSON）',
    user_ip VARCHAR(50) COMMENT '用户IP',
    user_agent TEXT COMMENT '用户代理',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted INT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除',
    INDEX idx_questionnaire_id (questionnaire_id),
    INDEX idx_question_id (question_id),
    INDEX idx_response_id (response_id),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答案表';

-- 插入示例数据
INSERT INTO questionnaire (title, description, status, creator_id, creator_name) VALUES 
('用户满意度调查', '这是一个关于产品用户满意度的调查问卷，请认真填写。', 1, 1, '系统管理员'),
('员工工作反馈', '收集员工对工作环境和管理的反馈意见。', 0, 1, '系统管理员');

INSERT INTO question (questionnaire_id, title, type, options, required, sort_order) VALUES 
(1, '您对我们产品的总体满意度？', 1, '["非常满意", "满意", "一般", "不满意", "非常不满意"]', true, 1),
(1, '您最喜欢产品的哪些功能？（可多选）', 2, '["界面设计", "功能丰富", "操作简单", "响应速度", "客户服务"]', false, 2),
(1, '请提供改进建议：', 3, '[]', false, 3),
(2, '您的工作部门？', 4, '["技术部", "市场部", "销售部", "人事部", "财务部"]', true, 1),
(2, '您对工作环境的评分？', 5, '["1", "2", "3", "4", "5"]', true, 2); 