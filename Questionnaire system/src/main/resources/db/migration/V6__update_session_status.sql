-- 更新会话状态定义
ALTER TABLE answer_session MODIFY COLUMN status INT DEFAULT 0 COMMENT '会话状态：0-未开始 1-进行中 2-已完成 3-已超时 4-已放弃 5-异常结束';

-- 更新现有数据
UPDATE answer_session SET status = 0 WHERE status IS NULL;

-- 添加状态约束
ALTER TABLE answer_session ADD CONSTRAINT chk_status CHECK (status IN (0,1,2,3,4,5)); 