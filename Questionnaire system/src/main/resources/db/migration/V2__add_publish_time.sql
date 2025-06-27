-- 添加发布时间字段
ALTER TABLE questionnaire ADD COLUMN publish_time DATETIME COMMENT '发布时间' AFTER end_time; 