package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.dto.ScoringDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.ScoringRecord;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.mapper.ScoringRecordMapper;
import com.gujian.questionnaire.service.AnswerRecordService;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.ScoringService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 评分服务实现类
 */
@Slf4j
@Service
public class ScoringServiceImpl extends ServiceImpl<ScoringRecordMapper, ScoringRecord> implements ScoringService {

    @Autowired
    private ScoringRecordMapper scoringRecordMapper;
    
    @Autowired
    private AnswerRecordService answerRecordService;
    
    @Autowired
    private AnswerSessionService answerSessionService;

    @Override
    @Transactional
    public ScoringRecord createScoringRecord(ScoringDTO scoringDTO, Long scorerId) {
        // 1. 验证答题记录
        AnswerRecord answerRecord = answerRecordService.getById(scoringDTO.getAnswerRecordId());
        if (answerRecord == null) {
            throw new BusinessException(ErrorCode.ANSWER_RECORD_NOT_FOUND);
        }
        
        // 2. 检查是否为主观题
        if (answerRecord.getQuestionType() != 4 && answerRecord.getQuestionType() != 5) {
            throw new BusinessException(ErrorCode.SCORING_NOT_SUBJECTIVE);
        }
        
        // 3. 检查是否已经评分过
        ScoringRecord existingRecord = getOne(
            lambdaQuery().eq(ScoringRecord::getAnswerRecordId, scoringDTO.getAnswerRecordId())
                        .eq(ScoringRecord::getScorerId, scorerId)
        );
        if (existingRecord != null) {
            throw new BusinessException(ErrorCode.SCORING_ALREADY_EXISTS);
        }
        
        // 4. 创建评分记录
        ScoringRecord scoringRecord = new ScoringRecord();
        scoringRecord.setAnswerRecordId(scoringDTO.getAnswerRecordId());
        scoringRecord.setSessionId(answerRecord.getSessionId());
        scoringRecord.setQuestionId(answerRecord.getQuestionId());
        scoringRecord.setScorerId(scorerId);
        scoringRecord.setScore(scoringDTO.getScore());
        scoringRecord.setMaxScore(scoringDTO.getMaxScore());
        scoringRecord.setComment(scoringDTO.getComment());
        scoringRecord.setScoringTime(LocalDateTime.now());
        
        // 5. 保存评分记录
        save(scoringRecord);
        
        // 6. 更新答题记录的人工评分
        answerRecord.setManualScore(scoringDTO.getScore());
        answerRecord.setFinalScore(answerRecord.getAutoScore() + scoringDTO.getScore());
        answerRecordService.updateById(answerRecord);
        
        // 7. 更新会话评分状态和总分
        updateSessionScoringStatus(answerRecord.getSessionId());
        
        log.info("创建评分记录: 答题记录ID={}, 评分者ID={}, 分数={}", 
                scoringDTO.getAnswerRecordId(), scorerId, scoringDTO.getScore());
        
        return scoringRecord;
    }

    @Override
    @Transactional
    public ScoringRecord updateScoringRecord(Long recordId, ScoringDTO scoringDTO, Long scorerId) {
        // 1. 验证评分记录
        ScoringRecord scoringRecord = getById(recordId);
        if (scoringRecord == null) {
            throw new BusinessException(ErrorCode.SCORING_RECORD_NOT_FOUND);
        }
        
        if (!scoringRecord.getScorerId().equals(scorerId)) {
            throw new BusinessException(ErrorCode.SCORING_PERMISSION_DENIED);
        }
        
        // 2. 获取原始分数
        Integer oldScore = scoringRecord.getScore();
        
        // 3. 更新评分记录
        scoringRecord.setScore(scoringDTO.getScore());
        scoringRecord.setComment(scoringDTO.getComment());
        scoringRecord.setScoringTime(LocalDateTime.now());
        updateById(scoringRecord);
        
        // 4. 更新答题记录的分数
        AnswerRecord answerRecord = answerRecordService.getById(scoringRecord.getAnswerRecordId());
        Integer scoreDiff = scoringDTO.getScore() - oldScore;
        answerRecord.setManualScore(scoringDTO.getScore());
        answerRecord.setFinalScore(answerRecord.getFinalScore() + scoreDiff);
        answerRecordService.updateById(answerRecord);
        
        // 5. 更新会话总分
        AnswerSession session = answerSessionService.getById(answerRecord.getSessionId());
        session.setFinalScore(session.getFinalScore() + scoreDiff);
        answerSessionService.updateById(session);
        
        log.info("更新评分记录: 记录ID={}, 旧分数={}, 新分数={}", recordId, oldScore, scoringDTO.getScore());
        
        return scoringRecord;
    }

    @Override
    @Transactional
    public boolean deleteScoringRecord(Long recordId, Long scorerId) {
        // 1. 验证评分记录
        ScoringRecord scoringRecord = getById(recordId);
        if (scoringRecord == null) {
            throw new BusinessException(ErrorCode.SCORING_RECORD_NOT_FOUND);
        }
        
        if (!scoringRecord.getScorerId().equals(scorerId)) {
            throw new BusinessException(ErrorCode.SCORING_PERMISSION_DENIED);
        }
        
        // 2. 删除评分记录
        removeById(recordId);
        
        // 3. 更新答题记录的分数
        AnswerRecord answerRecord = answerRecordService.getById(scoringRecord.getAnswerRecordId());
        answerRecord.setManualScore(0);
        answerRecord.setFinalScore(answerRecord.getAutoScore());
        answerRecordService.updateById(answerRecord);
        
        // 4. 更新会话评分状态和总分
        updateSessionScoringStatus(answerRecord.getSessionId());
        
        log.info("删除评分记录: 记录ID={}, 分数={}", recordId, scoringRecord.getScore());
        
        return true;
    }

    @Override
    public IPage<ScoringRecord> getScoringRecordsPage(int current, int size, Long sessionId, Long scorerId) {
        Page<ScoringRecord> page = new Page<>(current, size);
        IPage<ScoringRecord> result = scoringRecordMapper.selectPageWithDetails(page, sessionId, scorerId);
        
        // 处理扩展信息
        result.getRecords().forEach(this::processScoringRecord);
        
        return result;
    }

    @Override
    public List<ScoringRecord> getSessionScoringRecords(Long sessionId) {
        List<ScoringRecord> records = scoringRecordMapper.selectBySessionId(sessionId);
        records.forEach(this::processScoringRecord);
        return records;
    }

    @Override
    public ScoringRecord getScoringRecordDetail(Long recordId) {
        ScoringRecord record = scoringRecordMapper.selectDetailById(recordId);
        if (record == null) {
            throw new BusinessException(ErrorCode.SCORING_RECORD_NOT_FOUND);
        }
        
        processScoringRecord(record);
        return record;
    }

    @Override
    public Object getScoringStatistics(Long sessionId, Long scorerId) {
        return scoringRecordMapper.getScoringStatistics(sessionId, scorerId);
    }

    @Override
    @Transactional
    public boolean batchScoring(List<ScoringDTO> scoringDTOList, Long scorerId) {
        for (ScoringDTO scoringDTO : scoringDTOList) {
            try {
                createScoringRecord(scoringDTO, scorerId);
            } catch (Exception e) {
                log.error("批量评分失败: 答题记录ID={}, 错误={}", scoringDTO.getAnswerRecordId(), e.getMessage());
                throw new BusinessException(ErrorCode.SCORING_BATCH_FAILED, e.getMessage());
            }
        }
        
        return true;
    }

    @Override
    public List<AnswerRecord> getUnscoredRecords(Long sessionId, Long scorerId) {
        return scoringRecordMapper.selectUnscoredRecords(sessionId, scorerId);
    }

    @Override
    @Transactional
    public boolean completeSessionScoring(Long sessionId) {
        // 1. 验证会话
        AnswerSession session = answerSessionService.getById(sessionId);
        if (session == null) {
            throw new BusinessException(ErrorCode.SCORING_SESSION_NOT_FOUND);
        }
        
        // 2. 检查是否还有未评分的主观题
        List<AnswerRecord> unscoredRecords = getUnscoredRecords(sessionId, null);
        if (!unscoredRecords.isEmpty()) {
            throw new BusinessException(ErrorCode.SCORING_INCOMPLETE, "还有" + unscoredRecords.size() + "道主观题未评分");
        }
        
        // 3. 更新会话评分状态
        session.setScoringStatus(2); // 已完成评分
        answerSessionService.updateById(session);
        
        log.info("完成会话评分: 会话ID={}", sessionId);
        
        return true;
    }

    /**
     * 更新会话评分状态
     */
    private void updateSessionScoringStatus(Long sessionId) {
        // 获取会话所有主观题数量
        int totalSubjectiveCount = scoringRecordMapper.countSubjectiveQuestions(sessionId);
        
        if (totalSubjectiveCount == 0) {
            // 没有主观题，直接设为已完成
            AnswerSession session = answerSessionService.getById(sessionId);
            session.setScoringStatus(2);
            answerSessionService.updateById(session);
            return;
        }
        
        // 获取已评分的主观题数量
        int scoredCount = scoringRecordMapper.countScoredQuestions(sessionId);
        
        AnswerSession session = answerSessionService.getById(sessionId);
        if (scoredCount == 0) {
            session.setScoringStatus(0); // 未评分
        } else if (scoredCount < totalSubjectiveCount) {
            session.setScoringStatus(1); // 部分评分
        } else {
            session.setScoringStatus(2); // 已完成评分
        }
        
        // 重新计算会话总分
        Integer totalFinalScore = scoringRecordMapper.calculateSessionTotalScore(sessionId);
        session.setFinalScore(totalFinalScore != null ? totalFinalScore : 0);
        
        answerSessionService.updateById(session);
    }

    /**
     * 处理评分记录扩展信息
     */
    private void processScoringRecord(ScoringRecord record) {
        // 这里可以添加更多的数据处理逻辑
        // 比如设置评分者姓名、题目信息等
    }
} 