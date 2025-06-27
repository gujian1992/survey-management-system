-- 为question_bank表添加答案解析字段
-- 执行时间：2024-12-27

ALTER TABLE question_bank 
ADD COLUMN explanation TEXT COMMENT '答案解析' 
AFTER correct_answer;

-- 验证字段是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'question_bank' 
  AND COLUMN_NAME = 'explanation'; 