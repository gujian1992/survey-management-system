package com.gujian.questionnaire.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionStatusVO {
    // 简化状态VO，移除实时计算字段，改为前端计算
    // private Integer lastQuestionIndex;    // 前端管理当前位置
    private Integer totalQuestions;       // 总题目数
    // private Integer completedCount;       // 前端计算已完成数
    private Integer remainingTime;        // 剩余时间（秒）
    private String status;                // 会话状态
    private Long startTime;               // 开始时间戳，供前端计算使用
    private Integer timeoutMinutes;       // 超时时间（分钟）
} 