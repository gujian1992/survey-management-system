package com.gujian.questionnaire.controller;

import com.gujian.questionnaire.common.JwtTokenProvider;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.dto.LoginRequest;
import com.gujian.questionnaire.dto.LoginResponse;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.entity.UserRole;
import com.gujian.questionnaire.service.AuthService;
import com.gujian.questionnaire.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 认证控制器 - JWT生成Token，Redis管理会话
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthService authService;

    /**
     * 用户登录 - JWT生成Token，Redis存储会话
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.validateUser(loginRequest.getUsername(), loginRequest.getPassword());
            
            if (user == null) {
                return Result.badRequest("用户名或密码错误");
            }

            // 1. 使用JwtTokenProvider生成JWT Token
            String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

            // 2. 使用AuthService在Redis中创建会话
            authService.createSession(token, user);

            // 构建用户信息
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getRealName(),
                    user.getRole(),
                    user.getEmail()
            );

            LoginResponse response = new LoginResponse(token, userInfo);
            return Result.success("登录成功", response);

        } catch (Exception e) {
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 获取当前用户信息 - JWT验证+Redis会话检查
     */
    @GetMapping("/userinfo")
    public Result<LoginResponse.UserInfo> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // 1. 验证JWT Token格式和有效性
            if (!jwtTokenProvider.validateToken(token)) {
                return Result.unauthorized("无效的令牌");
            }

            // 2. 检查Token是否在黑名单
            if (authService.isTokenBlacklisted(token)) {
                return Result.unauthorized("令牌已失效");
            }

            // 3. 从Token中获取用户信息
            String username = jwtTokenProvider.getUsernameFromToken(token);

            // 4. 检查Redis会话是否存在
            if (!authService.isSessionValid(username)) {
                return Result.unauthorized("会话已过期");
            }

            // 5. 优先从Redis缓存获取用户详细信息
            User user = userService.findByUsername(username);
            if (user == null) {
                return Result.notFound("用户不存在");
            }

            // 6. 刷新Redis会话
            authService.refreshSession(username);

            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getRealName(),
                    user.getRole(),
                    user.getEmail()
            );

            return Result.success("获取用户信息成功", userInfo);

        } catch (Exception e) {
            return Result.error("获取用户信息失败：" + e.getMessage());
        }
    }

    /**
     * 用户登出 - 销毁Redis会话，将JWT加入黑名单
     */
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // 验证Token并获取用户信息
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                
                // 获取用户信息
                User user = userService.findByUsername(username);
                if (user != null) {
                    // 使用AuthService销毁会话并加入黑名单
                    authService.logout(token, username, user.getId());
                }
            }
            
            Result<Void> result = Result.success();
            result.setMessage("登出成功");
            return result;

        } catch (Exception e) {
            return Result.error("登出失败：" + e.getMessage());
        }
    }

    /**
     * 刷新Token - 生成新的JWT，更新Redis会话
     */
    @PostMapping("/refresh")
    public Result<String> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // 1. 验证旧Token
            if (!jwtTokenProvider.validateToken(token)) {
                return Result.unauthorized("无效的令牌");
            }

            // 2. 检查Token是否在黑名单
            if (authService.isTokenBlacklisted(token)) {
                return Result.unauthorized("令牌已失效");
            }

            // 3. 从Token获取用户信息
            String username = jwtTokenProvider.getUsernameFromToken(token);
            UserRole role = jwtTokenProvider.getRoleFromToken(token);

            // 4. 检查Redis会话
            if (!authService.isSessionValid(username)) {
                return Result.unauthorized("会话已过期");
            }

            // 5. 生成新的JWT Token
            String newToken = jwtTokenProvider.generateToken(username, role);

            // 6. 更新Redis会话
            User user = userService.findByUsername(username);
            if (user != null) {
                authService.logout(token, username, user.getId()); // 销毁旧会话
                authService.createSession(newToken, user); // 创建新会话
            }
            
            return Result.success("Token刷新成功", newToken);

        } catch (Exception e) {
            return Result.error("Token刷新失败：" + e.getMessage());
        }
    }

    // ============================= 会话管理接口 (仅管理员) =============================

    /**
     * 获取在线用户数量
     */
    @GetMapping("/online-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Long> getOnlineUserCount() {
        try {
            long count = authService.getOnlineUserCount();
            return Result.success("获取在线用户数量成功", count);
        } catch (Exception e) {
            return Result.error("获取在线用户数量失败：" + e.getMessage());
        }
    }

    /**
     * 获取在线用户列表
     */
    @GetMapping("/online-users")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<Map<String, Object>>> getOnlineUsers() {
        try {
            List<Map<String, Object>> onlineUsers = authService.getOnlineUsers();
            return Result.success("获取在线用户列表成功", onlineUsers);
        } catch (Exception e) {
            return Result.error("获取在线用户列表失败：" + e.getMessage());
        }
    }

    /**
     * 强制用户下线
     */
    @PostMapping("/force-logout/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> forceLogout(@PathVariable String username) {
        try {
            authService.forceLogout(username);
            Result<Void> result = Result.success();
            result.setMessage("强制下线成功");
            return result;
        } catch (Exception e) {
            return Result.error("强制下线失败：" + e.getMessage());
        }
    }

    /**
     * 手动触发清理过期会话
     */
    @PostMapping("/clean-sessions")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> cleanExpiredSessions() {
        try {
            authService.cleanExpiredSessions();
            Result<Void> result = Result.success();
            result.setMessage("会话清理完成");
            return result;
        } catch (Exception e) {
            return Result.error("会话清理失败：" + e.getMessage());
        }
    }
} 