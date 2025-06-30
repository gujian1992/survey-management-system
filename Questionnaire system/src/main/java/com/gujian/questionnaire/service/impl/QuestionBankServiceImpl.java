package com.gujian.questionnaire.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.mapper.QuestionBankMapper;
import com.gujian.questionnaire.service.QuestionBankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 题库服务实现类
 */
@Slf4j
@Service
public class QuestionBankServiceImpl extends ServiceImpl<QuestionBankMapper, QuestionBank> implements QuestionBankService {

    @Autowired
    private QuestionBankMapper questionBankMapper;
    
    @Autowired
    private ObjectMapper objectMapper;


    
    @Override
    public IPage<QuestionBank> getQuestionPage(int current, int size, Integer type, Integer status, 
                                              Integer difficulty, Integer priority, String keyword) {
        Page<QuestionBank> page = new Page<>(current, size);
        IPage<QuestionBank> result = questionBankMapper.selectQuestionPage(page, type, status, difficulty, priority, keyword);
        
        // 处理选项和类型名称
        result.getRecords().forEach(this::processQuestionInfo);
        
        return result;
    }

    @Override
    public List<QuestionBank> getRandomQuestions(Integer type, Integer count) {
        if (count <= 0 || count > 50) {
            throw new BusinessException(ErrorCode.QUESTION_COUNT_INVALID);
        }
        
        List<QuestionBank> questions = questionBankMapper.selectRandomQuestions(type, count);
        questions.forEach(this::processQuestionInfo);
        
        return questions;
    }

    @Override
    public List<QuestionBank> getRandomQuestionsFromTypes(List<Integer> types, Integer count) {
        if (types == null || types.isEmpty() || count == null || count <= 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "参数无效");
        }
        
        // 使用新的Mapper方法直接获取随机题目
        List<QuestionBank> questions = questionBankMapper.selectRandomQuestionsFromTypes(types, count);
        
        // 处理题目信息
        questions.forEach(this::processQuestionInfo);
        
        return questions;
    }

    @Override
    @Transactional
    public boolean createQuestion(QuestionBank question, Long creatorId) {
        validateQuestion(question);
        
        question.setCreatorId(creatorId);
        question.setCreateTime(LocalDateTime.now());
        question.setUpdateTime(LocalDateTime.now());
        
        return save(question);
    }

    @Override
    @Transactional
    public boolean updateQuestion(QuestionBank question, Long updaterId) {
        validateQuestion(question);
        
        QuestionBank existing = getById(question.getId());
        if (existing == null) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        
        question.setUpdateTime(LocalDateTime.now());
        
        return updateById(question);
    }

    @Override
    @Transactional
    public boolean deleteQuestion(Long id) {
        QuestionBank question = getById(id);
        if (question == null) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        
        // 使用MyBatis Plus的逻辑删除功能
        return removeById(id);
    }

    @Override
    @Transactional
    public boolean batchDeleteQuestions(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMETER_INVALID, "请选择要删除的题目");
        }
        
        // 使用MyBatis Plus的批量逻辑删除功能
        return removeByIds(ids);
    }

    @Override
    @Transactional
    public boolean toggleQuestionStatus(Long id, Integer status) {
        QuestionBank question = getById(id);
        if (question == null) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        
        question.setStatus(status);
        question.setUpdateTime(LocalDateTime.now());
        
        return updateById(question);
    }

    @Override
    public Object getQuestionStats() {
        return questionBankMapper.getQuestionStats();
    }
    
    @Override
    public Object getQuestionTypeStats() {
        try {
            // 获取基础统计信息
            Map<String, Object> basicStats = questionBankMapper.getQuestionStats();
            
            // 获取各题型详细统计
            Map<String, Object> result = new HashMap<>();
            result.put("total", basicStats.get("total"));
            
            // 构建题型统计数组
            List<Map<String, Object>> typeStats = new ArrayList<>();
            typeStats.add(createTypeStats(1, basicStats.get("single_choice")));
            typeStats.add(createTypeStats(2, basicStats.get("multiple_choice")));
            typeStats.add(createTypeStats(3, basicStats.get("fill_blank")));
            typeStats.add(createTypeStats(4, basicStats.get("essay")));
            typeStats.add(createTypeStats(5, basicStats.get("rating")));
            
            // 过滤掉数量为0的题型
            typeStats = typeStats.stream()
                .filter(stat -> ((Number)stat.get("count")).intValue() > 0)
                .collect(Collectors.toList());
            
            result.put("typeStats", typeStats);
            
            log.info("题型统计结果: {}", result);
            
            return result;
        } catch (Exception e) {
            log.error("获取题型统计失败", e);
            // 返回默认数据
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("typeStats", new ArrayList<>());
            return result;
        }
    }
    
    /**
     * 创建题型统计数据
     */
    private Map<String, Object> createTypeStats(int type, Object count) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("type", type);
        stats.put("count", count == null ? 0 : ((Number)count).intValue());
        return stats;
    }

    @Override
    public QuestionBank getQuestionDetail(Long id) {
        QuestionBank question = getById(id);
        if (question == null) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        
        processQuestionInfo(question);
        return question;
    }

    /**
     * 处理题目信息（解析选项、设置类型名称等）
     */
    private void processQuestionInfo(QuestionBank question) {
        // 解析选项
        if (StringUtils.hasText(question.getOptions())) {
            try {
                List<String> optionList = objectMapper.readValue(question.getOptions(), new TypeReference<List<String>>() {});
                question.setOptionList(optionList);
            } catch (Exception e) {
                log.warn("解析题目选项失败: {}", e.getMessage());
            }
        }
        
        // 设置类型名称
        question.setTypeName(getTypeName(question.getType()));
        
        // 设置难度名称
        question.setDifficultyName(getDifficultyName(question.getDifficulty()));
    }

    /**
     * 验证题目数据
     */
    private void validateQuestion(QuestionBank question) {
        if (!StringUtils.hasText(question.getTitle())) {
            throw new BusinessException(ErrorCode.QUESTION_TITLE_EMPTY);
        }
        
        if (question.getType() == null || question.getType() < 1 || question.getType() > 5) {
            throw new BusinessException(ErrorCode.QUESTION_TYPE_INVALID);
        }
        
        if (question.getScore() == null || question.getScore() < 1) {
            throw new BusinessException(ErrorCode.QUESTION_SCORE_INVALID);
        }
        
        // 验证优先级字段
        if (question.getPriority() == null || question.getPriority() < 1 || question.getPriority() > 3) {
            question.setPriority(2); // 设置默认优先级为中等
        }
        
        // 验证难度字段
        if (question.getDifficulty() == null || question.getDifficulty() < 1 || question.getDifficulty() > 3) {
            question.setDifficulty(1); // 设置默认难度为简单
        }
        
        // 选择题必须有选项
        if ((question.getType() == 1 || question.getType() == 2 || question.getType() == 5) && 
            !StringUtils.hasText(question.getOptions())) {
            throw new BusinessException(ErrorCode.QUESTION_OPTIONS_REQUIRED);
        }
        
        // 客观题必须有正确答案
        if ((question.getType() == 1 || question.getType() == 2 || question.getType() == 3) && 
            !StringUtils.hasText(question.getCorrectAnswer())) {
            throw new BusinessException(ErrorCode.QUESTION_ANSWER_REQUIRED);
        }
    }

    /**
     * 获取题型名称
     */
    private String getTypeName(Integer type) {
        switch (type) {
            case 1: return "单选题";
            case 2: return "多选题";
            case 3: return "填空题";
            case 4: return "简答题";
            case 5: return "评分题";
            default: return "未知";
        }
    }

    /**
     * 获取难度名称
     */
    private String getDifficultyName(Integer difficulty) {
        switch (difficulty) {
            case 1: return "简单";
            case 2: return "中等";
            case 3: return "困难";
            default: return "未知";
        }
    }

    @Override
    public IPage<QuestionBank> getQuestionPage(int current, int size, String keyword, Integer type) {
        Page<QuestionBank> page = new Page<>(current, size);
        LambdaQueryWrapper<QuestionBank> queryWrapper = new LambdaQueryWrapper<>();
        
        // 添加查询条件
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryWrapper.like(QuestionBank::getContent, keyword.trim())
                       .or()
                       .like(QuestionBank::getOptions, keyword.trim());
        }
        
        if (type != null) {
            queryWrapper.eq(QuestionBank::getType, type);
        }
        
        // 按创建时间倒序
        queryWrapper.orderByDesc(QuestionBank::getCreateTime);
        
        return page(page, queryWrapper);
    }
    
    @Override
    public boolean batchImportQuestions(List<QuestionBank> questions) {
        if (questions == null || questions.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "题目列表不能为空");
        }
        
        // 批量保存
        return saveBatch(questions);
    }
} 