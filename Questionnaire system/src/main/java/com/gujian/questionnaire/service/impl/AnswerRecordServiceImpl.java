package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.mapper.AnswerRecordMapper;
import com.gujian.questionnaire.service.AnswerRecordService;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.QuestionBankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 答题记录服务实现类
 */
@Slf4j
@Service
public class AnswerRecordServiceImpl extends ServiceImpl<AnswerRecordMapper, AnswerRecord> implements AnswerRecordService {

    @Autowired
    private AnswerRecordMapper answerRecordMapper;
    
    @Autowired
    private AnswerSessionService answerSessionService;
    
    @Autowired
    private QuestionBankService questionBankService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public AnswerRecord submitAnswer(SubmitAnswerDTO submitAnswerDTO, Long userId) {
        // 1. 验证会话
        AnswerSession session = answerSessionService.getSessionByCode(submitAnswerDTO.getSessionCode());
        if (!session.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.SESSION_PERMISSION_DENIED);
        }
        
        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ANSWER_SESSION_FINISHED);
        }
        
        // 2. 检查是否超时
        if (answerSessionService.checkSessionTimeout(submitAnswerDTO.getSessionCode())) {
            throw new BusinessException(ErrorCode.SESSION_TIMEOUT);
        }
        
        // 3. 验证题目
        QuestionBank question = questionBankService.getQuestionDetail(submitAnswerDTO.getQuestionId());
        if (question == null) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        
        // 4. 检查是否已答过此题
        AnswerRecord existingRecord = getOne(
            lambdaQuery().eq(AnswerRecord::getSessionId, session.getId())
                        .eq(AnswerRecord::getQuestionId, submitAnswerDTO.getQuestionId())
        );
        if (existingRecord != null) {
            throw new BusinessException(ErrorCode.ANSWER_ALREADY_SUBMITTED);
        }
        
        // 5. 创建答题记录
        AnswerRecord answerRecord = new AnswerRecord();
        answerRecord.setSessionId(session.getId());
        answerRecord.setQuestionId(submitAnswerDTO.getQuestionId());
        answerRecord.setQuestionType(question.getType());
        answerRecord.setQuestionContent(question.getTitle() + "\n" + question.getContent());
        answerRecord.setQuestionOptions(question.getOptions());
        answerRecord.setCorrectAnswer(question.getCorrectAnswer());
        answerRecord.setTimeSpentSeconds(submitAnswerDTO.getTimeSpentSeconds());
        answerRecord.setAnswerTime(LocalDateTime.now());
        
        // 6. 处理用户答案
        String userAnswer;
        if (submitAnswerDTO.getUserAnswerList() != null && !submitAnswerDTO.getUserAnswerList().isEmpty()) {
            // 多选题答案
            userAnswer = String.join(",", submitAnswerDTO.getUserAnswerList());
        } else {
            userAnswer = submitAnswerDTO.getUserAnswer();
        }
        answerRecord.setUserAnswer(userAnswer);
        
        // 7. 获取下一题序号
        Integer nextSequence = answerRecordMapper.getNextSequenceNumber(session.getId());
        answerRecord.setSequenceNumber(nextSequence);
        
        // 8. 自动评分
        autoScore(answerRecord, question);
        
        // 9. 保存答题记录
        save(answerRecord);
        
        // 10. 更新会话进度
        session.setCurrentCount(session.getCurrentCount() + 1);
        session.setCurrentScore(session.getCurrentScore() + answerRecord.getFinalScore());
        answerSessionService.updateById(session);
        answerSessionService.updateSessionProgress(session.getId());
        
        log.info("用户{}提交答案: 会话={}, 题目={}, 得分={}", 
                userId, submitAnswerDTO.getSessionCode(), submitAnswerDTO.getQuestionId(), answerRecord.getFinalScore());
        
        return answerRecord;
    }

    @Override
    public QuestionBank getNextQuestion(String sessionCode) {
        AnswerSession session = answerSessionService.getSessionByCode(sessionCode);
        
        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_FINISHED);
        }
        
        // 检查是否已完成所有题目
        if (session.getCurrentCount() >= session.getTotalCount()) {
            throw new BusinessException(ErrorCode.ANSWER_ALL_COMPLETED);
        }
        
        // 获取已答题目ID列表
        List<AnswerRecord> answeredRecords = answerRecordMapper.selectBySessionId(session.getId());
        List<Long> answeredQuestionIds = answeredRecords.stream()
                .map(AnswerRecord::getQuestionId)
                .collect(Collectors.toList());
        
        // 随机获取下一题（排除已答题目）
        List<QuestionBank> availableQuestions = questionBankService.getRandomQuestions(
                session.getQuestionType(), session.getTotalCount() - session.getCurrentCount() + 10);
        
        QuestionBank nextQuestion = availableQuestions.stream()
                .filter(q -> !answeredQuestionIds.contains(q.getId()))
                .findFirst()
                .orElse(null);
        
        if (nextQuestion == null) {
            throw new BusinessException(ErrorCode.ANSWER_NO_MORE_QUESTIONS);
        }
        
        return nextQuestion;
    }

    @Override
    public List<AnswerRecord> getSessionRecords(Long sessionId) {
        List<AnswerRecord> records = answerRecordMapper.selectBySessionId(sessionId);
        records.forEach(this::processAnswerRecord);
        return records;
    }

    @Override
    public IPage<AnswerRecord> getNeedScoringPage(int current, int size) {
        Page<AnswerRecord> page = new Page<>(current, size);
        IPage<AnswerRecord> result = answerRecordMapper.selectNeedScoringPage(page);
        
        result.getRecords().forEach(this::processAnswerRecord);
        return result;
    }

    @Override
    public boolean autoScore(AnswerRecord answerRecord, QuestionBank question) {
        Integer questionType = question.getType();
        
        // 主观题不自动评分
        if (questionType == 4 || questionType == 5) {
            answerRecord.setIsCorrect(null);
            answerRecord.setAutoScore(0);
            answerRecord.setFinalScore(0);
            return true;
        }
        
        String userAnswer = answerRecord.getUserAnswer();
        String correctAnswer = question.getCorrectAnswer();
        
        if (!StringUtils.hasText(userAnswer) || !StringUtils.hasText(correctAnswer)) {
            answerRecord.setIsCorrect(false);
            answerRecord.setAutoScore(0);
            answerRecord.setFinalScore(0);
            return true;
        }
        
        boolean isCorrect = false;
        
        switch (questionType) {
            case 1: // 单选题
            case 3: // 填空题
                isCorrect = userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
                break;
                
            case 2: // 多选题
                isCorrect = compareMultipleChoice(userAnswer, correctAnswer);
                break;
                
            default:
                isCorrect = false;
        }
        
        answerRecord.setIsCorrect(isCorrect);
        
        // 计算分数
        int score = isCorrect ? question.getScore() : 0;
        answerRecord.setAutoScore(score);
        answerRecord.setFinalScore(score);
        
        return true;
    }

    @Override
    public AnswerRecord getRecordDetail(Long recordId) {
        AnswerRecord record = getById(recordId);
        if (record == null) {
            throw new BusinessException(ErrorCode.ANSWER_RECORD_NOT_FOUND);
        }
        
        processAnswerRecord(record);
        return record;
    }

    @Override
    @Transactional
    public boolean batchAutoScore(Long sessionId) {
        List<AnswerRecord> records = answerRecordMapper.selectBySessionId(sessionId);
        
        for (AnswerRecord record : records) {
            if (record.getQuestionType() != 4 && record.getQuestionType() != 5) {
                QuestionBank question = questionBankService.getById(record.getQuestionId());
                if (question != null) {
                    autoScore(record, question);
                    updateById(record);
                }
            }
        }
        
        // 更新会话分数
        answerSessionService.updateSessionScore(sessionId);
        
        return true;
    }

    @Override
    public Object getSessionAnswerStats(Long sessionId) {
        return answerRecordMapper.getSessionAnswerStats(sessionId);
    }

    /**
     * 比较多选题答案
     */
    private boolean compareMultipleChoice(String userAnswer, String correctAnswer) {
        try {
            List<String> userAnswers = Arrays.asList(userAnswer.split(","))
                    .stream().map(String::trim).sorted().collect(Collectors.toList());
            
            List<String> correctAnswers;
            if (correctAnswer.startsWith("[") && correctAnswer.endsWith("]")) {
                // JSON格式的正确答案
                correctAnswers = objectMapper.readValue(correctAnswer, new TypeReference<List<String>>() {});
                correctAnswers = correctAnswers.stream().map(String::trim).sorted().collect(Collectors.toList());
            } else {
                // 逗号分隔的正确答案
                correctAnswers = Arrays.asList(correctAnswer.split(","))
                        .stream().map(String::trim).sorted().collect(Collectors.toList());
            }
            
            return userAnswers.equals(correctAnswers);
        } catch (Exception e) {
            log.warn("多选题答案比较失败: userAnswer={}, correctAnswer={}", userAnswer, correctAnswer, e);
            return false;
        }
    }

    /**
     * 处理答题记录扩展信息
     */
    private void processAnswerRecord(AnswerRecord record) {
        // 设置题型名称
        record.setQuestionTypeName(getQuestionTypeName(record.getQuestionType()));
        
        // 设置是否需要人工评分
        record.setNeedManualScore(record.getQuestionType() == 4 || record.getQuestionType() == 5);
        
        // 解析选项
        if (StringUtils.hasText(record.getQuestionOptions())) {
            try {
                List<String> optionList = objectMapper.readValue(record.getQuestionOptions(), new TypeReference<List<String>>() {});
                record.setOptionList(optionList);
            } catch (Exception e) {
                log.warn("解析题目选项失败: {}", e.getMessage());
            }
        }
        
        // 解析用户答案列表（多选题）
        if (StringUtils.hasText(record.getUserAnswer()) && record.getQuestionType() == 2) {
            try {
                List<String> userAnswerList = Arrays.asList(record.getUserAnswer().split(","))
                        .stream().map(String::trim).collect(Collectors.toList());
                record.setUserAnswerList(userAnswerList);
            } catch (Exception e) {
                log.warn("解析用户答案列表失败: {}", e.getMessage());
            }
        }
    }

    /**
     * 获取题型名称
     */
    private String getQuestionTypeName(Integer type) {
        switch (type) {
            case 1: return "单选题";
            case 2: return "多选题";
            case 3: return "填空题";
            case 4: return "简答题";
            case 5: return "评分题";
            default: return "未知";
        }
    }
} 