package com.gujian.questionnaire.common;

import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.entity.UserRole;
import com.gujian.questionnaire.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

/**
 * JWT认证过滤器 - JWT验证+Redis会话检查+用户信息加载
 * 
 * 功能增强：
 * 1. JWT Token验证
 * 2. Redis会话验证
 * 3. 从Redis加载完整用户信息到Spring Security上下文
 * 4. 支持@AuthenticationPrincipal User获取完整用户对象
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String token = getTokenFromRequest(request);
        
        if (StringUtils.hasText(token)) {
            try {
                // 1. 验证JWT Token格式和有效性
                if (!jwtTokenProvider.validateToken(token)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // 2. 检查Token是否在黑名单
                if (authService.isTokenBlacklisted(token)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // 3. 从JWT Token中获取用户信息
                String username = jwtTokenProvider.getUsernameFromToken(token);
                UserRole role = jwtTokenProvider.getRoleFromToken(token);

                // 4. 检查Redis会话是否有效
                if (!authService.isSessionValid(username)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // 5. 从Redis获取完整用户信息
                User user = getUserFromRedis(username);
                if (user == null) {
                    log.warn("无法从Redis获取用户信息: {}", username);
                    filterChain.doFilter(request, response);
                    return;
                }

                // 6. 设置Spring Security认证信息（包含完整User对象）
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(
                        user,  // 完整的User对象作为Principal
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
                    );
                SecurityContextHolder.getContext().setAuthentication(auth);

                // 7. 刷新Redis会话最后访问时间
                authService.refreshSession(username);

            } catch (Exception e) {
                log.error("JWT认证失败: {}", e.getMessage());
                // Token解析失败，清除认证信息
                SecurityContextHolder.clearContext();
            }
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * 从Redis获取完整用户信息
     * @param username 用户名
     * @return User对象，获取失败返回null
     */
    private User getUserFromRedis(String username) {
        try {
            // 从Redis会话信息中获取用户ID
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

            // 从Redis用户信息缓存中获取完整信息
            Map<Object, Object> userInfo = authService.getUserInfo(userId);
            if (userInfo == null || userInfo.isEmpty()) {
                log.warn("Redis中未找到用户信息: userId={}", userId);
                return null;
            }

            // 构建User对象
            User user = new User();
            user.setId(userId);
            user.setUsername(getString(userInfo, "username"));
            user.setEmail(getString(userInfo, "email"));
            user.setRealName(getString(userInfo, "realName"));
            
            // 解析角色
            String roleStr = getString(userInfo, "role");
            if (roleStr != null) {
                try {
                    user.setRole(UserRole.valueOf(roleStr));
                } catch (IllegalArgumentException e) {
                    log.warn("无效的用户角色: {}", roleStr);
                    user.setRole(UserRole.USER);
                }
            }

            // 解析enabled状态
            Object enabledObj = userInfo.get("enabled");
            if (enabledObj != null) {
                user.setEnabled(Boolean.valueOf(enabledObj.toString()));
            }

            return user;
        } catch (Exception e) {
            log.error("从Redis获取用户信息失败: username={}, error={}", username, e.getMessage());
            return null;
        }
    }

    /**
     * 安全地从Map中获取String值
     */
    private String getString(Map<Object, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * 从请求头中获取JWT令牌
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
} 