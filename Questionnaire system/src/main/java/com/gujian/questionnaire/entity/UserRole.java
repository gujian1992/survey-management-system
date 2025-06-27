package com.gujian.questionnaire.entity;

/**
 * 用户角色枚举
 */
public enum UserRole {
    ADMIN("管理员"),
    USER("用户");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 