-- 安全地向answer表添加response_record_id列和索引
-- MySQL不支持ADD COLUMN IF NOT EXISTS，所以我们使用存储过程来实现

DELIMITER $$

DROP PROCEDURE IF EXISTS AddResponseRecordColumn$$

CREATE PROCEDURE AddResponseRecordColumn()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    DECLARE index_exists INT DEFAULT 0;
    
    -- 检查列是否存在
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'answer' 
    AND COLUMN_NAME = 'response_record_id';
    
    -- 如果列不存在，则添加列
    IF column_exists = 0 THEN
        ALTER TABLE answer ADD COLUMN response_record_id BIGINT COMMENT '关联记录表ID';
    END IF;
    
    -- 检查索引是否存在
    SELECT COUNT(*) INTO index_exists
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'answer' 
    AND INDEX_NAME = 'idx_response_record';
    
    -- 如果索引不存在，则添加索引
    IF index_exists = 0 THEN
        ALTER TABLE answer ADD INDEX idx_response_record (response_record_id);
    END IF;
    
END$$

DELIMITER ;

-- 执行存储过程
CALL AddResponseRecordColumn();

-- 删除存储过程
DROP PROCEDURE AddResponseRecordColumn;

-- 验证结果
SHOW COLUMNS FROM answer LIKE 'response_record_id';
SHOW INDEX FROM answer WHERE Key_name = 'idx_response_record'; 