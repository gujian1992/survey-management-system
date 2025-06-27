-- 添加普通用户的SQL脚本
-- 使用方法：mysql -u root -p your_database < add_user.sql

-- 添加普通用户
INSERT INTO sys_user (username, password, real_name, role, email, create_time, enabled)
VALUES (
    'zhangsan', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjziD9FCpBNcLK1XK7K7Dc7QmC', -- 密码: admin123
    '张三', 
    'USER', 
    'zhangsan@example.com', 
    NOW(), 
    TRUE
);

INSERT INTO sys_user (username, password, real_name, role, email, create_time, enabled)
VALUES (
    'lisi', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjziD9FCpBNcLK1XK7K7Dc7QmC', -- 密码: admin123
    '李四', 
    'USER', 
    'lisi@example.com', 
    NOW(), 
    TRUE
);

INSERT INTO sys_user (username, password, real_name, role, email, create_time, enabled)
VALUES (
    'wangwu', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjziD9FCpBNcLK1XK7K7Dc7QmC', -- 密码: admin123
    '王五', 
    'USER', 
    'wangwu@example.com', 
    NOW(), 
    TRUE
);

-- 查询新创建的用户（可选）
SELECT id, username, real_name, role, email, create_time, enabled 
FROM sys_user 
WHERE role = 'USER' 
ORDER BY create_time DESC; 