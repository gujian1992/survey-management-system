-- 添加 state_data 字段到 answer_session 表
-- 用于存储会话状态数据（JSON格式）

ALTER TABLE answer_session 
ADD COLUMN state_data JSON COMMENT '会话状态数据（JSON格式）' AFTER scoring_status; 