package com.gujian.questionnaire.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * 评分请求DTO
 */
@Data
@Schema(description = "评分请求")
public class ScoringDTO {
    
    @Schema(description = "答题记录ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "答题记录ID不能为空")
    private Long answerRecordId;
    
    @Schema(description = "评分", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "评分不能为空")
    @Min(value = 0, message = "评分不能小于0")
    private Integer score;
    
    @Schema(description = "满分", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "满分不能为空")
    @Min(value = 0, message = "满分不能小于0")
    @Max(value = 100, message = "满分不能超过100")
    private Integer maxScore;
    
    @Schema(description = "评分反馈")
    private String comment;
} 