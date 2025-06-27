package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.entity.UserRole;
import com.gujian.questionnaire.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户服务类
 */
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 根据用户名查找用户
     */
    public User findByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return userMapper.selectOne(queryWrapper);
    }

    /**
     * 验证用户登录
     */
    public User validateUser(String username, String password) {
        User user = findByUsername(username);
        if (user != null && user.getEnabled() && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    /**
     * 创建新用户
     */
    public User createUser(String username, String password, String realName, UserRole role, String email) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRealName(realName);
        user.setRole(role);
        user.setEmail(email);
        user.setCreateTime(LocalDateTime.now());
        user.setEnabled(true);
        
        userMapper.insert(user);
        return user;
    }

    /**
     * 获取所有用户
     */
    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }

    /**
     * 更新用户状态
     */
    public void updateUserStatus(Long userId, Boolean enabled) {
        User user = new User();
        user.setId(userId);
        user.setEnabled(enabled);
        userMapper.updateById(user);
    }

    /**
     * 删除用户
     */
    public void deleteUser(Long userId) {
        userMapper.deleteById(userId);
    }

    /**
     * 初始化默认管理员账户
     */
    public void initDefaultAdmin() {
        User existingAdmin = findByUsername("admin");
        if (existingAdmin == null) {
            createUser("admin", "admin123", "系统管理员", UserRole.ADMIN, "admin@example.com");
        }
    }
} 