package com.gujian.questionnaire.common;

import com.gujian.questionnaire.common.enums.ErrorCode;
import lombok.Data;

/**
 * 统一响应结果类
 */
@Data
public class Result<T> {
    
    /**
     * 状态码
     */
    private Integer code;
    
    /**
     * 响应消息
     */
    private String message;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 时间戳
     */
    private Long timestamp;
    
    public Result() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public Result(Integer code, String message) {
        this();
        this.code = code;
        this.message = message;
    }
    
    public Result(Integer code, String message, T data) {
        this(code, message);
        this.data = data;
    }
    
    /**
     * 成功响应
     */
    public static <T> Result<T> success() {
        return new Result<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage());
    }
    
    /**
     * 成功响应（带数据）
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), data);
    }
    
    /**
     * 成功响应（自定义消息）
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(ErrorCode.SUCCESS.getCode(), message, data);
    }
    
    /**
     * 失败响应
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), message);
    }
    
    /**
     * 失败响应（自定义状态码和消息）
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message);
    }
    
    /**
     * 失败响应（使用ErrorCode枚举）
     */
    public static <T> Result<T> error(ErrorCode errorCode) {
        return new Result<>(errorCode.getCode(), errorCode.getMessage());
    }
    
    /**
     * 失败响应（使用ErrorCode枚举和自定义消息）
     */
    public static <T> Result<T> error(ErrorCode errorCode, String message) {
        return new Result<>(errorCode.getCode(), message);
    }
    
    /**
     * 参数错误
     */
    public static <T> Result<T> badRequest(String message) {
        return new Result<>(ErrorCode.BAD_REQUEST.getCode(), message);
    }
    
    /**
     * 未授权
     */
    public static <T> Result<T> unauthorized(String message) {
        return new Result<>(ErrorCode.UNAUTHORIZED.getCode(), message);
    }
    
    /**
     * 禁止访问
     */
    public static <T> Result<T> forbidden(String message) {
        return new Result<>(ErrorCode.FORBIDDEN.getCode(), message);
    }
    
    /**
     * 资源未找到
     */
    public static <T> Result<T> notFound(String message) {
        return new Result<>(ErrorCode.NOT_FOUND.getCode(), message);
    }
    
    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return this.code != null && this.code.equals(ErrorCode.SUCCESS.getCode());
    }
} 