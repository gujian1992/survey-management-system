package com.gujian.questionnaire.config;

import com.gujian.questionnaire.common.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security配置 - JWT+Redis认证体系
 * 
 * 权限体系设计：
 * - 管理员(ADMIN): 题库管理、会话管理、评分管理、统计分析、用户管理
 * - 普通用户(USER): 答题功能、查看个人记录
 * - 公开访问: 登录认证、API文档、测试接口
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                
                // ===== 公开访问接口 =====
                .antMatchers("/swagger-ui/**", "/swagger-ui.html", "/webjars/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll()
                .antMatchers("/api/auth/**").permitAll()           // 认证接口 (登录/登出/刷新/会话管理)
                .antMatchers("/api/test/**").permitAll()           // 测试接口 (开发调试用)
                
                // ===== 题库管理接口 (仅管理员) =====
                .antMatchers("/api/question-bank/**").hasRole("ADMIN")
                
                // ===== 答题会话管理接口 =====
                .antMatchers("/api/answer-session/start").authenticated()                    // 开始答题会话 (用户+管理员)
                .antMatchers("/api/answer-session/my-sessions").authenticated()             // 我的答题会话 (用户+管理员)
                .antMatchers("/api/answer-session/my-stats").authenticated()                // 我的答题统计 (用户+管理员)
                .antMatchers(HttpMethod.GET, "/api/answer-session/*").authenticated()       // 获取会话信息 (用户+管理员)
                .antMatchers("/api/answer-session/*/finish").authenticated()               // 完成答题会话 (用户+管理员)
                .antMatchers("/api/answer-session/*/abandon").authenticated()              // 放弃答题会话 (用户+管理员)
                .antMatchers("/api/answer-session/*/check-timeout").authenticated()        // 检查会话超时 (用户+管理员)
                .antMatchers("/api/answer-session/admin/**").hasRole("ADMIN")              // 管理员会话管理
                .antMatchers("/api/answer-session/user/*/stats").hasRole("ADMIN")          // 用户统计 (仅管理员)
                
                // ===== 答题记录接口 =====
                .antMatchers("/api/answer-record/submit").authenticated()                   // 提交答案 (用户+管理员)
                .antMatchers("/api/answer-record/next-question/*").authenticated()         // 获取下一题 (用户+管理员)
                .antMatchers(HttpMethod.GET, "/api/answer-record/*").authenticated()       // 获取记录详情 (用户+管理员)
                .antMatchers("/api/answer-record/session/*").authenticated()               // 获取会话记录 (用户+管理员)
                .antMatchers("/api/answer-record/need-scoring").hasRole("ADMIN")           // 需要评分的记录 (仅管理员)
                .antMatchers("/api/answer-record/batch-auto-score/*").hasRole("ADMIN")     // 批量自动评分 (仅管理员)
                
                // ===== 评分管理接口 (仅管理员) =====
                .antMatchers("/api/scoring/**").hasRole("ADMIN")
                
                // ===== 统计分析接口 (仅管理员) =====
                .antMatchers("/api/statistics/**").hasRole("ADMIN")
                
                // ===== 兜底规则 =====
                .anyRequest().authenticated()
                .and()
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 