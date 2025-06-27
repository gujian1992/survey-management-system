package com.gujian.questionnaire.controller;

import com.gujian.questionnaire.common.JwtTokenProvider;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.service.AuthService;
import com.gujian.questionnaire.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器 - 验证Redis+JWT集成
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private RedisService redisService;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * 测试Redis连接
     */
    @GetMapping("/redis")
    public Result<Map<String, Object>> testRedis() {
        try {
            // 测试基本的Redis操作
            redisService.set("test:key", "Hello Redis!", 60);
            Object valueObj = redisService.get("test:key");
            String value = valueObj != null ? valueObj.toString() : null;
            
            Map<String, Object> result = new HashMap<>();
            result.put("operation", "set/get");
            result.put("key", "test:key");
            result.put("value", value);
            result.put("success", "Hello Redis!".equals(value));
            
            return Result.success("Redis连接测试成功", result);
        } catch (Exception e) {
            return Result.error("Redis连接测试失败：" + e.getMessage());
        }
    }

    /**
     * 测试Redis Hash操作
     */
    @GetMapping("/redis-hash")
    public Result<Map<String, Object>> testRedisHash() {
        try {
            Map<String, Object> hashData = new HashMap<>();
            hashData.put("name", "测试用户");
            hashData.put("age", 25);
            hashData.put("role", "USER");
            
            redisService.hmset("test:hash", hashData, 60);
            Map<Object, Object> retrieved = redisService.hmget("test:hash");
            
            Map<String, Object> result = new HashMap<>();
            result.put("operation", "hmset/hmget");
            result.put("key", "test:hash");
            result.put("stored", hashData);
            result.put("retrieved", retrieved);
            result.put("success", retrieved != null && !retrieved.isEmpty());
            
            return Result.success("Redis Hash测试成功", result);
        } catch (Exception e) {
            return Result.error("Redis Hash测试失败：" + e.getMessage());
        }
    }

    /**
     * 测试JWT Token生成和验证
     */
    @GetMapping("/jwt")
    public Result<Map<String, Object>> testJwt() {
        try {
            // 创建测试用户
            com.gujian.questionnaire.entity.User testUser = new com.gujian.questionnaire.entity.User();
            testUser.setId(999L);
            testUser.setUsername("test_user");
            testUser.setRole(com.gujian.questionnaire.entity.UserRole.USER);
            testUser.setEmail("test@example.com");
            testUser.setRealName("测试用户");
            
            // 使用JwtTokenProvider生成Token
            String token = jwtTokenProvider.generateToken(testUser.getUsername(), testUser.getRole());
            
            // 验证Token
            boolean isValid = jwtTokenProvider.validateToken(token);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            com.gujian.questionnaire.entity.UserRole role = jwtTokenProvider.getRoleFromToken(token);
            
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("isValid", isValid);
            result.put("username", username);
            result.put("role", role);
            result.put("success", isValid && "test_user".equals(username));
            
            return Result.success("JWT测试成功", result);
        } catch (Exception e) {
            return Result.error("JWT测试失败：" + e.getMessage());
        }
    }

    /**
     * 测试完整的登录流程
     */
    @PostMapping("/login-flow")
    public Result<Map<String, Object>> testLoginFlow() {
        try {
            // 创建测试用户
            com.gujian.questionnaire.entity.User testUser = new com.gujian.questionnaire.entity.User();
            testUser.setId(999L);
            testUser.setUsername("test_flow_user");
            testUser.setRole(com.gujian.questionnaire.entity.UserRole.ADMIN);
            testUser.setEmail("testflow@example.com");
            testUser.setRealName("测试流程用户");
            testUser.setEnabled(true);
            
            // 1. 生成JWT Token
            String token = jwtTokenProvider.generateToken(testUser.getUsername(), testUser.getRole());
            
            // 2. 创建Redis会话
            authService.createSession(token, testUser);
            
            // 3. 验证会话
            boolean jwtValid = jwtTokenProvider.validateToken(token);
            boolean sessionValid = authService.isSessionValid(testUser.getUsername());
            boolean tokenBlacklisted = authService.isTokenBlacklisted(token);
            Map<Object, Object> sessionInfo = authService.getSessionInfo(testUser.getUsername());
            Map<Object, Object> userInfo = authService.getUserInfo(testUser.getId());
            
            // 4. 刷新会话
            authService.refreshSession(testUser.getUsername());
            
            Map<String, Object> result = new HashMap<>();
            result.put("step1_generate_jwt", token != null);
            result.put("step2_create_session", sessionValid);
            result.put("step3_jwt_valid", jwtValid);
            result.put("step4_session_valid", sessionValid);
            result.put("step5_not_blacklisted", !tokenBlacklisted);
            result.put("step6_session_info", sessionInfo != null && !sessionInfo.isEmpty());
            result.put("step7_user_info", userInfo != null && !userInfo.isEmpty());
            result.put("token", token);
            result.put("sessionInfo", sessionInfo);
            result.put("userInfo", userInfo);
            
            // 清理测试数据
            authService.logout(token, testUser.getUsername(), testUser.getId());
            
            return Result.success("登录流程测试成功", result);
        } catch (Exception e) {
            return Result.error("登录流程测试失败：" + e.getMessage());
        }
    }

    /**
     * 清理测试数据
     */
    @DeleteMapping("/cleanup")
    public Result<String> cleanup() {
        try {
            redisService.del("test:key");
            redisService.del("test:hash");
            return Result.success("测试数据清理成功", "All test data cleaned");
        } catch (Exception e) {
            return Result.error("测试数据清理失败：" + e.getMessage());
        }
    }
} 