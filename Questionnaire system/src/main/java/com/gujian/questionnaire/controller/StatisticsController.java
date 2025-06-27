package com.gujian.questionnaire.controller;

import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.QuestionBankService;
import com.gujian.questionnaire.service.ScoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 统计数据控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/statistics")
@Tag(name = "统计数据管理")
public class StatisticsController {

    @Autowired
    private QuestionBankService questionBankService;
    
    @Autowired
    private AnswerSessionService answerSessionService;
    
    @Autowired
    private ScoringService scoringService;

    @GetMapping("/dashboard")
    @Operation(summary = "获取仪表盘统计数据")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 获取题库统计
            Object questionStats = questionBankService.getQuestionStats();
            
            // 获取会话统计
            // 这里需要实现对应的统计方法，先返回模拟数据
            stats.put("totalQuestions", 25); // 总题目数
            stats.put("totalSessions", 156); // 总会话数
            stats.put("completedSessions", 128); // 已完成会话数
            stats.put("totalUsers", 89); // 总用户数
            
            // 会话状态分布
            stats.put("draftCount", 12); // 进行中
            stats.put("publishedCount", 128); // 已完成
            stats.put("endedCount", 16); // 已超时/放弃
            
            // 近期趋势数据
            stats.put("questionStats", questionStats);
            
            log.info("获取仪表盘统计数据成功");
            return Result.success(stats);
            
        } catch (Exception e) {
            log.error("获取仪表盘统计数据失败", e);
            return Result.error("获取统计数据失败");
        }
    }

    @GetMapping("/trend")
    @Operation(summary = "获取趋势数据")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getTrend(
            @Parameter(description = "天数") @RequestParam(defaultValue = "7") int days) {
        
        Map<String, Object> trendData = new HashMap<>();
        
        try {
            // 生成最近N天的日期
            List<String> dates = new ArrayList<>();
            List<Integer> counts = new ArrayList<>();
            
            LocalDate endDate = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
            
            for (int i = days - 1; i >= 0; i--) {
                LocalDate date = endDate.minusDays(i);
                dates.add(date.format(formatter));
                
                // 这里应该查询真实的数据，现在先返回模拟数据
                counts.add((int)(Math.random() * 20) + 5);
            }
            
            trendData.put("dates", dates);
            trendData.put("counts", counts);
            
            log.info("获取{}天趋势数据成功", days);
            return Result.success(trendData);
            
        } catch (Exception e) {
            log.error("获取趋势数据失败", e);
            return Result.error("获取趋势数据失败");
        }
    }

    @GetMapping("/question/{questionId}")
    @Operation(summary = "获取题目统计数据")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getQuestionStats(@PathVariable Long questionId) {
        try {
            // 这里应该实现具体的题目统计逻辑
            Map<String, Object> questionStats = new HashMap<>();
            questionStats.put("questionId", questionId);
            questionStats.put("totalAnswers", 0);
            questionStats.put("correctRate", 0.0);
            questionStats.put("avgScore", 0.0);
            
            return Result.success(questionStats);
            
        } catch (Exception e) {
            log.error("获取题目统计数据失败", e);
            return Result.error("获取题目统计数据失败");
        }
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "获取会话统计数据")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getSessionStats(@PathVariable Long sessionId) {
        try {
            // 获取会话统计数据
            Object sessionStats = answerSessionService.getUserStats(sessionId);
            
            return Result.success((Map<String, Object>) sessionStats);
            
        } catch (Exception e) {
            log.error("获取会话统计数据失败", e);
            return Result.error("获取会话统计数据失败");
        }
    }
} 