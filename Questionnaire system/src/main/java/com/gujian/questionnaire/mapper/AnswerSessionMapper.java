package com.gujian.questionnaire.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.entity.AnswerSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 答题会话Mapper接口
 */
@Mapper
public interface AnswerSessionMapper extends BaseMapper<AnswerSession> {
    
    /**
     * 分页查询答题会话（带用户信息）
     */
    @Select("SELECT s.*, u.username, u.real_name as user_name " +
            "FROM answer_session s " +
            "LEFT JOIN sys_user u ON s.user_id = u.id " +
            "WHERE (#{userId} IS NULL OR s.user_id = #{userId}) " +
            "AND (#{status} IS NULL OR s.status = #{status}) " +
            "AND (#{questionType} IS NULL OR s.question_type = #{questionType}) " +
            "ORDER BY s.start_time DESC")
    IPage<AnswerSession> selectSessionPage(IPage<AnswerSession> page,
                                          @Param("userId") Long userId,
                                          @Param("status") Integer status,
                                          @Param("questionType") Integer questionType);
    
    /**
     * 根据会话编码查询会话（带用户信息）
     */
    @Select("SELECT s.*, u.username, u.real_name as user_name " +
            "FROM answer_session s " +
            "LEFT JOIN sys_user u ON s.user_id = u.id " +
            "WHERE s.session_code = #{sessionCode}")
    AnswerSession selectBySessionCode(@Param("sessionCode") String sessionCode);
    
    /**
     * 获取用户答题统计
     */
    @Select("SELECT " +
            "COUNT(*) as total_sessions, " +
            "COUNT(CASE WHEN status = 2 THEN 1 END) as completed_sessions, " +
            "COUNT(CASE WHEN status = 1 THEN 1 END) as ongoing_sessions, " +
            "SUM(CASE WHEN status = 2 THEN final_score ELSE 0 END) as total_score, " +
            "AVG(CASE WHEN status = 2 THEN final_score END) as avg_score " +
            "FROM answer_session WHERE user_id = #{userId}")
    Object getUserStats(@Param("userId") Long userId);
} 