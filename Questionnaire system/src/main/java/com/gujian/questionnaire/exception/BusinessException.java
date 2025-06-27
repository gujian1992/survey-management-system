package com.gujian.questionnaire.exception;

import com.gujian.questionnaire.common.enums.ErrorCode;

/**
 * 业务异常类
 */
public class BusinessException extends BaseException {
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(ErrorCode errorCode, String detailMessage) {
        super(errorCode, detailMessage);
    }

    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public BusinessException(ErrorCode errorCode, String detailMessage, Throwable cause) {
        super(errorCode, detailMessage, cause);
    }

    public BusinessException(ErrorCode errorCode, Object[] params, Throwable cause) {
        super(errorCode, params, cause);
    }
    
    /**
     * 便捷构造函数，使用默认的业务错误码和自定义消息
     */
    public BusinessException(String message) {
        super(ErrorCode.BUSINESS_ERROR, message);
    }
    
    /**
     * 便捷构造函数，使用默认的业务错误码、自定义消息和异常原因
     */
    public BusinessException(String message, Throwable cause) {
        super(ErrorCode.BUSINESS_ERROR, message, cause);
    }
} 