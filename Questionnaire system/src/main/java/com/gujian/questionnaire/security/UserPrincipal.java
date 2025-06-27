package com.gujian.questionnaire.security;

import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * 自定义用户主体类 - 包含完整的用户信息
 * 
 * 用于在Spring Security Context中存储完整的User对象，
 * 这样就可以直接使用@AuthenticationPrincipal User获取用户信息
 */
public class UserPrincipal implements UserDetails {
    
    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    /**
     * 获取完整的User对象
     */
    public User getUser() {
        return user;
    }

    /**
     * 获取用户ID
     */
    public Long getId() {
        return user.getId();
    }

    /**
     * 获取用户角色
     */
    public UserRole getRole() {
        return user.getRole();
    }

    /**
     * 获取真实姓名
     */
    public String getRealName() {
        return user.getRealName();
    }

    /**
     * 获取邮箱
     */
    public String getEmail() {
        return user.getEmail();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    @Override
    public String getPassword() {
        return null; // JWT认证不需要密码
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getEnabled();
    }
} 