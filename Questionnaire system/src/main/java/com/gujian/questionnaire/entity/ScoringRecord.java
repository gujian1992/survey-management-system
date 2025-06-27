package com.gujian.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 评分记录实体类
 */
@Data
@TableName("scoring_record")
@Schema(description = "评分记录")
public class ScoringRecord {
    
    @TableId(type = IdType.AUTO)
    @Schema(description = "评分记录ID")
    private Long id;
    
    @Schema(description = "答题记录ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long answerRecordId;
    
    @Schema(description = "会话ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long sessionId;
    
    @Schema(description = "题目ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long questionId;
    
    @Schema(description = "评分者ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long scorerId;
    
    @Schema(description = "评分", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer score;
    
    @Schema(description = "评分反馈")
    private String comment;
    
    @Schema(description = "评分时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime scoringTime;
    
    // 非数据库字段
    @TableField(exist = false)
    @Schema(description = "评分者姓名")
    private String scorerName;
    
    @TableField(exist = false)
    @Schema(description = "题目标题")
    private String questionTitle;
    
    @TableField(exist = false)
    @Schema(description = "用户答案")
    private String userAnswer;
    
    @TableField(exist = false)
    @Schema(description = "学生姓名")
    private String studentName;
} 