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
 * 答题会话实体类
 */
@Data
@TableName("answer_session")
@Schema(description = "答题会话")
public class AnswerSession {
    
    @TableId(type = IdType.AUTO)
    @Schema(description = "会话ID")
    private Long id;
    
    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long userId;
    
    @Schema(description = "会话唯一编码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String sessionCode;
    
    @Schema(description = "选择的题型：1-单选 2-多选 3-填空 4-简答 5-评分 0-混合", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer questionType;
    
    @Schema(description = "计划答题总数", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer totalCount;
    
    @Schema(description = "当前已答题数")
    private Integer currentCount = 0;
    
    @Schema(description = "理论总分")
    private Integer totalScore = 0;
    
    @Schema(description = "当前得分")
    private Integer currentScore = 0;
    
    @Schema(description = "自动评分总分")
    private Integer autoScore = 0;
    
    @Schema(description = "人工评分总分")
    private Integer manualScore;
    
    @Schema(description = "最终总分")
    private Integer finalScore = 0;
    
    @Schema(description = "会话状态：1-进行中 2-已完成 3-已超时 4-已放弃")
    private Integer status = 1;
    
    @Schema(description = "开始时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    @Schema(description = "最后活动时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastActivityTime;
    
    @Schema(description = "超时时间（分钟）")
    private Integer timeoutMinutes = 60;
    
    @Schema(description = "评分状态：0-未评分 1-部分评分 2-已完成评分")
    private Integer scoringStatus = 0;
    
    // 非数据库字段
    @TableField(exist = false)
    @Schema(description = "用户姓名")
    private String userName;
    
    @TableField(exist = false)
    @Schema(description = "题型名称")
    private String questionTypeName;
    
    @TableField(exist = false)
    @Schema(description = "状态名称")
    private String statusName;
    
    @TableField(exist = false)
    @Schema(description = "评分状态名称")
    private String scoringStatusName;
    
    @TableField(exist = false)
    @Schema(description = "答题进度百分比")
    private Double progressPercent;
} 