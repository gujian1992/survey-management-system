package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gujian.questionnaire.dto.ScoringDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.ScoringRecord;

import java.util.List;

/**
 * 评分服务接口
 */
public interface ScoringService extends IService<ScoringRecord> {
    
    /**
     * 创建评分记录
     */
    ScoringRecord createScoringRecord(ScoringDTO scoringDTO, Long scorerId);
    
    /**
     * 更新评分记录
     */
    ScoringRecord updateScoringRecord(Long recordId, ScoringDTO scoringDTO, Long scorerId);
    
    /**
     * 删除评分记录
     */
    boolean deleteScoringRecord(Long recordId, Long scorerId);
    
    /**
     * 批量评分
     */
    boolean batchScoring(List<ScoringDTO> scoringDTOList, Long scorerId);
    
    /**
     * 分页查询评分记录
     */
    IPage<ScoringRecord> getScoringRecordsPage(int current, int size, Long sessionId, Long scorerId);
    
    /**
     * 获取会话的所有评分记录
     */
    List<ScoringRecord> getSessionScoringRecords(Long sessionId);
    
    /**
     * 获取评分记录详情
     */
    ScoringRecord getScoringRecordDetail(Long recordId);
    
    /**
     * 获取评分统计
     */
    Object getScoringStatistics(Long sessionId, Long scorerId);
    
    /**
     * 获取未评分的记录
     */
    List<AnswerRecord> getUnscoredRecords(Long sessionId, Long scorerId);
    
    /**
     * 完成会话评分
     */
    boolean completeSessionScoring(Long sessionId);
} 