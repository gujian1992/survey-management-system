-- 简单版本：直接添加列和索引
-- 注意：如果列已存在会报错，请先确认列不存在

-- 添加response_record_id列
ALTER TABLE answer 
ADD COLUMN response_record_id BIGINT COMMENT '关联记录表ID';

-- 添加索引
ALTER TABLE answer 
ADD INDEX idx_response_record (response_record_id);

-- 验证结果
DESCRIBE answer;
SHOW INDEX FROM answer; 