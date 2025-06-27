package com.gujian.questionnaire.dto;

import lombok.Data;

import java.util.List;

/**
 * 仪表盘统计VO类
 */
@Data
public class DashboardStatsVO {

    /**
     * 问卷总数
     */
    private Long totalQuestionnaires;

    /**
     * 已发布问卷数
     */
    private Integer publishedQuestionnaires;

    /**
     * 总回复数
     */
    private Integer totalReplies;

    /**
     * 总浏览量
     */
    private Integer totalViews;

    /**
     * 草稿问卷数量
     */
    private Integer draftCount;

    /**
     * 已发布问卷数量
     */
    private Integer publishedCount;

    /**
     * 已结束问卷数量
     */
    private Integer endedCount;

    /**
     * 每日问卷数量
     */
    private List<Integer> dailyCounts;

    /**
     * 日期标签
     */
    private List<String> dateLabels;
} 