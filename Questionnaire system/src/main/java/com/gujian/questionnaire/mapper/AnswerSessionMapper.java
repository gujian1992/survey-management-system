package com.gujian.questionnaire.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.entity.AnswerSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

/**
 * 答题会话Mapper接口
 */
@Mapper
public interface AnswerSessionMapper extends BaseMapper<AnswerSession> {
    
    /**
     * 分页查询答题会话（带用户信息和状态名称）
     */
    IPage<AnswerSession> selectSessionPage(IPage<AnswerSession> page,
                                         @Param("userId") Long userId,
                                         @Param("status") Integer status,
                                         @Param("questionType") Integer questionType);
    
    /**
     * 分页查询答题会话（管理员，支持用户名模糊搜索和时间范围）
     */
    IPage<AnswerSession> selectSessionPageWithFilters(IPage<AnswerSession> page,
                                                    @Param("userName") String userName,
                                                    @Param("status") Integer status,
                                                    @Param("startTime") String startTime,
                                                    @Param("endTime") String endTime);
    
    /**
     * 根据会话编码查询会话（带用户信息）
     */
    AnswerSession selectBySessionCode(@Param("sessionCode") String sessionCode);
    
    /**
     * 根据会话编码获取 question_types 字段的原始 JSON 字符串
     */
    String selectQuestionTypesJson(@Param("sessionCode") String sessionCode);
    
    /**
     * 获取用户答题统计
     */
    Map<String, Object> getUserStats(@Param("userId") Long userId);
} 