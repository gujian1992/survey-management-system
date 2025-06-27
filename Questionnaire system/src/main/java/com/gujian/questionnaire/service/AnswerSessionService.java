package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;

/**
 * 答题会话服务接口
 */
public interface AnswerSessionService extends IService<AnswerSession> {
    
    /**
     * 开始答题会话
     */
    AnswerSession startAnswerSession(StartAnswerDTO startAnswerDTO, Long userId);
    
    /**
     * 根据会话编码获取会话信息
     */
    AnswerSession getSessionByCode(String sessionCode);
    
    /**
     * 完成答题会话
     */
    boolean finishSession(String sessionCode, Long userId);
    
    /**
     * 放弃答题会话
     */
    boolean abandonSession(String sessionCode, Long userId);
    
    /**
     * 更新会话进度
     */
    boolean updateSessionProgress(Long sessionId);
    
    /**
     * 检查会话是否超时
     */
    boolean checkSessionTimeout(String sessionCode);
    
    /**
     * 分页查询用户的答题会话
     */
    IPage<AnswerSession> getUserSessionPage(int current, int size, Long userId, Integer status);
    
    /**
     * 分页查询所有答题会话（管理员）
     */
    IPage<AnswerSession> getAllSessionPage(int current, int size, Integer status, Integer questionType);
    
    /**
     * 获取用户答题统计
     */
    Object getUserStats(Long userId);
    
    /**
     * 更新会话分数
     */
    boolean updateSessionScore(Long sessionId);
} 