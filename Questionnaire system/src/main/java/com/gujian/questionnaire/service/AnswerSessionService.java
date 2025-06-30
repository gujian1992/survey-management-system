package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.dto.SessionStatusVO;
import com.gujian.questionnaire.dto.QuestionVO;

import java.util.Map;

/**
 * 答题会话服务接口
 */
public interface AnswerSessionService extends IService<AnswerSession> {
    
    /**
     * 开始答题会话
     */
    AnswerSession startAnswerSession(StartAnswerDTO startAnswerDTO, Long userId);
    
    /**
     * 获取当前活动会话
     */
    AnswerSession getCurrentSession(Long userId);
    
    // 移除复杂的状态管理方法，简化为轻量级会话
    // /**
    //  * 保存会话状态 - 改为前端管理
    //  */
    // void saveSessionState(Long userId, Map<String, Object> stateData);
    // 
    // /**
    //  * 更新最后活动时间 - 移除实时状态跟踪
    //  */
    // void updateLastActivityTime(String sessionCode);
    
    /**
     * 根据会话编码获取会话信息
     */
    AnswerSession getSessionByCode(String sessionCode);
    
    /**
     * 完成答题会话
     */
    boolean finishSession(String sessionCode, Long userId);
    
    /**
     * 放弃答题会话（通过会话编码）
     */
    void abandonSession(String sessionCode);
    
    /**
     * 放弃答题会话（通过会话ID）
     */
    void abandonSession(Integer sessionId);
    
    /**
     * 更新会话状态
     */
    void updateSessionStatus(String sessionCode, Integer status);
    
    /**
     * 获取用户会话列表（分页）
     */
    IPage<AnswerSession> getUserSessionPage(int current, int size, Long userId, Integer status);
    
    /**
     * 获取所有会话列表（管理员，分页）
     */
    IPage<AnswerSession> getAllSessionPage(int current, int size, String userName, Integer status, String startTime, String endTime);
    
    /**
     * 获取用户答题统计
     */
    Object getUserStats(Long userId);
    
    AnswerSession getSessionById(Integer id);
    
    // 移除复杂的实时状态管理方法，简化为轻量级会话
    // void submitAnswer(Integer sessionId, SubmitAnswerDTO submitAnswerDTO); // 改为批量提交
    
    // /**
    //  * 处理心跳保活 - 移除心跳机制，简化状态管理
    //  * @param sessionId 会话ID
    //  * @param userId 用户ID
    //  * @param heartbeatData 心跳数据
    //  * @return 响应数据
    //  */
    // java.util.Map<String, Object> processHeartbeat(Integer sessionId, Long userId, java.util.Map<String, Object> heartbeatData);
    // 
    // /**
    //  * 标记会话异常退出 - 简化异常处理
    //  * @param sessionId 会话ID
    //  * @param userId 用户ID
    //  * @param exitData 退出数据
    //  */
    // void markAbnormalExit(Integer sessionId, Long userId, java.util.Map<String, Object> exitData);
    // 
    // /**
    //  * 更新会话进度 - 改为前端计算
    //  */
    // boolean updateSessionProgress(Long sessionId);
    
    /**
     * 检查会话是否超时
     */
    boolean checkSessionTimeout(String sessionCode);
    
    /**
     * 延长会话超时时间
     */
    boolean extendSession(String sessionCode, Integer extendMinutes);
    
    /**
     * 强制完成会话（管理员）
     */
    boolean forceCompleteSession(String sessionCode);
    
    /**
     * 批量检查并处理超时会话
     */
    int batchCheckTimeout();
    
    /**
     * 恢复答题会话
     */
    AnswerSession resumeSession(String sessionCode);
    
    /**
     * 更新会话分数
     * @param sessionId 会话ID
     * @return 是否更新成功
     */
    boolean updateSessionScore(Long sessionId);

    /**
     * 获取会话状态
     */
    SessionStatusVO getSessionStatus(String sessionCode);

    /**
     * 获取指定题目
     */
    QuestionVO getQuestionByIndex(String sessionCode, Integer index);

    /**
     * 完成会话
     */
    void finishSession(String sessionCode);
} 