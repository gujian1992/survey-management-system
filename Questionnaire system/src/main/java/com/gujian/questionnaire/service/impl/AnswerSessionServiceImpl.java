package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.mapper.AnswerSessionMapper;
import com.gujian.questionnaire.mapper.AnswerRecordMapper;
import com.gujian.questionnaire.mapper.QuestionBankMapper;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.QuestionBankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gujian.questionnaire.security.UserPrincipal;
import com.gujian.questionnaire.utils.UserContextUtils;
import com.gujian.questionnaire.dto.SessionStatusVO;
import com.gujian.questionnaire.dto.QuestionVO;
import com.gujian.questionnaire.utils.JsonUtils;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

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

    @Autowired
    private UserContextUtils userContextUtils;

    @Autowired
    private AnswerRecordMapper answerRecordMapper;

    @Autowired
    private QuestionBankMapper questionBankMapper;

    @Override
    @Transactional
    public AnswerSession startAnswerSession(StartAnswerDTO startAnswerDTO, Long userId) {
        // 检查是否有进行中的会话
        AnswerSession existingSession = getCurrentSession(userId);
        if (existingSession != null) {
            // 如果存在进行中的会话，直接将其标记为已放弃
            existingSession.setStatus(4); // 已放弃
            existingSession.setEndTime(LocalDateTime.now());
            updateById(existingSession);
            log.info("用户{}开始新会话，自动放弃旧会话: {}", userId, existingSession.getSessionCode());
        }
        
        // 检查题库中是否有足够的题目
        List<QuestionBank> availableQuestions = questionBankService.getRandomQuestionsFromTypes(
            startAnswerDTO.getQuestionTypes(), startAnswerDTO.getQuestionCount());
        
        if (availableQuestions.size() < startAnswerDTO.getQuestionCount()) {
            throw new BusinessException(ErrorCode.SESSION_INSUFFICIENT_QUESTIONS, "题库中可用题目不足");
        }
        
        // 创建新会话
        AnswerSession session = new AnswerSession();
        session.setUserId(userId);
        session.setSessionCode(generateSessionCode());
        session.setQuestionType(0); // 使用0表示混合题型
        
        // 将题目ID列表存储到questionTypes字段（重用该字段）
        List<Integer> questionIds = availableQuestions.stream()
                .map(q -> q.getId().intValue())
                .collect(Collectors.toList());
        session.setQuestionTypes(questionIds);
        
        session.setTotalCount(startAnswerDTO.getQuestionCount());
        // session.setCurrentCount(0); // 移除，改为前端计算
        session.setTimeoutMinutes(startAnswerDTO.getTimeoutMinutes());
        session.setStartTime(LocalDateTime.now());
        // session.setLastActivityTime(LocalDateTime.now()); // 移除实时状态跟踪
        session.setStatus(1); // 进行中
        
        // 计算理论总分
        int totalScore = availableQuestions.stream().mapToInt(QuestionBank::getScore).sum();
        session.setTotalScore(totalScore);
        
        save(session);
        
        log.info("用户{}开始答题会话: {}", userId, session.getSessionCode());
        return session;
    }

    @Override
    public AnswerSession getCurrentSession(Long userId) {
        // 查找用户最近的进行中会话
        QueryWrapper<AnswerSession> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("status", 1) // 进行中
                   .orderByDesc("start_time")
                   .last("LIMIT 1");
        
        AnswerSession session = getOne(queryWrapper);
        
        // 如果找到了会话，检查是否已超时
        if (session != null) {
            LocalDateTime now = LocalDateTime.now();
            long timeSinceStart = java.time.Duration.between(session.getStartTime(), now).toMinutes();
            
            // 如果已超时，自动更新状态
            if (session.getTimeoutMinutes() != null && timeSinceStart > session.getTimeoutMinutes()) {
                session.setStatus(3); // 已超时
                session.setEndTime(now);
                updateById(session);
                return null; // 返回null表示没有可用的会话
            }
        }
        
        return session;
    }

    // 移除复杂的状态管理方法
    // @Override
    // public void saveSessionState(Long userId, Map<String, Object> stateData) {
    //     // 改为前端状态管理，不需要后端持久化
    // }

    // @Override
    // public void updateLastActivityTime(String sessionCode) {
    //     // 移除实时活动时间跟踪，简化状态管理
    // }

    @Override
    public AnswerSession getSessionByCode(String sessionCode) {
        QueryWrapper<AnswerSession> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("session_code", sessionCode);
        
        AnswerSession session = getOne(queryWrapper);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }
        
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
        return updateById(session);
    }

    @Override
    public void abandonSession(String sessionCode) {
        updateSessionStatus(sessionCode, 4); // 更新状态为已放弃
    }

    @Override
    public void abandonSession(Integer sessionId) {
        AnswerSession session = getById(sessionId);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }
        updateSessionStatus(session.getSessionCode(), 4); // 更新状态为已放弃
    }

    @Override
    public void updateSessionStatus(String sessionCode, Integer status) {
        // 获取会话
        AnswerSession session = getSessionByCode(sessionCode);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }
        
        // 状态流转检查
        if (!isValidStatusTransition(session.getStatus(), status)) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION);
        }
        
        // 更新状态
        session.setStatus(status);
        if (status == 2 || status == 3 || status == 4 || status == 5) { // 已完成/已超时/已放弃/异常结束
            session.setEndTime(LocalDateTime.now());
        }
        updateById(session);
        
        log.info("更新会话{}状态: {} -> {}", sessionCode, session.getStatus(), status);
    }

    @Override
    public IPage<AnswerSession> getUserSessionPage(int current, int size, Long userId, Integer status) {
        Page<AnswerSession> page = new Page<>(current, size);
        return answerSessionMapper.selectSessionPage(page, userId, status, null);
    }

    @Override
    public IPage<AnswerSession> getAllSessionPage(int current, int size, String userName, Integer status, String startTime, String endTime) {
        Page<AnswerSession> page = new Page<>(current, size);
        return answerSessionMapper.selectSessionPageWithFilters(page, userName, status, startTime, endTime);
    }

    @Override
    public Object getUserStats(Long userId) {
        return answerSessionMapper.getUserStats(userId);
    }

    @Override
    public AnswerSession getSessionById(Integer id) {
        return getById(id);
    }

    // 移除单题提交方法，改为批量提交
    // @Override
    // public void submitAnswer(Integer sessionId, SubmitAnswerDTO submitAnswerDTO) {
    //     // 改为前端管理进度，最终批量提交答案
    // }

    // 移除复杂的实时状态管理方法
    // @Override
    // public Map<String, Object> processHeartbeat(Integer sessionId, Long userId, Map<String, Object> heartbeatData) {
    //     // 移除心跳机制，简化状态管理
    // }

    // @Override
    // public void markAbnormalExit(Integer sessionId, Long userId, Map<String, Object> exitData) {
    //     // 简化异常处理
    // }

    // @Override
    // public boolean updateSessionProgress(Long sessionId) {
    //     // 改为前端计算进度
    // }

    @Override
    public boolean checkSessionTimeout(String sessionCode) {
        AnswerSession session = getSessionByCode(sessionCode);
        if (session == null || session.getStatus() != 1) {
            return true;
        }
        
        LocalDateTime now = LocalDateTime.now();
        long timeSinceStart = java.time.Duration.between(session.getStartTime(), now).toMinutes();
        
        return session.getTimeoutMinutes() != null && timeSinceStart > session.getTimeoutMinutes();
    }

    @Override
    public boolean extendSession(String sessionCode, Integer extendMinutes) {
        if (extendMinutes <= 0) {
            throw new BusinessException(ErrorCode.PARAMETER_INVALID, "延长时间必须大于0");
        }
        
        AnswerSession session = getSessionByCode(sessionCode);
        if (session == null || session.getStatus() != 1) {
            return false;
        }
        
        session.setTimeoutMinutes(session.getTimeoutMinutes() + extendMinutes);
        return updateById(session);
    }

    @Override
    public boolean forceCompleteSession(String sessionCode) {
        AnswerSession session = getSessionByCode(sessionCode);
        if (session == null) {
            return false;
        }
        
        session.setStatus(2); // 已完成
        session.setEndTime(LocalDateTime.now());
        return updateById(session);
    }

    @Override
    public int batchCheckTimeout() {
        LocalDateTime now = LocalDateTime.now();
        
        // 查找所有可能超时的会话
        QueryWrapper<AnswerSession> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 1) // 进行中
                   .isNotNull("timeout_minutes")
                   .lt("start_time", now.minusMinutes(1440)); // 最多查找24小时前的会话
        
        List<AnswerSession> sessions = list(queryWrapper);
        int count = 0;
        
        for (AnswerSession session : sessions) {
            long timeSinceStart = java.time.Duration.between(session.getStartTime(), now).toMinutes();
            if (timeSinceStart > session.getTimeoutMinutes()) {
                session.setStatus(3); // 已超时
                session.setEndTime(now);
                updateById(session);
                count++;
            }
        }
        
        return count;
    }

    @Override
    public AnswerSession resumeSession(String sessionCode) {
        AnswerSession session = getSessionByCode(sessionCode);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }
        
        // 只有异常结束的会话可以恢复
        if (session.getStatus() != 5) {
            throw new BusinessException(ErrorCode.SESSION_CANNOT_RESUME);
        }
        
        // 检查是否已超时
        LocalDateTime now = LocalDateTime.now();
        long timeSinceStart = java.time.Duration.between(session.getStartTime(), now).toMinutes();
        if (session.getTimeoutMinutes() != null && timeSinceStart > session.getTimeoutMinutes()) {
            session.setStatus(3); // 已超时
            updateById(session);
            throw new BusinessException(ErrorCode.SESSION_TIMEOUT);
        }
        
        // 恢复会话
        session.setStatus(1); // 进行中
        // session.setLastActivityTime(now); // 移除lastActivityTime字段
        updateById(session);
        
        return session;
    }

    @Override
    public boolean updateSessionScore(Long sessionId) {
        AnswerSession session = getById(sessionId);
        if (session == null) {
            return false;
        }

        // 计算总分
        List<AnswerRecord> records = answerRecordMapper.selectBySessionId(sessionId);
        int totalScore = records.stream()
                .mapToInt(AnswerRecord::getFinalScore)
                .sum();

        // 更新会话分数
        session.setFinalScore(totalScore);
        // session.setLastActivityTime(LocalDateTime.now()); // 移除lastActivityTime字段
        return updateById(session);
    }

    /**
     * 检查状态流转是否有效
     */
    private boolean isValidStatusTransition(Integer currentStatus, Integer newStatus) {
        // 未开始 -> 进行中
        if (currentStatus == 0 && newStatus == 1) return true;
        
        // 进行中 -> 已完成/已超时/已放弃/异常结束
        if (currentStatus == 1 && (newStatus == 2 || newStatus == 3 || newStatus == 4 || newStatus == 5)) return true;
        
        // 其他所有状态流转都是无效的
        return false;
    }

    /**
     * 生成会话编码
     */
    private String generateSessionCode() {
        return "S" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * 计算剩余时间（分钟）
     */
    private long calculateTimeRemaining(AnswerSession session) {
        if (session.getTimeoutMinutes() == null) {
            return -1; // 无限时间
        }
        
        LocalDateTime now = LocalDateTime.now();
        long timeSinceStart = java.time.Duration.between(session.getStartTime(), now).toMinutes();
        long remaining = session.getTimeoutMinutes() - timeSinceStart;
        
        return Math.max(0, remaining);
    }

    /**
     * 获取会话状态
     */
    @Override
    public SessionStatusVO getSessionStatus(String sessionCode) {
        try {
            // 获取会话信息
            AnswerSession session = answerSessionMapper.selectBySessionCode(sessionCode);
            if (session == null) {
                throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
            }

            // 计算剩余时间
            int remainingTime = 0;
            if (session.getTimeoutMinutes() != null) {
                long usedTime = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
                int timeoutSeconds = session.getTimeoutMinutes() * 60;
                remainingTime = (int) Math.max(0, timeoutSeconds - usedTime);
            }

            // 构建返回对象（简化版本）
            return SessionStatusVO.builder()
                    .totalQuestions(session.getTotalCount() != null ? session.getTotalCount() : 0)
                    .remainingTime(remainingTime)
                    .status(session.getStatus() != null ? session.getStatus().toString() : "0")
                    .startTime(session.getStartTime().toEpochSecond(java.time.ZoneOffset.of("+8")) * 1000)
                    .timeoutMinutes(session.getTimeoutMinutes())
                    .build();
        } catch (Exception e) {
            log.error("获取会话状态失败: sessionCode={}, error={}", sessionCode, e.getMessage(), e);
            throw new BusinessException(ErrorCode.SESSION_STATUS_ERROR, "获取会话状态失败");
        }
    }

    /**
     * 获取指定题目
     */
    @Override
    public QuestionVO getQuestionByIndex(String sessionCode, Integer index) {
        log.info("获取题目: sessionCode={}, index={}", sessionCode, index);
        
        // 获取会话信息
        AnswerSession session = answerSessionMapper.selectBySessionCode(sessionCode);
        if (session == null) {
            log.error("会话不存在: sessionCode={}", sessionCode);
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }

        log.info("会话信息: id={}, questionTypes={}, totalCount={}", 
                session.getId(), 
                session.getQuestionTypes(), 
                session.getTotalCount());

        // 检查题目索引
        if (index < 0 || session.getTotalCount() == null || index >= session.getTotalCount()) {
            log.error("题目索引无效: index={}, totalCount={}", index, session.getTotalCount());
            throw new BusinessException(ErrorCode.INVALID_QUESTION_INDEX);
        }

        // 获取题目信息
        List<Integer> questionTypes = session.getQuestionTypes();
        log.info("从实体类获取的题目列表: {}", questionTypes);

        // 如果 JacksonTypeHandler 没有正确解析，手动解析 JSON 字符串
        if (questionTypes == null || questionTypes.isEmpty()) {
            // 尝试从 stateData 中获取题目列表
            Map<String, Object> stateData = session.getStateData();
            if (stateData != null && stateData.containsKey("questionTypes")) {
                Object questionTypesObj = stateData.get("questionTypes");
                if (questionTypesObj instanceof List) {
                    questionTypes = (List<Integer>) questionTypesObj;
                    log.info("从 stateData 中获取到题目列表: {}", questionTypes);
                }
            }
            
            // 如果还是空，直接查询数据库原始字段值并手动解析
            if (questionTypes == null || questionTypes.isEmpty()) {
                log.warn("JacksonTypeHandler 解析失败，尝试手动解析 JSON");
                String questionTypesJson = answerSessionMapper.selectQuestionTypesJson(sessionCode);
                log.info("从数据库获取的原始 JSON: {}", questionTypesJson);
                
                if (questionTypesJson != null && !questionTypesJson.trim().isEmpty()) {
                    try {
                        questionTypes = JsonUtils.parseList(questionTypesJson, Integer.class);
                        log.info("手动解析后的题目列表: {}", questionTypes);
                    } catch (Exception e) {
                        log.error("手动解析 JSON 失败: {}", e.getMessage(), e);
                    }
                }
            }
            
            if (questionTypes == null || questionTypes.isEmpty()) {
                log.error("会话题目列表为空: sessionCode={}", sessionCode);
                throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
            }
        }

        if (index >= questionTypes.size()) {
            log.error("题目索引超出范围: index={}, size={}", index, questionTypes.size());
            throw new BusinessException(ErrorCode.INVALID_QUESTION_INDEX);
        }

        Integer questionId = questionTypes.get(index);
        log.info("获取到的题目ID: {}", questionId);

        if (questionId == null) {
            log.error("题目ID为空: index={}", index);
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }

        QuestionBank question = questionBankMapper.selectById(questionId);
        log.info("查询到的题目: {}", question);

        if (question == null) {
            log.error("题目不存在: questionId={}", questionId);
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }

        // 构建返回对象
        return QuestionVO.builder()
                .id(question.getId())
                .title(question.getTitle())
                .content(question.getContent())
                .description(question.getContent()) // 使用 content 作为 description
                .type(String.valueOf(question.getType()))
                .options(JsonUtils.parseList(question.getOptions(), String.class))
                .score(question.getScore())
                .difficulty(question.getDifficulty())
                .explanation(question.getExplanation())
                .build();
    }

    /**
     * 完成会话
     */
    @Override
    public void finishSession(String sessionCode) {
        // 获取会话信息
        AnswerSession session = answerSessionMapper.selectBySessionCode(sessionCode);
        if (session == null) {
            throw new BusinessException(ErrorCode.SESSION_NOT_FOUND);
        }

        // 检查会话状态
        if (session.getStatus() == 2) {
            throw new BusinessException(ErrorCode.SESSION_ALREADY_FINISHED);
        }

        // 更新会话状态
        session.setStatus(2); // 已完成
        session.setEndTime(LocalDateTime.now());
        answerSessionMapper.updateById(session);
    }
} 