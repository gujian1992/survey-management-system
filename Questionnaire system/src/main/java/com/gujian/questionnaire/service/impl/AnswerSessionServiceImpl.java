package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.mapper.AnswerSessionMapper;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.QuestionBankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 答题会话服务实现类
 */
@Slf4j
@Service
public class AnswerSessionServiceImpl extends ServiceImpl<AnswerSessionMapper, AnswerSession> implements AnswerSessionService {

    @Autowired
    private AnswerSessionMapper answerSessionMapper;
    
    @Autowired
    private QuestionBankService questionBankService;

    @Override
    @Transactional
    public AnswerSession startAnswerSession(StartAnswerDTO startAnswerDTO, Long userId) {
        // 检查用户是否有进行中的会话
        LambdaQueryWrapper<AnswerSession> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AnswerSession::getUserId, userId)
                   .eq(AnswerSession::getStatus, 1); // 进行中
        
        AnswerSession existingSession = getOne(queryWrapper);
        if (existingSession != null) {
            throw new BusinessException(ErrorCode.SESSION_IN_PROGRESS);
        }
        
        // 检查题库中是否有足够的题目
        List<QuestionBank> availableQuestions = questionBankService.getRandomQuestions(
            startAnswerDTO.getQuestionType(), startAnswerDTO.getQuestionCount());
        
        if (availableQuestions.size() < startAnswerDTO.getQuestionCount()) {
            throw new BusinessException(ErrorCode.SESSION_INSUFFICIENT_QUESTIONS, 
                "题库中可用题目不足，当前只有" + availableQuestions.size() + "道题目");
        }
        
        // 创建新会话
        AnswerSession session = new AnswerSession();
        session.setUserId(userId);
        session.setSessionCode(generateSessionCode());
        session.setQuestionType(startAnswerDTO.getQuestionType());
        session.setTotalCount(startAnswerDTO.getQuestionCount());
        session.setCurrentCount(0);
        session.setTimeoutMinutes(startAnswerDTO.getTimeoutMinutes());
        session.setStartTime(LocalDateTime.now());
        session.setLastActivityTime(LocalDateTime.now());
        session.setStatus(1); // 进行中
        
        // 计算理论总分
        int totalScore = availableQuestions.stream().mapToInt(QuestionBank::getScore).sum();
        session.setTotalScore(totalScore);
        
        save(session);
        
        log.info("用户{}开始答题会话: {}", userId, session.getSessionCode());
        return session;
    }

    @Override
    public AnswerSession getSessionByCode(String sessionCode) {
        AnswerSession session = answerSessionMapper.selectBySessionCode(sessionCode);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }
        
        // 设置扩展信息
        processSessionInfo(session);
        return session;
    }

    @Override
    @Transactional
    public boolean finishSession(String sessionCode, Long userId) {
        AnswerSession session = getSessionByCode(sessionCode);
        
        if (!session.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.SESSION_PERMISSION_DENIED);
        }
        
        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_FINISHED);
        }
        
        session.setStatus(2); // 已完成
        session.setEndTime(LocalDateTime.now());
        
        boolean success = updateById(session);
        if (success) {
            log.info("用户{}完成答题会话: {}", userId, sessionCode);
        }
        
        return success;
    }

    @Override
    @Transactional
    public boolean abandonSession(String sessionCode, Long userId) {
        AnswerSession session = getSessionByCode(sessionCode);
        
        if (!session.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.SESSION_PERMISSION_DENIED);
        }
        
        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_FINISHED);
        }
        
        session.setStatus(4); // 已放弃
        session.setEndTime(LocalDateTime.now());
        
        boolean success = updateById(session);
        if (success) {
            log.info("用户{}放弃答题会话: {}", userId, sessionCode);
        }
        
        return success;
    }

    @Override
    @Transactional
    public boolean updateSessionProgress(Long sessionId) {
        AnswerSession session = getById(sessionId);
        if (session == null) {
            return false;
        }
        
        session.setLastActivityTime(LocalDateTime.now());
        
        // 如果答题数量达到总数，自动完成会话
        if (session.getCurrentCount() >= session.getTotalCount()) {
            session.setStatus(2); // 已完成
            session.setEndTime(LocalDateTime.now());
        }
        
        return updateById(session);
    }

    @Override
    @Transactional
    public boolean checkSessionTimeout(String sessionCode) {
        AnswerSession session = getSessionByCode(sessionCode);
        
        if (session.getStatus() != 1) {
            return false; // 会话已结束
        }
        
        LocalDateTime timeoutTime = session.getStartTime().plusMinutes(session.getTimeoutMinutes());
        if (LocalDateTime.now().isAfter(timeoutTime)) {
            session.setStatus(3); // 已超时
            session.setEndTime(LocalDateTime.now());
            updateById(session);
            
            log.info("答题会话超时: {}", sessionCode);
            return true;
        }
        
        return false;
    }

    @Override
    public IPage<AnswerSession> getUserSessionPage(int current, int size, Long userId, Integer status) {
        Page<AnswerSession> page = new Page<>(current, size);
        IPage<AnswerSession> result = answerSessionMapper.selectSessionPage(page, userId, status, null);
        
        // 处理扩展信息
        result.getRecords().forEach(this::processSessionInfo);
        
        return result;
    }

    @Override
    public IPage<AnswerSession> getAllSessionPage(int current, int size, Integer status, Integer questionType) {
        Page<AnswerSession> page = new Page<>(current, size);
        IPage<AnswerSession> result = answerSessionMapper.selectSessionPage(page, null, status, questionType);
        
        // 处理扩展信息
        result.getRecords().forEach(this::processSessionInfo);
        
        return result;
    }

    @Override
    public Object getUserStats(Long userId) {
        return answerSessionMapper.getUserStats(userId);
    }

    @Override
    @Transactional
    public boolean updateSessionScore(Long sessionId) {
        // 这个方法将在AnswerRecordService中调用，用于更新会话总分
        return updateSessionProgress(sessionId);
    }

    /**
     * 生成会话编码
     */
    private String generateSessionCode() {
        return "S" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * 处理会话扩展信息
     */
    private void processSessionInfo(AnswerSession session) {
        // 设置题型名称
        session.setQuestionTypeName(getQuestionTypeName(session.getQuestionType()));
        
        // 设置状态名称
        session.setStatusName(getStatusName(session.getStatus()));
        
        // 设置评分状态名称
        session.setScoringStatusName(getScoringStatusName(session.getScoringStatus()));
        
        // 计算答题进度
        if (session.getTotalCount() > 0) {
            double progress = (double) session.getCurrentCount() / session.getTotalCount() * 100;
            session.setProgressPercent(Math.round(progress * 100.0) / 100.0);
        } else {
            session.setProgressPercent(0.0);
        }
    }

    /**
     * 获取题型名称
     */
    private String getQuestionTypeName(Integer type) {
        switch (type) {
            case 0: return "混合题型";
            case 1: return "单选题";
            case 2: return "多选题";
            case 3: return "填空题";
            case 4: return "简答题";
            case 5: return "评分题";
            default: return "未知";
        }
    }

    /**
     * 获取状态名称
     */
    private String getStatusName(Integer status) {
        switch (status) {
            case 1: return "进行中";
            case 2: return "已完成";
            case 3: return "已超时";
            case 4: return "已放弃";
            default: return "未知";
        }
    }

    /**
     * 获取评分状态名称
     */
    private String getScoringStatusName(Integer scoringStatus) {
        switch (scoringStatus) {
            case 0: return "未评分";
            case 1: return "部分评分";
            case 2: return "已完成评分";
            default: return "未知";
        }
    }
} 