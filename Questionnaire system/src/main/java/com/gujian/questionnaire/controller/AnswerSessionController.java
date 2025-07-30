package com.gujian.questionnaire.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.common.enums.ErrorCode;
import com.gujian.questionnaire.dto.SessionStatusVO;
import com.gujian.questionnaire.dto.QuestionVO;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.exception.BusinessException;
import com.gujian.questionnaire.service.AnswerSessionService;
import com.gujian.questionnaire.service.AnswerRecordService;
import com.gujian.questionnaire.utils.UserContextUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "答题会话管理")
@RestController
@RequestMapping("/api/answer-session")
public class AnswerSessionController {

    @Autowired
    private AnswerSessionService answerSessionService;

    @Autowired
    private AnswerRecordService answerRecordService;

    @Autowired
    private UserContextUtils userContextUtils;

    /**
     * 开始答题会话
     */
    @PostMapping("/start")
    @Operation(summary = "开始答题会话")
    public Result<AnswerSession> startAnswerSession(@RequestBody StartAnswerDTO startAnswerDTO) {
        try {
            Long userId = userContextUtils.requireCurrentUserId();
            AnswerSession session = answerSessionService.startAnswerSession(startAnswerDTO, userId);
            return Result.success(session);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取会话状态
     */
    @GetMapping("/{sessionCode}/status")
    @Operation(summary = "获取答题会话状态")
    public Result<SessionStatusVO> getSessionStatus(@PathVariable String sessionCode) {
        try {
            SessionStatusVO status = answerSessionService.getSessionStatus(sessionCode);
            return Result.success(status);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取指定题目
     */
    @GetMapping("/{sessionCode}/question/{index}")
    @Operation(summary = "获取指定题目")
    public Result<QuestionVO> getQuestion(@PathVariable String sessionCode, @PathVariable Integer index) {
        try {
            QuestionVO question = answerSessionService.getQuestionByIndex(sessionCode, index);
            return Result.success(question);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 完成会话
     */
    @PostMapping("/{sessionCode}/finish")
    @Operation(summary = "完成答题会话")
    public Result<Void> finishSession(@PathVariable String sessionCode) {
        try {
            Long userId = userContextUtils.requireCurrentUserId();
            answerSessionService.finishSession(sessionCode, userId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取我的答题会话列表
     */
    @GetMapping("/my-sessions")
    @Operation(summary = "获取我的答题会话列表")
    public Result<IPage<AnswerSession>> getMySessionList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status) {
        try {
            Long userId = userContextUtils.requireCurrentUserId();
            IPage<AnswerSession> page = answerSessionService.getUserSessionPage(current, size, userId, status);
            return Result.success(page);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取我的答题统计
     */
    @GetMapping("/my-stats")
    @Operation(summary = "获取我的答题统计")
    public Result<Object> getMyStats() {
        try {
            Long userId = userContextUtils.requireCurrentUserId();
            Object stats = answerSessionService.getUserStats(userId);
            return Result.success(stats);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取所有会话列表（管理员）
     */
    @GetMapping("/admin/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取所有会话列表（管理员）")
    public Result<IPage<AnswerSession>> getAllSessionList(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            IPage<AnswerSession> page = answerSessionService.getAllSessionPage(current, size, userName, status,
                    startTime, endTime);
            return Result.success(page);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 检查会话超时
     */
    @GetMapping("/{sessionCode}/timeout-check")
    @Operation(summary = "检查会话超时")
    public Result<Boolean> checkSessionTimeout(@PathVariable String sessionCode) {
        try {
            boolean isTimeout = answerSessionService.checkSessionTimeout(sessionCode);
            return Result.success(isTimeout);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    // 移除会话进度更新接口，改为前端计算
    // /**
    // * 更新会话进度
    // */
    // @PostMapping("/{sessionId}/update-progress")
    // @Operation(summary = "更新会话进度")
    // public Result<Boolean> updateSessionProgress(@PathVariable Long sessionId) {
    // // 改为前端计算进度，无需后端接口
    // }

    /**
     * 获取会话统计
     */
    @GetMapping("/{sessionId}/stats")
    @Operation(summary = "获取会话统计")
    public Result<Object> getSessionStats(@PathVariable Long sessionId) {
        try {
            Object stats = answerSessionService.getUserStats(sessionId);
            return Result.success(stats);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取会话答题记录
     */
    @GetMapping("/{sessionCode}/answers")
    @Operation(summary = "获取会话答题记录")
    public Result<List<AnswerRecord>> getSessionAnswers(@PathVariable String sessionCode) {
        try {
            AnswerSession session = answerSessionService.getSessionByCode(sessionCode);
            List<AnswerRecord> records = answerRecordService.getSessionRecords(session.getId());
            return Result.success(records);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 获取会话详情
     */
    @GetMapping("/detail/{sessionCode}")
    @Operation(summary = "获取会话详情")
    public Result<AnswerSession> getSessionDetail(@PathVariable String sessionCode) {
        try {
            AnswerSession session = answerSessionService.getSessionByCode(sessionCode);
            return Result.success(session);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 续期会话
     */
    @PostMapping("/{sessionCode}/extend")
    @Operation(summary = "续期会话")
    public Result<Boolean> extendSession(
            @PathVariable String sessionCode,
            @RequestParam Integer minutes) {
        try {
            boolean success = answerSessionService.extendSession(sessionCode, minutes);
            return Result.success(success);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    /**
     * 强制完成会话（管理员）
     */
    @PostMapping("/{sessionCode}/force-complete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "强制完成会话（管理员）")
    public Result<Boolean> forceCompleteSession(@PathVariable String sessionCode) {
        try {
            boolean success = answerSessionService.forceCompleteSession(sessionCode);
            return Result.success(success);
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }

    // 移除复杂的状态管理接口
    // /**
    // * 发送心跳保活 - 移除心跳机制
    // */
    // @PostMapping("/{sessionId}/heartbeat")
    // @Operation(summary = "发送心跳保活")
    // public Result<Map<String, Object>> sendHeartbeat(
    // @PathVariable Integer sessionId,
    // @RequestBody Map<String, Object> data) {
    // // 移除心跳机制，简化状态管理
    // }

    // /**
    // * 标记会话异常退出 - 简化异常处理
    // */
    // @PostMapping("/{sessionId}/mark-abnormal-exit")
    // @Operation(summary = "标记会话异常退出")
    // public Result<Void> markAbnormalExit(
    // @PathVariable Integer sessionId,
    // @RequestBody Map<String, Object> data) {
    // // 简化异常处理逻辑
    // }

    /**
     * 放弃答题会话
     */
    @PostMapping("/{sessionCode}/abandon")
    @Operation(summary = "放弃答题会话")
    public Result<Void> abandonSession(@PathVariable String sessionCode) {
        try {
            answerSessionService.abandonSession(sessionCode);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getErrorCode(), e.getMessage());
        }
    }
}