-- 为answer_session表添加question_types字段
ALTER TABLE answer_session
ADD COLUMN question_types JSON COMMENT '选择的题型列表' AFTER question_type;

-- 更新现有记录
UPDATE answer_session SET question_types = CONCAT('[', question_type, ']') WHERE question_types IS NULL; 