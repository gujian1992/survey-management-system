-- 数据库优化结果检查脚本
USE questionnaire_db;

-- ========================================
-- 1. 检查外键约束是否已移除
-- ========================================
SELECT '=== 检查外键约束 ===' as info;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 所有外键约束已成功移除'
        ELSE CONCAT('❌ 仍有 ', COUNT(*), ' 个外键约束未移除')
    END as foreign_key_status
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- 如果还有外键约束，显示详细信息
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    '需要手动删除' as action
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
AND TABLE_SCHEMA = 'questionnaire_db';

-- ========================================
-- 2. 检查字段是否已移除
-- ========================================
SELECT '=== 检查字段移除情况 ===' as info;

-- 检查questionnaire表的字段
SELECT 
    'questionnaire表字段检查' as table_name,
    CASE 
        WHEN SUM(CASE WHEN COLUMN_NAME = 'total_count' THEN 1 ELSE 0 END) = 0 THEN '✅ total_count已移除'
        ELSE '❌ total_count仍存在'
    END as total_count_status,
    CASE 
        WHEN SUM(CASE WHEN COLUMN_NAME = 'view_count' THEN 1 ELSE 0 END) = 0 THEN '✅ view_count已移除'
        ELSE '❌ view_count仍存在'
    END as view_count_status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'questionnaire' 
AND COLUMN_NAME IN ('total_count', 'view_count');

-- 检查answer表的字段
SELECT 
    'answer表字段检查' as table_name,
    CASE 
        WHEN SUM(CASE WHEN COLUMN_NAME = 'user_ip' THEN 1 ELSE 0 END) = 0 THEN '✅ user_ip已移除'
        ELSE '❌ user_ip仍存在'
    END as user_ip_status,
    CASE 
        WHEN SUM(CASE WHEN COLUMN_NAME = 'user_agent' THEN 1 ELSE 0 END) = 0 THEN '✅ user_agent已移除'
        ELSE '❌ user_agent仍存在'
    END as user_agent_status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'answer' 
AND COLUMN_NAME IN ('user_ip', 'user_agent');

-- ========================================
-- 3. 检查索引是否已添加
-- ========================================
SELECT '=== 检查索引添加情况 ===' as info;

SELECT 
    TABLE_NAME,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ deleted索引已存在'
        ELSE '❌ deleted索引不存在'
    END as index_status
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND INDEX_NAME = 'idx_deleted'
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;

-- ========================================
-- 4. 检查当前表结构
-- ========================================
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

-- ========================================
-- 5. 检查各表的详细字段信息
-- ========================================
SELECT '=== questionnaire表字段列表 ===' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'questionnaire' 
ORDER BY ORDINAL_POSITION;

SELECT '=== answer表字段列表 ===' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'questionnaire_db' 
AND TABLE_NAME = 'answer' 
ORDER BY ORDINAL_POSITION;

-- ========================================
-- 6. 检查索引使用情况
-- ========================================
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

-- ========================================
-- 7. 优化效果总结
-- ========================================
SELECT '=== 优化效果总结 ===' as info;

SELECT 
    '数据库优化检查完成' as status,
    NOW() as check_time,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' AND TABLE_SCHEMA = 'questionnaire_db') as remaining_foreign_keys,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'questionnaire_db' AND INDEX_NAME = 'idx_deleted') as deleted_indexes_added; 