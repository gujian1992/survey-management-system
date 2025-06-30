package com.gujian.questionnaire.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.entity.AnswerRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 答题记录Mapper接口
 */
@Mapper
public interface AnswerRecordMapper extends BaseMapper<AnswerRecord> {
    
    /**
     * 根据会话ID查询答题记录（带题目信息）
     */
    @Select("SELECT ar.*, qb.title as question_title, qb.score as max_score " +
            "FROM answer_record ar " +
            "LEFT JOIN question_bank qb ON ar.question_id = qb.id " +
            "WHERE ar.session_id = #{sessionId} " +
            "ORDER BY ar.sequence_number")
    List<AnswerRecord> selectBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 分页查询需要评分的记录
     */
    @Select("SELECT ar.*, qb.title as question_title, qb.score as max_score, " +
            "s.session_code, u.real_name as student_name " +
            "FROM answer_record ar " +
            "LEFT JOIN question_bank qb ON ar.question_id = qb.id " +
            "LEFT JOIN answer_session s ON ar.session_id = s.id " +
            "LEFT JOIN sys_user u ON s.user_id = u.id " +
            "WHERE ar.question_type IN (4, 5) " +
            "AND ar.manual_score IS NULL " +
            "AND s.status = 2 " +
            "ORDER BY ar.answer_time DESC")
    IPage<AnswerRecord> selectNeedScoringPage(IPage<AnswerRecord> page);
    
    /**
     * 根据会话ID获取下一题序号
     */
    @Select("SELECT COALESCE(MAX(sequence_number), 0) + 1 FROM answer_record WHERE session_id = #{sessionId}")
    Integer getNextSequenceNumber(@Param("sessionId") Long sessionId);
    
    /**
     * 统计会话答题情况
     */
    @Select("SELECT " +
            "COUNT(*) as total_count, " +
            "COUNT(CASE WHEN question_type IN (4, 5) THEN 1 END) as subjective_count, " +
            "COUNT(CASE WHEN question_type IN (4, 5) AND manual_score IS NOT NULL THEN 1 END) as scored_count, " +
            "SUM(CASE WHEN final_score IS NOT NULL THEN final_score ELSE 0 END) as total_score " +
            "FROM answer_record WHERE session_id = #{sessionId}")
    Object getSessionAnswerStats(@Param("sessionId") Long sessionId);

    /**
     * 统计会话已完成的题目数量
     */
    @Select("SELECT COUNT(*) FROM answer_record ar " +
            "INNER JOIN answer_session s ON ar.session_id = s.id " +
            "WHERE s.session_code = #{sessionCode} " +
            "AND ar.final_score IS NOT NULL")
    Integer countBySessionCode(@Param("sessionCode") String sessionCode);
} 