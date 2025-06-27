-- 简化的优化结果检查
USE questionnaire_db;

-- 检查当前表结构统计
SELECT '=== 当前表结构统计 ===' as info;
SELECT 
    c.TABLE_NAME,
    COUNT(*) as column_count,
    ROUND(((t.DATA_LENGTH + t.INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB'
FROM information_schema.COLUMNS c
LEFT JOIN information_schema.TABLES t ON c.TABLE_NAME = t.TABLE_NAME AND c.TABLE_SCHEMA = t.TABLE_SCHEMA
WHERE c.TABLE_SCHEMA = 'questionnaire_db'
GROUP BY c.TABLE_NAME, t.DATA_LENGTH, t.INDEX_LENGTH
ORDER BY c.TABLE_NAME;

-- 检查questionnaire表字段
SELECT '=== questionnaire表当前字段 ===' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'questionnaire' 
ORDER BY ORDINAL_POSITION;

-- 检查answer表字段
SELECT '=== answer表当前字段 ===' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'answer' 
ORDER BY ORDINAL_POSITION;

-- 检查索引统计
SELECT '=== 索引统计信息 ===' as info;
SELECT 
    TABLE_NAME,
    COUNT(DISTINCT INDEX_NAME) as index_count,
    GROUP_CONCAT(DISTINCT INDEX_NAME) as index_names
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'questionnaire_db'
AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;

-- 最终总结
SELECT '=== 最终优化总结 ===' as info;
SELECT 
    '数据库优化检查完成' as status,
    NOW() as check_time,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' AND TABLE_SCHEMA = 'questionnaire_db') as remaining_foreign_keys,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'questionnaire_db' AND INDEX_NAME = 'idx_deleted') as deleted_indexes_added; 