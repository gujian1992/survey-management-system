package com.gujian.questionnaire.service;

import com.gujian.questionnaire.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 认证服务类 - Redis会话管理
 * 
 * 职责：
 * 1. Redis会话的创建、验证、刷新、销毁
 * 2. 用户信息缓存管理
 * 3. Token黑名单管理
 * 
 * 注意：JWT的生成和验证由JwtTokenProvider负责
 *
 * @author gujian
 * @since 2024-01-01
 */
@Slf4j
@Service
public class AuthService {

    @Autowired
    private RedisService redisService;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    // Redis Key前缀
    private static final String USER_SESSION_PREFIX = "user:session:";
    private static final String USER_INFO_PREFIX = "user:info:";
    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";

    /**
     * 创建Redis会话
     * @param token JWT Token
     * @param user 用户信息
     */
    public void createSession(String token, User user) {
        try {
            // 在Redis中存储用户会话信息
            String sessionKey = USER_SESSION_PREFIX + user.getUsername();
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("token", token);
            sessionData.put("userId", user.getId());
            sessionData.put("username", user.getUsername());
            sessionData.put("role", user.getRole().name());
            sessionData.put("loginTime", System.currentTimeMillis());
            sessionData.put("lastAccessTime", System.currentTimeMillis());
            
            // 会话过期时间比JWT稍长一些
            long sessionExpiration = jwtExpiration / 1000 + 300; // 多5分钟
            redisService.hmset(sessionKey, sessionData, sessionExpiration);
            
            // 存储用户详细信息
            String userInfoKey = USER_INFO_PREFIX + user.getId();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole().name());
            userInfo.put("realName", user.getRealName());
            userInfo.put("enabled", user.getEnabled());
            
            redisService.hmset(userInfoKey, userInfo, sessionExpiration);
            
            log.info("Redis session created for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Failed to create session for user: {}, error: {}", user.getUsername(), e.getMessage());
            throw new RuntimeException("创建会话失败");
        }
    }

    /**
     * 验证Redis会话是否存在
     * @param username 用户名
     * @return 会话是否有效
     */
    public boolean isSessionValid(String username) {
        try {
            String sessionKey = USER_SESSION_PREFIX + username;
            return redisService.hasKey(sessionKey);
        } catch (Exception e) {
            log.error("Session validation failed for user: {}, error: {}", username, e.getMessage());
            return false;
        }
    }

    /**
     * 检查Token是否在黑名单中
     * @param token JWT Token
     * @return 是否在黑名单
     */
    public boolean isTokenBlacklisted(String token) {
        String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
        return redisService.hasKey(blacklistKey);
    }

    /**
     * 用户登出 - 销毁会话
     * @param token JWT Token
     * @param username 用户名
     * @param userId 用户ID
     */
    public void logout(String token, String username, Long userId) {
        try {
            // 删除Redis中的会话信息
            String sessionKey = USER_SESSION_PREFIX + username;
            String userInfoKey = USER_INFO_PREFIX + userId;
            
            redisService.del(sessionKey);
            redisService.del(userInfoKey);
            
            // 将Token加入黑名单
            addTokenToBlacklist(token);
            
            log.info("User logged out successfully: {}", username);
        } catch (Exception e) {
            log.error("Logout failed for user: {}, error: {}", username, e.getMessage());
        }
    }

    /**
     * 刷新会话 - 更新最后访问时间
     * @param username 用户名
     */
    public void refreshSession(String username) {
        try {
            String sessionKey = USER_SESSION_PREFIX + username;
            
            if (redisService.hasKey(sessionKey)) {
                // 更新最后访问时间
                redisService.hset(sessionKey, "lastAccessTime", System.currentTimeMillis());
                
                // 延长会话过期时间
                long sessionExpiration = jwtExpiration / 1000 + 300;
                redisService.expire(sessionKey, sessionExpiration);
                
                log.debug("Session refreshed for user: {}", username);
            }
        } catch (Exception e) {
            log.error("Session refresh failed for user: {}, error: {}", username, e.getMessage());
        }
    }

    /**
     * 从Redis获取用户信息
     * @param userId 用户ID
     * @return 用户信息Map
     */
    public Map<Object, Object> getUserInfo(Long userId) {
        String userInfoKey = USER_INFO_PREFIX + userId;
        return redisService.hmget(userInfoKey);
    }

    /**
     * 从Redis获取会话信息
     * @param username 用户名
     * @return 会话信息Map
     */
    public Map<Object, Object> getSessionInfo(String username) {
        String sessionKey = USER_SESSION_PREFIX + username;
        return redisService.hmget(sessionKey);
    }

    /**
     * 将Token加入黑名单
     * @param token JWT Token
     */
    private void addTokenToBlacklist(String token) {
        try {
            // 设置黑名单过期时间为JWT剩余有效期
            long ttl = jwtExpiration / 1000;
            String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
            redisService.set(blacklistKey, "blacklisted", ttl);
        } catch (Exception e) {
            log.error("Failed to add token to blacklist: {}", e.getMessage());
        }
    }

    /**
     * 强制用户下线
     * @param username 用户名
     */
    public void forceLogout(String username) {
        try {
            String sessionKey = USER_SESSION_PREFIX + username;
            
            // 获取用户Token并加入黑名单
            Object tokenObj = redisService.hget(sessionKey, "token");
            if (tokenObj != null) {
                String token = tokenObj.toString();
                addTokenToBlacklist(token);
            }
            
            // 删除会话信息
            redisService.del(sessionKey);
            
            log.info("User forced logout: {}", username);
        } catch (Exception e) {
            log.error("Force logout failed for user: {}, error: {}", username, e.getMessage());
        }
    }

    /**
     * 获取在线用户数量
     * @return 在线用户数
     */
    public long getOnlineUserCount() {
        try {
            // 通过Redis key模式匹配统计会话数量
            String pattern = USER_SESSION_PREFIX + "*";
            // 注意：在生产环境中，建议使用Redis的scan命令代替keys命令以避免阻塞
            return redisService.keys(pattern).size();
        } catch (Exception e) {
            log.error("Failed to get online user count: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 获取所有在线用户信息
     * @return 在线用户列表
     */
    public List<Map<String, Object>> getOnlineUsers() {
        try {
            String pattern = USER_SESSION_PREFIX + "*";
            Set<String> sessionKeys = redisService.keys(pattern);
            List<Map<String, Object>> onlineUsers = new ArrayList<>();
            
            for (String sessionKey : sessionKeys) {
                Map<Object, Object> sessionData = redisService.hmget(sessionKey);
                if (sessionData != null && !sessionData.isEmpty()) {
                    Map<String, Object> userSession = new HashMap<>();
                    userSession.put("username", sessionData.get("username"));
                    userSession.put("role", sessionData.get("role"));
                    userSession.put("loginTime", sessionData.get("loginTime"));
                    userSession.put("lastAccessTime", sessionData.get("lastAccessTime"));
                    onlineUsers.add(userSession);
                }
            }
            
            return onlineUsers;
        } catch (Exception e) {
            log.error("Failed to get online users: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * 清理过期会话
     */
    @Scheduled(fixedRate = 3600000) // 每小时执行一次
    public void cleanExpiredSessions() {
        log.info("Starting expired sessions cleanup...");
        try {
            int cleanedCount = 0;
            
            // 清理过期的会话key
            Set<String> sessionKeys = redisService.keys(USER_SESSION_PREFIX + "*");
            for (String key : sessionKeys) {
                if (!redisService.hasKey(key)) {
                    cleanedCount++;
                }
            }
            
            // 清理过期的用户信息key  
            Set<String> userInfoKeys = redisService.keys(USER_INFO_PREFIX + "*");
            for (String key : userInfoKeys) {
                if (!redisService.hasKey(key)) {
                    cleanedCount++;
                }
            }
            
            // 清理过期的黑名单Token
            Set<String> blacklistKeys = redisService.keys(TOKEN_BLACKLIST_PREFIX + "*");
            for (String key : blacklistKeys) {
                if (!redisService.hasKey(key)) {
                    cleanedCount++;
                }
            }
            
            log.info("Expired sessions cleanup completed. Checked {} keys", 
                    sessionKeys.size() + userInfoKeys.size() + blacklistKeys.size());
        } catch (Exception e) {
            log.error("Failed to clean expired sessions: {}", e.getMessage());
        }
    }
}
 