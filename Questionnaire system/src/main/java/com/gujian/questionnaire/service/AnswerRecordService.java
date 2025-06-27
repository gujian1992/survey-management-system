package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.QuestionBank;

import java.util.List;

/**
 * 答题记录服务接口
 */
public interface AnswerRecordService extends IService<AnswerRecord> {
    
    /**
     * 提交答案
     */
    AnswerRecord submitAnswer(SubmitAnswerDTO submitAnswerDTO, Long userId);
    
    /**
     * 获取下一题
     */
    QuestionBank getNextQuestion(String sessionCode);
    
    /**
     * 获取会话的所有答题记录
     */
    List<AnswerRecord> getSessionRecords(Long sessionId);
    
    /**
     * 分页查询需要评分的记录
     */
    IPage<AnswerRecord> getNeedScoringPage(int current, int size);
    
    /**
     * 自动评分（客观题）
     */
    boolean autoScore(AnswerRecord answerRecord, QuestionBank question);
    
    /**
     * 获取答题记录详情
     */
    AnswerRecord getRecordDetail(Long recordId);
    
    /**
     * 批量自动评分
     */
    boolean batchAutoScore(Long sessionId);
    
    /**
     * 获取会话答题统计
     */
    Object getSessionAnswerStats(Long sessionId);
} 