package com.gujian.questionnaire.utils;

import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.entity.UserRole;
import com.gujian.questionnaire.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 用户上下文工具类
 * 
 * 功能：
 * 1. 从Spring Security上下文获取当前用户信息
 * 2. 从Redis缓存中组装完整的用户对象
 * 3. 提供便捷的用户信息获取方法
 * 4. 统一异常处理和日志记录
 * 
 * 优势：
 * - 避免直接使用@AuthenticationPrincipal注解
 * - 灵活的用户信息获取方式
 * - 基于Redis的高性能缓存获取
 * - 统一的错误处理机制
 */
@Slf4j
@Component
public class UserContextUtils {

    @Autowired
    private AuthService authService;

    /**
     * 获取当前登录的用户名
     * @return 用户名，未登录返回null
     */
    public static String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                
                // 如果Principal是User对象（新的JWT过滤器）
                if (authentication.getPrincipal() instanceof User) {
                    return ((User) authentication.getPrincipal()).getUsername();
                }
                
                // 如果Principal是String（旧的JWT过滤器）
                if (authentication.getPrincipal() instanceof String) {
                    return (String) authentication.getPrincipal();
                }
                
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("获取当前用户名失败: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 获取当前用户的完整信息（从Redis组装）
     * @return User对象，获取失败返回null
     */
    public User getCurrentUser() {
        try {
            String username = getCurrentUsername();
            if (username == null) {
                log.debug("未找到当前登录用户");
                return null;
            }

            return assembleUserFromRedis(username);
        } catch (Exception e) {
            log.error("获取当前用户信息失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 获取当前用户ID
     * @return 用户ID，获取失败返回null
     */
    public Long getCurrentUserId() {
        try {
            User user = getCurrentUser();
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            log.error("获取当前用户ID失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 获取当前用户角色
     * @return 用户角色，获取失败返回null
     */
    public UserRole getCurrentUserRole() {
        try {
            User user = getCurrentUser();
            return user != null ? user.getRole() : null;
        } catch (Exception e) {
            log.error("获取当前用户角色失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 要求必须有当前用户（用于必须登录的场景）
     * @return User对象
     * @throws RuntimeException 如果用户未登录
     */
    public User requireCurrentUser() {
        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录或会话已过期");
        }
        return user;
    }

    /**
     * 要求必须有当前用户ID
     * @return 用户ID
     * @throws RuntimeException 如果用户未登录
     */
    public Long requireCurrentUserId() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("用户未登录或会话已过期");
        }
        return userId;
    }

    /**
     * 检查当前用户是否为管理员
     * @return true如果是管理员，false如果不是或未登录
     */
    public boolean isCurrentUserAdmin() {
        try {
            UserRole role = getCurrentUserRole();
            return role != null && role == UserRole.ADMIN;
        } catch (Exception e) {
            log.warn("检查管理员权限失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查当前用户是否有指定角色
     * @param requiredRole 需要的角色
     * @return true如果有权限，false如果没有权限或未登录
     */
    public boolean hasRole(UserRole requiredRole) {
        try {
            UserRole currentRole = getCurrentUserRole();
            return currentRole != null && currentRole == requiredRole;
        } catch (Exception e) {
            log.warn("检查用户角色失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查用户是否已登录
     * @return true如果已登录，false如果未登录
     */
    public boolean isUserLoggedIn() {
        return getCurrentUsername() != null;
    }

    /**
     * 从Redis中组装用户对象
     * @param username 用户名
     * @return User对象，组装失败返回null
     */
    private User assembleUserFromRedis(String username) {
        try {
            // 1. 从Redis会话信息中获取用户ID
            Map<Object, Object> sessionInfo = authService.getSessionInfo(username);
            if (sessionInfo == null || sessionInfo.isEmpty()) {
                log.warn("Redis中未找到用户会话信息: {}", username);
                return null;
            }

            Object userIdObj = sessionInfo.get("userId");
            if (userIdObj == null) {
                log.warn("会话信息中缺少userId: {}", username);
                return null;
            }

            Long userId = Long.valueOf(userIdObj.toString());

            // 2. 从Redis用户信息缓存中获取完整信息
            Map<Object, Object> userInfo = authService.getUserInfo(userId);
            if (userInfo == null || userInfo.isEmpty()) {
                log.warn("Redis中未找到用户信息: userId={}", userId);
                return null;
            }

            // 3. 构建User对象
            User user = new User();
            user.setId(userId);
            user.setUsername(getStringValue(userInfo, "username"));
            user.setEmail(getStringValue(userInfo, "email"));
            user.setRealName(getStringValue(userInfo, "realName"));
            
            // 解析角色
            String roleStr = getStringValue(userInfo, "role");
            if (roleStr != null) {
                try {
                    user.setRole(UserRole.valueOf(roleStr));
                } catch (IllegalArgumentException e) {
                    log.warn("无效的用户角色: {}", roleStr);
                    user.setRole(UserRole.USER); // 默认角色
                }
            }

            // 解析enabled状态
            Object enabledObj = userInfo.get("enabled");
            if (enabledObj != null) {
                user.setEnabled(Boolean.valueOf(enabledObj.toString()));
            } else {
                user.setEnabled(true); // 默认启用
            }

            log.debug("成功从Redis组装用户信息: username={}, userId={}", username, userId);
            return user;

        } catch (Exception e) {
            log.error("从Redis组装用户信息失败: username={}, error={}", username, e.getMessage());
            return null;
        }
    }

    /**
     * 安全地从Map中获取String值
     */
    private String getStringValue(Map<Object, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * 获取用户详细信息（用于调试）
     * @return 包含用户详细信息的字符串
     */
    public String getCurrentUserDetails() {
        try {
            User user = getCurrentUser();
            if (user == null) {
                return "用户未登录";
            }
            
            return String.format("User[id=%d, username=%s, role=%s, email=%s, enabled=%s]",
                user.getId(), 
                user.getUsername(), 
                user.getRole(), 
                user.getEmail(), 
                user.getEnabled());
        } catch (Exception e) {
            return "获取用户详细信息失败: " + e.getMessage();
        }
    }
} 