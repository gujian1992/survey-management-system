package com.gujian.questionnaire.common.enums;

import lombok.Getter;

/**
 * 系统错误码枚举
 */
@Getter
public enum ErrorCode {
    
    // 成功
    SUCCESS(200, "操作成功"),
    
    // 客户端错误 (400-499)
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未经授权"),
    FORBIDDEN(403, "访问被禁止"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    PARAMETER_INVALID(4001, "参数验证失败"),
    TOKEN_EXPIRED(4002, "令牌已过期"),
    TOKEN_INVALID(4003, "令牌无效"),
    USER_NOT_FOUND(4004, "用户不存在"),
    PASSWORD_INCORRECT(4005, "密码错误"),
    DUPLICATE_USERNAME(4006, "用户名已存在"),
    
    // 服务端错误 (500-599)
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),
    DATABASE_ERROR(5001, "数据库操作失败"),
    CACHE_ERROR(5002, "缓存操作失败"),
    FILE_UPLOAD_ERROR(5003, "文件上传失败"),
    
    // 业务错误 (600-699)
    BUSINESS_ERROR(6000, "业务处理失败"),
    QUESTIONNAIRE_NOT_FOUND(6001, "问卷不存在"),
    QUESTIONNAIRE_EXPIRED(6002, "问卷已过期"),
    QUESTIONNAIRE_NOT_PUBLISHED(6003, "问卷未发布"),
    QUESTIONNAIRE_ALREADY_SUBMITTED(6004, "问卷已提交"),
    QUESTION_REQUIRED(6005, "必填题目未答"),
    INVALID_ANSWER_FORMAT(6006, "答案格式错误"),
    
    // 题库相关错误 (610-619)
    QUESTION_NOT_FOUND(6101, "题目不存在"),
    QUESTION_COUNT_INVALID(6102, "题目数量无效"),
    QUESTION_TYPE_INVALID(6103, "题型无效"),
    QUESTION_SCORE_INVALID(6104, "题目分数无效"),
    QUESTION_TITLE_EMPTY(6105, "题目标题不能为空"),
    QUESTION_OPTIONS_REQUIRED(6106, "选择题必须设置选项"),
    QUESTION_ANSWER_REQUIRED(6107, "客观题必须设置正确答案"),
    
    // 会话相关错误 (620-629)
    SESSION_NOT_FOUND(6201, "答题会话不存在"),
    SESSION_PERMISSION_DENIED(6202, "无权限操作此会话"),
    SESSION_ALREADY_FINISHED(6203, "会话已结束"),
    SESSION_TIMEOUT(6204, "会话已超时"),
    SESSION_IN_PROGRESS(6205, "有正在进行的答题会话"),
    SESSION_INSUFFICIENT_QUESTIONS(6206, "题库中可用题目不足"),
    
    // 答题相关错误 (630-639)
    ANSWER_RECORD_NOT_FOUND(6301, "答题记录不存在"),
    ANSWER_ALREADY_SUBMITTED(6302, "此题已作答，无法重复提交"),
    ANSWER_SESSION_FINISHED(6303, "会话已结束，无法提交答案"),
    ANSWER_ALL_COMPLETED(6304, "已完成所有题目"),
    ANSWER_NO_MORE_QUESTIONS(6305, "没有更多可用题目"),
    
    // 评分相关错误 (640-649)
    SCORING_RECORD_NOT_FOUND(6401, "评分记录不存在"),
    SCORING_PERMISSION_DENIED(6402, "只能操作自己的评分记录"),
    SCORING_NOT_SUBJECTIVE(6403, "只能对主观题进行人工评分"),
    SCORING_ALREADY_EXISTS(6404, "已经评分过此题"),
    SCORING_SESSION_NOT_FOUND(6405, "会话不存在"),
    SCORING_INCOMPLETE(6406, "还有主观题未评分"),
    SCORING_BATCH_FAILED(6407, "批量评分失败"),
    
    // 第三方服务错误 (700-799)
    THIRD_PARTY_SERVICE_ERROR(700, "第三方服务调用失败"),
    API_GATEWAY_ERROR(701, "网关服务异常"),
    RPC_SERVICE_ERROR(702, "RPC服务调用失败");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
} 