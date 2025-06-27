package com.gujian.questionnaire.exception;

import com.gujian.questionnaire.common.enums.ErrorCode;
import lombok.Getter;

/**
 * 基础异常类
 */
@Getter
public class BaseException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final String detailMessage;
    private final Object[] params;

    public BaseException(ErrorCode errorCode) {
        this(errorCode, null, null, null);
    }

    public BaseException(ErrorCode errorCode, String detailMessage) {
        this(errorCode, detailMessage, null, null);
    }

    public BaseException(ErrorCode errorCode, Throwable cause) {
        this(errorCode, null, null, cause);
    }

    public BaseException(ErrorCode errorCode, String detailMessage, Throwable cause) {
        this(errorCode, detailMessage, null, cause);
    }

    public BaseException(ErrorCode errorCode, Object[] params) {
        this(errorCode, null, params, null);
    }

    public BaseException(ErrorCode errorCode, Object[] params, Throwable cause) {
        this(errorCode, null, params, cause);
    }

    private BaseException(ErrorCode errorCode, String detailMessage, Object[] params, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.detailMessage = detailMessage;
        this.params = params != null ? params : new Object[0];
    }

    /**
     * 获取完整错误信息
     */
    public String getFullMessage() {
        if (detailMessage != null) {
            return String.format("%s: %s", errorCode.getMessage(), detailMessage);
        }
        return errorCode.getMessage();
    }
} 