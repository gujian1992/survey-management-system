package com.gujian.questionnaire.dto;

import com.gujian.questionnaire.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    /**
     * JWT令牌
     */
    private String token;
    
    /**
     * 用户信息
     */
    private UserInfo userInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private String realName;
        private UserRole role;
        private String email;
    }
} 