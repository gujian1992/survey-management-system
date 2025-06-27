-- 简单的数据库清理脚本
-- 避免使用IF EXISTS语法，直接执行（忽略错误）
USE questionnaire_db;

-- ========================================
-- 第一步：查看当前外键约束（先执行这个查看）
-- ========================================
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONCAT('ALTER TABLE ', TABLE_NAME, ' DROP FOREIGN KEY ', CONSTRAINT_NAME, ';') AS drop_sql
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- ========================================
-- 第二步：手动复制上面查询结果中的drop_sql并执行
-- 或者直接尝试删除常见的外键约束名称
-- ========================================

-- 禁用外键检查
SET foreign_key_checks = 0;

-- 尝试删除可能存在的外键约束（忽略错误）
-- questionnaire_response表
ALTER TABLE questionnaire_response DROP FOREIGN KEY questionnaire_response_ibfk_1;
ALTER TABLE questionnaire_response DROP FOREIGN KEY questionnaire_response_ibfk_2;
ALTER TABLE questionnaire_response DROP FOREIGN KEY questionnaire_response_ibfk_3;

-- scoring_config表
ALTER TABLE scoring_config DROP FOREIGN KEY scoring_config_ibfk_1;

-- question表
ALTER TABLE question DROP FOREIGN KEY question_ibfk_1;

-- answer表
ALTER TABLE answer DROP FOREIGN KEY answer_ibfk_1;
ALTER TABLE answer DROP FOREIGN KEY answer_ibfk_2;

-- 重新启用外键检查
SET foreign_key_checks = 1;

-- ========================================
-- 第三步：移除不必要的字段
-- ========================================

-- 查看questionnaire表字段
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'questionnaire' 
AND COLUMN_NAME IN ('total_count', 'view_count', 'settings');

-- 删除questionnaire表冗余字段
ALTER TABLE questionnaire DROP COLUMN total_count;
ALTER TABLE questionnaire DROP COLUMN view_count;
-- ALTER TABLE questionnaire DROP COLUMN settings; -- 如果需要删除

-- 查看answer表字段
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'answer' 
AND COLUMN_NAME IN ('user_ip', 'user_agent');

-- 删除answer表冗余字段
ALTER TABLE answer DROP COLUMN user_ip;
ALTER TABLE answer DROP COLUMN user_agent;

-- ========================================
-- 第四步：添加必要的索引
-- ========================================

-- 查看现有索引
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND INDEX_NAME LIKE '%deleted%';

-- 添加deleted字段索引（如果不存在）
ALTER TABLE questionnaire ADD INDEX idx_deleted (deleted);
ALTER TABLE question ADD INDEX idx_deleted (deleted);
ALTER TABLE answer ADD INDEX idx_deleted (deleted);
ALTER TABLE questionnaire_response ADD INDEX idx_deleted (deleted);
ALTER TABLE scoring_config ADD INDEX idx_deleted (deleted);

-- ========================================
-- 第五步：验证结果
-- ========================================

-- 查看优化后的表结构
SHOW CREATE TABLE questionnaire;
SHOW CREATE TABLE question;
SHOW CREATE TABLE answer;
SHOW CREATE TABLE questionnaire_response;
SHOW CREATE TABLE scoring_config;

-- 查看剩余的外键约束
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- 查看表大小
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'questionnaire_db'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC; 