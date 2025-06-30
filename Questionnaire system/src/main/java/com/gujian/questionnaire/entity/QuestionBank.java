package com.gujian.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 题库实体类
 */
@Data
@TableName("question_bank")
@Schema(description = "题库")
public class QuestionBank {
    
    @TableId(type = IdType.AUTO)
    @Schema(description = "题目ID")
    private Long id;
    
    @Schema(description = "题目标题", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;
    
    @Schema(description = "题型：1-单选 2-多选 3-填空 4-简答 5-评分", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer type;
    
    @Schema(description = "题目描述详细说明")
    private String content;
    
    @Schema(description = "选项内容（JSON格式，适用于选择题）")
    private String options;
    
    @Schema(description = "正确答案（客观题使用，主观题为NULL）")
    private String correctAnswer;
    
    @Schema(description = "答案解析")
    private String explanation;
    
    @Schema(description = "优先级：1-低 2-中 3-高（影响出题概率）")
    private Integer priority = 1;
    
    @Schema(description = "题目分数")
    private Integer score = 1;
    
    @Schema(description = "难度等级：1-简单 2-中等 3-困难")
    private Integer difficulty = 1;
    
    @Schema(description = "标签（便于分类筛选，逗号分隔）")
    private String tags;
    
    @Schema(description = "状态：0-禁用 1-启用")
    private Integer status = 1;
    
    @Schema(description = "创建者ID")
    private Long creatorId;
    
    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    @Schema(description = "更新时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
    
    @TableLogic
    @Schema(description = "逻辑删除：0-未删除 1-已删除")
    private Integer deleted = 0;
    
    // 非数据库字段 - 添加@TableField(exist = false)注解
    @TableField(exist = false)
    @Schema(description = "选项列表（解析后的JSON）")
    private List<String> optionList;
    
    @TableField(exist = false)
    @Schema(description = "题型名称")
    private String typeName;
    
    @TableField(exist = false)
    @Schema(description = "难度名称")
    private String difficultyName;
    
    @TableField(exist = false)
    @Schema(description = "创建者姓名")
    private String creatorName;
} 