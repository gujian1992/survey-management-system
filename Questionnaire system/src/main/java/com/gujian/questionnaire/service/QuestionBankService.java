package com.gujian.questionnaire.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gujian.questionnaire.entity.QuestionBank;

import java.util.List;

/**
 * 题库服务接口
 */
public interface QuestionBankService extends IService<QuestionBank> {
    
    /**
     * 获取随机题目
     */
    List<QuestionBank> getRandomQuestions(Integer type, Integer count);
    
    /**
     * 从多个题型中获取随机题目
     */
    List<QuestionBank> getRandomQuestionsFromTypes(List<Integer> types, Integer count);
    
    /**
     * 获取题库分页列表
     */
    IPage<QuestionBank> getQuestionPage(int current, int size, String keyword, Integer type);
    
    /**
     * 获取题型统计
     */
    Object getQuestionTypeStats();
    
    /**
     * 批量导入题目
     */
    boolean batchImportQuestions(List<QuestionBank> questions);
    
    /**
     * 批量删除题目
     */
    boolean batchDeleteQuestions(List<Long> ids);
    
    /**
     * 分页查询题库（包含优先级过滤）
     */
    IPage<QuestionBank> getQuestionPage(int current, int size, Integer type, Integer status, 
                                       Integer difficulty, Integer priority, String keyword);
    
    /**
     * 创建题目
     */
    boolean createQuestion(QuestionBank question, Long creatorId);
    
    /**
     * 更新题目
     */
    boolean updateQuestion(QuestionBank question, Long updaterId);
    
    /**
     * 删除题目（逻辑删除）
     */
    boolean deleteQuestion(Long id);
    
    /**
     * 启用/禁用题目
     */
    boolean toggleQuestionStatus(Long id, Integer status);
    
    /**
     * 获取题目统计信息
     */
    Object getQuestionStats();
    
    /**
     * 根据ID获取题目详情（包含扩展信息）
     */
    QuestionBank getQuestionDetail(Long id);
} 