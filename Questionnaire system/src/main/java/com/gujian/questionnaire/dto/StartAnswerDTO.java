package com.gujian.questionnaire.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * 开始答题请求DTO
 */
@Data
@Schema(description = "开始答题请求")
public class StartAnswerDTO {
    
    @Schema(description = "题型：1-单选 2-多选 3-填空 4-简答 5-评分 0-混合", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "题型不能为空")
    @Min(value = 0, message = "题型值无效")
    @Max(value = 5, message = "题型值无效")
    private Integer questionType;
    
    @Schema(description = "答题数量", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "答题数量不能为空")
    @Min(value = 1, message = "答题数量至少为1")
    @Max(value = 50, message = "答题数量不能超过50")
    private Integer questionCount;
    
    @Schema(description = "超时时间（分钟），默认60分钟")
    @Min(value = 5, message = "超时时间至少5分钟")
    @Max(value = 180, message = "超时时间不能超过180分钟")
    private Integer timeoutMinutes = 60;
} 