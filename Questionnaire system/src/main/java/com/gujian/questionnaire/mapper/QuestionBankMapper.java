package com.gujian.questionnaire.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.entity.QuestionBank;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 题库Mapper接口
 */
@Mapper
public interface QuestionBankMapper extends BaseMapper<QuestionBank> {
    
    /**
     * 分页查询题库（带创建者信息）
     */
    @Select("SELECT qb.*, u.real_name as creator_name " +
            "FROM question_bank qb " +
            "LEFT JOIN sys_user u ON qb.creator_id = u.id " +
            "WHERE qb.deleted = 0 " +
            "AND (#{type} IS NULL OR qb.type = #{type}) " +
            "AND (#{status} IS NULL OR qb.status = #{status}) " +
            "AND (#{difficulty} IS NULL OR qb.difficulty = #{difficulty}) " +
            "AND (#{priority} IS NULL OR qb.priority = #{priority}) " +
            "AND (#{keyword} IS NULL OR qb.title LIKE CONCAT('%', #{keyword}, '%') OR qb.content LIKE CONCAT('%', #{keyword}, '%')) " +
            "ORDER BY qb.update_time DESC, qb.priority DESC, qb.create_time DESC")
    IPage<QuestionBank> selectQuestionPage(IPage<QuestionBank> page, 
                                          @Param("type") Integer type,
                                          @Param("status") Integer status,
                                          @Param("difficulty") Integer difficulty,
                                          @Param("priority") Integer priority,
                                          @Param("keyword") String keyword);
    
    /**
     * 根据题型和优先级随机获取题目
     */
    @Select("SELECT * FROM question_bank " +
            "WHERE deleted = 0 AND status = 1 " +
            "AND (#{type} = 0 OR type = #{type}) " +
            "ORDER BY priority DESC, RAND() " +
            "LIMIT #{count}")
    List<QuestionBank> selectRandomQuestions(@Param("type") Integer type, @Param("count") Integer count);
    
    /**
     * 获取题目统计信息
     */
    @Select("SELECT " +
            "COUNT(*) as total, " +
            "COUNT(CASE WHEN type = 1 THEN 1 END) as single_choice, " +
            "COUNT(CASE WHEN type = 2 THEN 1 END) as multiple_choice, " +
            "COUNT(CASE WHEN type = 3 THEN 1 END) as fill_blank, " +
            "COUNT(CASE WHEN type = 4 THEN 1 END) as essay, " +
            "COUNT(CASE WHEN type = 5 THEN 1 END) as rating " +
            "FROM question_bank WHERE deleted = 0 AND status = 1")
    Map<String, Object> getQuestionStats();
    
    /**
     * 获取各题型统计信息（数组格式）
     */
    @Select("SELECT " +
            "type as type, " +
            "COUNT(*) as count " +
            "FROM question_bank " +
            "WHERE deleted = 0 AND status = 1 " +
            "GROUP BY type " +
            "ORDER BY type")
    List<Map<String, Object>> getQuestionTypeStats();
    
    /**
     * 根据题型和优先级随机获取题目（多题型）
     * 注意：这个方法需要在XML映射器中实现，因为@Select注解不支持foreach标签
     */
    List<QuestionBank> selectRandomQuestionsFromTypes(@Param("types") List<Integer> types, @Param("count") Integer count);
} 