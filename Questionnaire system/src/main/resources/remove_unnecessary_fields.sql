-- 移除数据库中不必要的字段和外键约束
-- 执行前请备份数据库！
USE questionnaire_db;

-- ========================================
-- 1. 移除所有外键约束
-- ========================================

-- 获取所有外键约束名称的查询（先执行此查询，手动删除外键）
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- 移除外键约束（MySQL不支持IF EXISTS，需要先查询再删除）
SET foreign_key_checks = 0;

-- 使用存储过程安全删除外键约束
DELIMITER $$

DROP PROCEDURE IF EXISTS DropForeignKeysIfExists$$

CREATE PROCEDURE DropForeignKeysIfExists()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE constraint_name_var VARCHAR(128);
    DECLARE table_name_var VARCHAR(128);
    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME, CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
        AND TABLE_SCHEMA = DATABASE();
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO table_name_var, constraint_name_var;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('ALTER TABLE ', table_name_var, ' DROP FOREIGN KEY ', constraint_name_var);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    CLOSE cur;
END$$

DELIMITER ;

-- 执行存储过程删除所有外键
CALL DropForeignKeysIfExists();

-- 删除存储过程
DROP PROCEDURE DropForeignKeysIfExists;

SET foreign_key_checks = 1;

-- ========================================
-- 2. 移除questionnaire表的冗余字段
-- ========================================

-- 移除统计字段（可通过查询获得）
-- 注意：MySQL的DROP COLUMN也不支持IF EXISTS，需要先检查字段是否存在

-- 安全删除字段的存储过程
DELIMITER $$

DROP PROCEDURE IF EXISTS DropColumnIfExists$$

CREATE PROCEDURE DropColumnIfExists(
    IN table_name VARCHAR(128),
    IN column_name VARCHAR(128)
)
BEGIN
    DECLARE column_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_count
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = table_name 
    AND COLUMN_NAME = column_name;
    
    IF column_count > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP COLUMN ', column_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- 安全删除questionnaire表的字段
CALL DropColumnIfExists('questionnaire', 'total_count');
CALL DropColumnIfExists('questionnaire', 'view_count');
-- CALL DropColumnIfExists('questionnaire', 'settings'); -- 如果需要删除settings字段，取消注释

-- ========================================
-- 3. 移除question表的冗余字段
-- ========================================

-- 移除设置字段（如果不需要复杂设置）
-- CALL DropColumnIfExists('question', 'settings'); -- 如果需要删除settings字段，取消注释

-- ========================================
-- 4. 移除answer表的冗余字段
-- ========================================

-- 移除IP和用户代理字段（questionnaire_response表已有）
CALL DropColumnIfExists('answer', 'user_ip');
CALL DropColumnIfExists('answer', 'user_agent');

-- ========================================
-- 5. 移除questionnaire_response表的可选字段
-- ========================================

-- 如果不需要IP追踪，可以移除这些字段
-- CALL DropColumnIfExists('questionnaire_response', 'ip_address');
-- CALL DropColumnIfExists('questionnaire_response', 'user_agent');

-- ========================================
-- 6. 添加必要的索引
-- ========================================

-- 确保deleted字段有索引（用于逻辑删除查询优化）
-- 安全添加索引的存储过程
DELIMITER $$

DROP PROCEDURE IF EXISTS AddIndexIfNotExists$$

CREATE PROCEDURE AddIndexIfNotExists(
    IN table_name VARCHAR(128),
    IN index_name VARCHAR(128),
    IN column_name VARCHAR(128)
)
BEGIN
    DECLARE index_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_count
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = table_name 
    AND INDEX_NAME = index_name;
    
    IF index_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD INDEX ', index_name, ' (', column_name, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- 添加必要的索引
CALL AddIndexIfNotExists('questionnaire', 'idx_deleted', 'deleted');
CALL AddIndexIfNotExists('question', 'idx_deleted', 'deleted');
CALL AddIndexIfNotExists('answer', 'idx_deleted', 'deleted');
CALL AddIndexIfNotExists('questionnaire_response', 'idx_deleted', 'deleted');
CALL AddIndexIfNotExists('scoring_config', 'idx_deleted', 'deleted');

-- 清理存储过程
DROP PROCEDURE DropColumnIfExists;
DROP PROCEDURE AddIndexIfNotExists;

-- ========================================
-- 7. 验证优化结果
-- ========================================

-- 查看表结构
DESCRIBE questionnaire;
DESCRIBE question;
DESCRIBE answer;
DESCRIBE questionnaire_response;
DESCRIBE scoring_config;

-- 查看剩余的外键约束
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- 查看表大小统计
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Table Size (MB)',
    ROUND((DATA_LENGTH / 1024 / 1024), 2) AS 'Data Size (MB)',
    ROUND((INDEX_LENGTH / 1024 / 1024), 2) AS 'Index Size (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'questionnaire_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC; 