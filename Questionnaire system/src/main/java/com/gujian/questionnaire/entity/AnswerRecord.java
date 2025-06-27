package com.gujian.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 答题记录实体类
 */
@Data
@TableName("answer_record")
@Schema(description = "答题记录")
public class AnswerRecord {
    
    @TableId(type = IdType.AUTO)
    @Schema(description = "答题记录ID")
    private Long id;
    
    @Schema(description = "会话ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long sessionId;
    
    @Schema(description = "题目ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long questionId;
    
    @Schema(description = "题型", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer questionType;
    
    @Schema(description = "题目内容快照（防止题目被修改影响记录）")
    private String questionContent;
    
    @Schema(description = "题目选项快照")
    private String questionOptions;
    
    @Schema(description = "用户答案")
    private String userAnswer;
    
    @Schema(description = "正确答案")
    private String correctAnswer;
    
    @Schema(description = "是否正确（客观题自动判断，主观题为NULL）")
    private Boolean isCorrect;
    
    @Schema(description = "自动评分")
    private Integer autoScore = 0;
    
    @Schema(description = "人工评分（主观题使用）")
    private Integer manualScore;
    
    @Schema(description = "最终得分")
    private Integer finalScore = 0;
    
    @Schema(description = "答题时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime answerTime;
    
    @Schema(description = "答题用时（秒）")
    private Integer timeSpentSeconds;
    
    @Schema(description = "题目序号（在本次会话中的顺序）")
    private Integer sequenceNumber;
    
    // 非数据库字段
    @TableField(exist = false)
    @Schema(description = "题目标题")
    private String questionTitle;
    
    @TableField(exist = false)
    @Schema(description = "选项列表（解析后的JSON）")
    private List<String> optionList;
    
    @TableField(exist = false)
    @Schema(description = "用户答案列表（多选题）")
    private List<String> userAnswerList;
    
    @TableField(exist = false)
    @Schema(description = "题型名称")
    private String questionTypeName;
    
    @TableField(exist = false)
    @Schema(description = "是否需要人工评分")
    private Boolean needManualScore;
    
    @TableField(exist = false)
    @Schema(description = "题目满分")
    private Integer maxScore;
} 