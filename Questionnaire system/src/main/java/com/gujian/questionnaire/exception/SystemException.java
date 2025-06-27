package com.gujian.questionnaire.exception;

import com.gujian.questionnaire.common.enums.ErrorCode;

/**
 * 系统异常类
 */
public class SystemException extends BaseException {
    
    public SystemException(ErrorCode errorCode) {
        super(errorCode);
    }

    public SystemException(ErrorCode errorCode, String detailMessage) {
        super(errorCode, detailMessage);
    }

    public SystemException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public SystemException(ErrorCode errorCode, String detailMessage, Throwable cause) {
        super(errorCode, detailMessage, cause);
    }

    public SystemException(ErrorCode errorCode, Object[] params, Throwable cause) {
        super(errorCode, params, cause);
    }
} 