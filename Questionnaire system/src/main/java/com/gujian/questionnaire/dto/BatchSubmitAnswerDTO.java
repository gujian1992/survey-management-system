package com.gujian.questionnaire.dto;

import lombok.Data;
import java.util.List;

/**
 * 批量提交答案的数据传输对象
 */
@Data
public class BatchSubmitAnswerDTO {
    /**
     * 答题会话编码
     */
    private String sessionCode;

    /**
     * 答案列表
     */
    private List<AnswerDTO> answers;

    /**
     * 单个答案的数据传输对象
     */
    @Data
    public static class AnswerDTO {
        /**
         * 题目ID
         */
        private Long questionId;

        /**
         * 用户答案
         */
        private String userAnswer;

        /**
         * 答题用时（秒）
         */
        private Integer timeSpentSeconds;
    }
} 