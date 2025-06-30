package com.gujian.questionnaire.config;

import com.gujian.questionnaire.service.AnswerSessionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * 定时任务配置
 */
@Slf4j
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "app.scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class ScheduleConfig {

    @Autowired
    private AnswerSessionService answerSessionService;

    /**
     * 每5分钟检查一次超时会话
     */
    @Scheduled(fixedRate = 5 * 60 * 1000) // 5分钟 = 5 * 60 * 1000毫秒
    public void checkTimeoutSessions() {
        try {
            log.debug("开始执行超时会话检查任务");
            int timeoutCount = answerSessionService.batchCheckTimeout();
            if (timeoutCount > 0) {
                log.info("定时任务处理了{}个超时会话", timeoutCount);
            }
        } catch (Exception e) {
            log.error("检查超时会话任务执行失败", e);
        }
    }

    /**
     * 每天凌晨2点清理过期数据（可选）
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredData() {
        try {
            log.info("开始执行数据清理任务");
            // 这里可以添加清理过期数据的逻辑
            // 比如删除7天前的已完成会话等
        } catch (Exception e) {
            log.error("数据清理任务执行失败", e);
        }
    }
} 