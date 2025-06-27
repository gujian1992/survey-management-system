package com.gujian.questionnaire.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 评分范围反序列化器
 * 支持以下格式：
 * 1. 字符串格式："1,5" 或 "1-5"
 * 2. 数组格式：[1,5]
 */
public class ScoreRangeDeserializer extends JsonDeserializer<List<Integer>> {
    
    @Override
    public List<Integer> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (!StringUtils.hasText(value)) {
            return new ArrayList<>();
        }

        // 处理数组格式 [1,5]
        if (value.startsWith("[") && value.endsWith("]")) {
            value = value.substring(1, value.length() - 1);
        }

        // 处理范围格式 "1-5"
        if (value.contains("-")) {
            String[] range = value.split("-");
            if (range.length == 2) {
                try {
                    int start = Integer.parseInt(range[0].trim());
                    int end = Integer.parseInt(range[1].trim());
                    List<Integer> result = new ArrayList<>();
                    for (int i = start; i <= end; i++) {
                        result.add(i);
                    }
                    return result;
                } catch (NumberFormatException e) {
                    throw new IOException("Invalid score range format: " + value);
                }
            }
        }

        // 处理逗号分隔格式 "1,2,3,4,5"
        try {
            return Arrays.stream(value.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            throw new IOException("Invalid score range format: " + value);
        }
    }
} 