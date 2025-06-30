-- 修复answer_session表结构
ALTER TABLE answer_session
ADD COLUMN create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' AFTER scoring_status,
ADD COLUMN update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER create_time,
ADD COLUMN is_deleted INT DEFAULT 0 COMMENT '逻辑删除：0-未删除 1-已删除' AFTER update_time,
ADD INDEX idx_create_time (create_time),
ADD INDEX idx_update_time (update_time),
ADD INDEX idx_is_deleted (is_deleted); 