package com.gujian.questionnaire.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 提交答案请求DTO
 */
@Data
@Schema(description = "提交答案请求")
public class SubmitAnswerDTO {
    
    @Schema(description = "会话编码", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "会话编码不能为空")
    private String sessionCode;
    
    @Schema(description = "题目ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "题目ID不能为空")
    private Long questionId;
    
    @Schema(description = "用户答案", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "答案不能为空")
    private String userAnswer;
    
    @Schema(description = "用户答案列表（多选题使用）")
    private List<String> userAnswerList;
    
    @Schema(description = "答题用时（秒）")
    private Integer timeSpentSeconds;
} 