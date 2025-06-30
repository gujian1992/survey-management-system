package com.gujian.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    
    @Schema(description = "选择的题型列表")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> questionTypes;
    
    @Schema(description = "计划答题总数", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer totalCount;
    
    // 移除实时状态字段，改为前端计算或最终计算
    // @Schema(description = "当前已答题数") - 前端计算
    // private Integer currentCount = 0;
    
    @Schema(description = "理论总分")
    private Integer totalScore = 0;
    
    // @Schema(description = "当前得分") - 前端计算，无需持久化
    // private Integer currentScore = 0;
    
    @Schema(description = "自动评分总分")
    private Integer autoScore = 0;
    
    @Schema(description = "人工评分总分")
    private Integer manualScore;
    
    @Schema(description = "最终总分")
    private Integer finalScore = 0;
    
    @Schema(description = "会话状态：0-未开始 1-进行中 2-已完成 3-已超时 4-已放弃 5-异常结束")
    private Integer status = 0;
    
    @Schema(description = "开始时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    // 移除最后活动时间，简化状态管理
    // @Schema(description = "最后活动时间")
    // @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    // private LocalDateTime lastActivityTime;
    
    @Schema(description = "超时时间（分钟）")
    private Integer timeoutMinutes = 60;
    
    @Schema(description = "评分状态：0-未评分 1-部分评分 2-已完成评分")
    private Integer scoringStatus = 0;
    
    @Schema(description = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @Schema(description = "更新时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @Schema(description = "是否删除")
    @TableLogic
    @TableField("is_deleted")
    private Integer deleted;
    
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

    /**
     * 会话状态数据（JSON格式）
     * 仅用于存储必要的会话配置和最终结果，不再存储实时状态
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    @Schema(description = "会话状态数据（仅存储配置和最终结果）")
    private Map<String, Object> stateData;
} 