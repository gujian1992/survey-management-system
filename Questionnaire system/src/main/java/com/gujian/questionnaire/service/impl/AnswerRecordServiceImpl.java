package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.dto.BatchSubmitAnswerDTO;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

/**
 * 答题记录服务实现类
 */
@Slf4j
@Service
public class AnswerRecordServiceImpl extends ServiceImpl<AnswerRecordMapper, AnswerRecord>
        implements AnswerRecordService {

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
        AnswerRecord existingRecord = lambdaQuery()
                .eq(AnswerRecord::getSessionId, session.getId())
                .eq(AnswerRecord::getQuestionId, submitAnswerDTO.getQuestionId())
                .one();

        if (existingRecord != null) {
            // 如果是批量提交时遇到已提交的答案，返回已存在的记录
            log.info("题目{}已提交过答案，返回已存在记录", submitAnswerDTO.getQuestionId());
            return existingRecord;
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
        Integer nextSequence = baseMapper.getNextSequenceNumber(session.getId());
        answerRecord.setSequenceNumber(nextSequence);

        // 8. 自动评分
        autoScore(answerRecord, question);

        // 9. 保存答题记录
        save(answerRecord);

        // 10. 记录答题日志
        log.info("用户{}提交答案: 会话={}, 题目={}, 得分={}",
                userId, submitAnswerDTO.getSessionCode(), submitAnswerDTO.getQuestionId(),
                answerRecord.getFinalScore());

        return answerRecord;
    }

    @Override
    public QuestionBank getNextQuestion(String sessionCode) {
        AnswerSession session = answerSessionService.getSessionByCode(sessionCode);

        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_FINISHED);
        }

        // 获取已答题目ID列表
        List<AnswerRecord> answeredRecords = baseMapper.selectBySessionId(session.getId());

        // 检查是否已完成所有题目
        if (answeredRecords.size() >= session.getTotalCount()) {
            throw new BusinessException(ErrorCode.ANSWER_ALL_COMPLETED);
        }

        List<Long> answeredQuestionIds = answeredRecords.stream()
                .map(AnswerRecord::getQuestionId)
                .collect(Collectors.toList());

        // 随机获取下一题（排除已答题目）
        List<QuestionBank> availableQuestions = questionBankService.getRandomQuestions(
                session.getQuestionType(), session.getTotalCount() - answeredRecords.size() + 10);

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
        List<AnswerRecord> records = baseMapper.selectBySessionId(sessionId);
        records.forEach(this::processAnswerRecord);
        return records;
    }

    @Override
    public IPage<AnswerRecord> getNeedScoringPage(int current, int size) {
        Page<AnswerRecord> page = new Page<>(current, size);
        IPage<AnswerRecord> result = baseMapper.selectNeedScoringPage(page);

        result.getRecords().forEach(this::processAnswerRecord);
        return result;
    }

    @Override
    public boolean autoScore(AnswerRecord answerRecord, QuestionBank question) {
        Integer questionType = question.getType();

        // 简答题不自动评分（其他题型都可以自动评分）
        if (questionType == 4) {
            answerRecord.setIsCorrect(null);
            answerRecord.setAutoScore(0);
            answerRecord.setFinalScore(0);
            return true;
        }

        String userAnswer = answerRecord.getUserAnswer();
        String correctAnswer = question.getCorrectAnswer();

        // 添加调试日志
        log.info("自动评分 - 题目ID: {}, 题型: {}, 用户答案: '{}', 正确答案: '{}'",
                question.getId(), questionType, userAnswer, correctAnswer);

        if (!StringUtils.hasText(userAnswer) || !StringUtils.hasText(correctAnswer)) {
            answerRecord.setIsCorrect(false);
            answerRecord.setAutoScore(0);
            answerRecord.setFinalScore(0);
            return true;
        }

        boolean isCorrect = false;

        switch (questionType) {
            case 1: // 单选题
                isCorrect = compareSingleChoice(userAnswer, correctAnswer, question);
                break;
            case 2: // 多选题
                isCorrect = compareMultipleChoice(userAnswer, correctAnswer, question);
                break;
            case 3: // 填空题
                isCorrect = compareFillBlank(userAnswer, correctAnswer);
                break;
            case 5: // 评分题（类似单选题）
                isCorrect = compareSingleChoice(userAnswer, correctAnswer, question);
                break;
            default:
                return false;
        }

        log.info("自动评分结果 - 题目ID: {}, 是否正确: {}", question.getId(), isCorrect);

        answerRecord.setIsCorrect(isCorrect);
        answerRecord.setAutoScore(isCorrect ? question.getScore() : 0);
        answerRecord.setFinalScore(answerRecord.getAutoScore());

        return true;
    }

    @Override
    public AnswerRecord getRecordDetail(Long recordId) {
        AnswerRecord record = getById(recordId);
        if (record != null) {
            processAnswerRecord(record);
        }
        return record;
    }

    @Override
    @Transactional
    public boolean batchAutoScore(Long sessionId) {
        List<AnswerRecord> records = baseMapper.selectBySessionId(sessionId);
        for (AnswerRecord record : records) {
            if (record.getQuestionType() == 4) { // 只跳过简答题
                continue;
            }
            QuestionBank question = questionBankService.getQuestionDetail(record.getQuestionId());
            if (question != null) {
                autoScore(record, question);
                updateById(record);
            }
        }
        return true;
    }

    @Override
    public Object getSessionAnswerStats(Long sessionId) {
        return baseMapper.getSessionAnswerStats(sessionId);
    }

    @Override
    @Transactional
    public List<AnswerRecord> batchSubmitAnswers(BatchSubmitAnswerDTO batchSubmitDTO, Long userId) {
        // 1. 验证会话
        AnswerSession session = answerSessionService.getSessionByCode(batchSubmitDTO.getSessionCode());
        if (!session.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.SESSION_PERMISSION_DENIED);
        }

        if (session.getStatus() != 1) {
            throw new BusinessException(ErrorCode.ANSWER_SESSION_FINISHED);
        }

        // 2. 检查是否超时
        if (answerSessionService.checkSessionTimeout(batchSubmitDTO.getSessionCode())) {
            throw new BusinessException(ErrorCode.SESSION_TIMEOUT);
        }

        List<AnswerRecord> records = new ArrayList<>();

        // 3. 批量处理每道题的答案
        for (BatchSubmitAnswerDTO.AnswerDTO answerDTO : batchSubmitDTO.getAnswers()) {
            // 验证题目
            QuestionBank question = questionBankService.getQuestionDetail(answerDTO.getQuestionId());
            if (question == null) {
                throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
            }

            // 检查是否已答过此题
            AnswerRecord existingRecord = lambdaQuery()
                    .eq(AnswerRecord::getSessionId, session.getId())
                    .eq(AnswerRecord::getQuestionId, answerDTO.getQuestionId())
                    .one();

            if (existingRecord != null) {
                records.add(existingRecord);
                continue;
            }

            // 创建答题记录
            AnswerRecord answerRecord = new AnswerRecord();
            answerRecord.setSessionId(session.getId());
            answerRecord.setQuestionId(answerDTO.getQuestionId());
            answerRecord.setQuestionType(question.getType());
            answerRecord.setQuestionContent(question.getTitle() + "\n" + question.getContent());
            answerRecord.setQuestionOptions(question.getOptions());
            answerRecord.setCorrectAnswer(question.getCorrectAnswer());
            answerRecord.setTimeSpentSeconds(answerDTO.getTimeSpentSeconds());
            answerRecord.setAnswerTime(LocalDateTime.now());
            answerRecord.setUserAnswer(answerDTO.getUserAnswer());

            // 获取序号
            Integer nextSequence = baseMapper.getNextSequenceNumber(session.getId());
            answerRecord.setSequenceNumber(nextSequence);

            // 自动评分
            autoScore(answerRecord, question);

            // 保存答题记录
            save(answerRecord);
            records.add(answerRecord);
        }

        log.info("用户{}批量提交答案: 会话={}, 题目数量={}",
                userId, batchSubmitDTO.getSessionCode(), records.size());

        return records;
    }

    private boolean compareMultipleChoice(String userAnswer, String correctAnswer, QuestionBank question) {
        if (userAnswer == null || correctAnswer == null) {
            return false;
        }

        List<String> userAnswers = Arrays.asList(userAnswer.trim().split(","));
        List<String> correctAnswers = Arrays.asList(correctAnswer.trim().split(","));

        // 去除空格并排序
        userAnswers = userAnswers.stream().map(String::trim).sorted().collect(Collectors.toList());
        correctAnswers = correctAnswers.stream().map(String::trim).sorted().collect(Collectors.toList());

        // 方法1: 直接比较（忽略大小写）
        if (userAnswers.size() == correctAnswers.size()) {
            boolean directMatch = true;
            for (int i = 0; i < userAnswers.size(); i++) {
                if (!userAnswers.get(i).equalsIgnoreCase(correctAnswers.get(i))) {
                    directMatch = false;
                    break;
                }
            }
            if (directMatch) {
                return true;
            }
        }

        // 方法2: 智能转换比较（处理字母格式 vs 选项内容格式）
        List<String> options = new ArrayList<>();
        if (StringUtils.hasText(question.getOptions())) {
            try {
                options = objectMapper.readValue(
                        question.getOptions(),
                        new TypeReference<List<String>>() {
                        });

                // 转换用户答案为统一格式（都转换为字母）
                Set<String> userLetters = convertToLetters(userAnswers, options);
                Set<String> correctLetters = convertToLetters(correctAnswers, options);

                return userLetters.equals(correctLetters);

            } catch (Exception e) {
                log.error("解析题目选项失败: {}", e.getMessage());
            }
        }

        return false;
    }

    private Set<String> convertToLetters(List<String> answers, List<String> options) {
        Set<String> letters = new HashSet<>();

        for (String answer : answers) {
            String trimmed = answer.trim();

            // 如果已经是字母格式
            if (trimmed.matches("^[A-Za-z]$")) {
                letters.add(trimmed.toUpperCase());
            } else {
                // 如果是选项内容，找到对应的字母
                for (int i = 0; i < options.size(); i++) {
                    if (options.get(i).trim().equalsIgnoreCase(trimmed)) {
                        letters.add(String.valueOf((char) ('A' + i)));
                        break;
                    }
                }
            }
        }

        return letters;
    }

    private boolean compareFillBlank(String userAnswer, String correctAnswer) {
        if (!StringUtils.hasText(userAnswer) || !StringUtils.hasText(correctAnswer)) {
            return false;
        }

        String userTrimmed = userAnswer.trim();
        String correctTrimmed = correctAnswer.trim();

        // 方法1: 忽略大小写的完全匹配
        if (userTrimmed.equalsIgnoreCase(correctTrimmed)) {
            return true;
        }

        // 方法2: 支持多个正确答案（用分隔符分开）
        String[] correctAnswers = correctTrimmed.split("[,，;；|、]");
        for (String correct : correctAnswers) {
            if (userTrimmed.equalsIgnoreCase(correct.trim())) {
                return true;
            }
        }

        // 方法3: 多答案对比（用户答案和正确答案都可能包含多个部分）
        if (correctAnswers.length > 1) {
            String[] userAnswers = userTrimmed.split("[,，;；|、]");
            if (userAnswers.length > 1) {
                // 将两边的答案都转换为标准化的集合进行比较
                Set<String> userSet = Arrays.stream(userAnswers)
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());

                Set<String> correctSet = Arrays.stream(correctAnswers)
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());

                if (userSet.equals(correctSet)) {
                    return true;
                }
            }
        }

        // 方法4: 数字答案的相等性检查（忽略前导零等）
        try {
            double userNum = Double.parseDouble(userTrimmed);
            double correctNum = Double.parseDouble(correctTrimmed);
            return Math.abs(userNum - correctNum) < 0.0001; // 允许微小的浮点误差
        } catch (NumberFormatException e) {
            // 不是数字，继续其他检查
        }

        return false;
    }

    private boolean compareSingleChoice(String userAnswer, String correctAnswer, QuestionBank question) {
        if (!StringUtils.hasText(userAnswer) || !StringUtils.hasText(correctAnswer)) {
            return false;
        }

        String userOption = userAnswer.trim();
        String correctOption = correctAnswer.trim();

        // 方法1: 直接比较（最常见情况）
        if (userOption.equalsIgnoreCase(correctOption)) {
            return true;
        }

        // 方法2: 字母与选项内容的智能转换比较
        List<String> options = new ArrayList<>();
        if (StringUtils.hasText(question.getOptions())) {
            try {
                options = objectMapper.readValue(
                        question.getOptions(),
                        new TypeReference<List<String>>() {
                        });

                // 如果用户答案是字母格式（A, B, C...）
                if (userOption.matches("^[A-Za-z]$")) {
                    int optionIndex = userOption.toUpperCase().charAt(0) - 'A';
                    if (optionIndex >= 0 && optionIndex < options.size()) {
                        String optionContent = options.get(optionIndex).trim();
                        if (optionContent.equalsIgnoreCase(correctOption)) {
                            return true;
                        }
                    }
                }

                // 如果正确答案是字母格式，用户答案是内容格式
                if (correctOption.matches("^[A-Za-z]$")) {
                    int correctIndex = correctOption.toUpperCase().charAt(0) - 'A';
                    if (correctIndex >= 0 && correctIndex < options.size()) {
                        String correctContent = options.get(correctIndex).trim();
                        if (correctContent.equalsIgnoreCase(userOption)) {
                            return true;
                        }
                    }
                }

                // 如果都是内容格式，通过选项列表找到对应的字母进行比较
                int userIndex = -1, correctIndex = -1;
                for (int i = 0; i < options.size(); i++) {
                    if (options.get(i).trim().equalsIgnoreCase(userOption)) {
                        userIndex = i;
                    }
                    if (options.get(i).trim().equalsIgnoreCase(correctOption)) {
                        correctIndex = i;
                    }
                }
                if (userIndex >= 0 && correctIndex >= 0 && userIndex == correctIndex) {
                    return true;
                }

            } catch (Exception e) {
                log.error("解析题目选项失败: {}", e.getMessage());
            }
        }

        return false;
    }

    private void processAnswerRecord(AnswerRecord record) {
        if (record == null)
            return;

        // 设置题型名称
        record.setQuestionTypeName(getQuestionTypeName(record.getQuestionType()));

        // 处理选项
        if (StringUtils.hasText(record.getQuestionOptions())) {
            try {
                List<String> options = objectMapper.readValue(
                        record.getQuestionOptions(),
                        new TypeReference<List<String>>() {
                        });
                record.setOptionList(options);
            } catch (Exception e) {
                log.error("解析题目选项失败: {}", e.getMessage());
            }
        }

        // 处理多选题答案
        if (record.getQuestionType() == 2) {
            if (StringUtils.hasText(record.getUserAnswer())) {
                record.setUserAnswerList(Arrays.asList(record.getUserAnswer().split(",")));
            }
        }
    }

    private String getQuestionTypeName(Integer type) {
        switch (type) {
            case 1:
                return "单选题";
            case 2:
                return "多选题";
            case 3:
                return "填空题";
            case 4:
                return "简答题";
            case 5:
                return "评分题";
            default:
                return "未知题型";
        }
    }
}