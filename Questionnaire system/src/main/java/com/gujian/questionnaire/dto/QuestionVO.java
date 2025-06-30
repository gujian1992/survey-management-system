package com.gujian.questionnaire.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionVO {
    private Long id;
    private String title;
    private String content;
    private String description;
    private String type;
    private List<String> options;
    private Integer score;
    private Integer difficulty;
    private String explanation;
} 