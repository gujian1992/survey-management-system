package com.gujian.questionnaire.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.ScoringRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 评分记录Mapper接口
 */
@Mapper
public interface ScoringRecordMapper extends BaseMapper<ScoringRecord> {
    
    /**
     * 分页查询评分记录（带详细信息）
     */
    @Select("SELECT sr.*, u1.real_name as scorer_name, u2.real_name as student_name, " +
            "qb.title as question_title, ar.user_answer " +
            "FROM scoring_record sr " +
            "LEFT JOIN sys_user u1 ON sr.scorer_id = u1.id " +
            "LEFT JOIN answer_record ar ON sr.answer_record_id = ar.id " +
            "LEFT JOIN answer_session s ON sr.session_id = s.id " +
            "LEFT JOIN sys_user u2 ON s.user_id = u2.id " +
            "LEFT JOIN question_bank qb ON ar.question_id = qb.id " +
            "WHERE (#{scorerId} IS NULL OR sr.scorer_id = #{scorerId}) " +
            "AND (#{sessionId} IS NULL OR sr.session_id = #{sessionId}) " +
            "ORDER BY sr.scoring_time DESC")
    IPage<ScoringRecord> selectPageWithDetails(IPage<ScoringRecord> page,
                                             @Param("sessionId") Long sessionId,
                                             @Param("scorerId") Long scorerId);
    
    /**
     * 根据会话ID查询评分记录
     */
    @Select("SELECT sr.*, u.real_name as scorer_name, qb.title as question_title " +
            "FROM scoring_record sr " +
            "LEFT JOIN sys_user u ON sr.scorer_id = u.id " +
            "LEFT JOIN question_bank qb ON sr.question_id = qb.id " +
            "WHERE sr.session_id = #{sessionId} " +
            "ORDER BY sr.scoring_time DESC")
    List<ScoringRecord> selectBySessionId(@Param("sessionId") Long sessionId);
    
    /**
     * 根据答题记录ID查询评分记录
     */
    @Select("SELECT * FROM scoring_record WHERE answer_record_id = #{answerRecordId}")
    ScoringRecord selectByAnswerRecordId(@Param("answerRecordId") Long answerRecordId);
    
    /**
     * 查询评分记录详情
     */
    @Select("SELECT sr.*, u1.real_name as scorer_name, u2.real_name as student_name, " +
            "qb.title as question_title, qb.content as question_content, ar.user_answer " +
            "FROM scoring_record sr " +
            "LEFT JOIN sys_user u1 ON sr.scorer_id = u1.id " +
            "LEFT JOIN answer_record ar ON sr.answer_record_id = ar.id " +
            "LEFT JOIN answer_session s ON sr.session_id = s.id " +
            "LEFT JOIN sys_user u2 ON s.user_id = u2.id " +
            "LEFT JOIN question_bank qb ON sr.question_id = qb.id " +
            "WHERE sr.id = #{recordId}")
    ScoringRecord selectDetailById(@Param("recordId") Long recordId);
    
    /**
     * 获取评分统计信息
     */
    @Select("SELECT " +
            "COUNT(*) as totalCount, " +
            "AVG(score) as avgScore, " +
            "MAX(score) as maxScore, " +
            "MIN(score) as minScore " +
            "FROM scoring_record " +
            "WHERE (#{sessionId} IS NULL OR session_id = #{sessionId}) " +
            "AND (#{scorerId} IS NULL OR scorer_id = #{scorerId})")
    Object getScoringStatistics(@Param("sessionId") Long sessionId, @Param("scorerId") Long scorerId);
    
    /**
     * 获取未评分的答题记录
     */
    @Select("SELECT ar.* FROM answer_record ar " +
            "LEFT JOIN scoring_record sr ON ar.id = sr.answer_record_id " +
            "WHERE ar.session_id = #{sessionId} " +
            "AND ar.question_type IN (4, 5) " + // 主观题
            "AND sr.id IS NULL " +
            "AND (#{scorerId} IS NULL OR ar.id NOT IN " +
            "(SELECT answer_record_id FROM scoring_record WHERE scorer_id = #{scorerId}))")
    List<AnswerRecord> selectUnscoredRecords(@Param("sessionId") Long sessionId, @Param("scorerId") Long scorerId);
    
    /**
     * 统计会话中主观题的数量
     */
    @Select("SELECT COUNT(*) FROM answer_record " +
            "WHERE session_id = #{sessionId} AND question_type IN (4, 5)")
    int countSubjectiveQuestions(@Param("sessionId") Long sessionId);
    
    /**
     * 统计会话中已评分主观题的数量
     */
    @Select("SELECT COUNT(DISTINCT ar.id) FROM answer_record ar " +
            "INNER JOIN scoring_record sr ON ar.id = sr.answer_record_id " +
            "WHERE ar.session_id = #{sessionId} AND ar.question_type IN (4, 5)")
    int countScoredQuestions(@Param("sessionId") Long sessionId);
    
    /**
     * 计算会话总分
     */
    @Select("SELECT SUM(ar.final_score) FROM answer_record ar WHERE ar.session_id = #{sessionId}")
    Integer calculateSessionTotalScore(@Param("sessionId") Long sessionId);
} 