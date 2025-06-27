package com.gujian.questionnaire.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.dto.StartAnswerDTO;
import com.gujian.questionnaire.entity.AnswerSession;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.service.AnswerSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 答题会话控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/answer-session")
@Tag(name = "答题会话管理")
public class AnswerSessionController {

    @Autowired
    private AnswerSessionService answerSessionService;

    @PostMapping("/start")
    @Operation(summary = "开始答题会话")
    public Result<AnswerSession> startAnswerSession(@Valid @RequestBody StartAnswerDTO startAnswerDTO,
                                                   @AuthenticationPrincipal User currentUser) {
        AnswerSession session = answerSessionService.startAnswerSession(startAnswerDTO, currentUser.getId());
        return Result.success(session);
    }

    @GetMapping("/{sessionCode}")
    @Operation(summary = "获取答题会话信息")
    public Result<AnswerSession> getSessionInfo(@PathVariable String sessionCode) {
        AnswerSession session = answerSessionService.getSessionByCode(sessionCode);
        return Result.success(session);
    }

    @PostMapping("/{sessionCode}/finish")
    @Operation(summary = "完成答题会话")
    public Result<Boolean> finishSession(@PathVariable String sessionCode,
                                        @AuthenticationPrincipal User currentUser) {
        boolean success = answerSessionService.finishSession(sessionCode, currentUser.getId());
        return success ? Result.success(true) : Result.error("完成答题会话失败");
    }

    @PostMapping("/{sessionCode}/abandon")
    @Operation(summary = "放弃答题会话")
    public Result<Boolean> abandonSession(@PathVariable String sessionCode,
                                         @AuthenticationPrincipal User currentUser) {
        boolean success = answerSessionService.abandonSession(sessionCode, currentUser.getId());
        return success ? Result.success(true) : Result.error("放弃答题会话失败");
    }

    @GetMapping("/{sessionCode}/check-timeout")
    @Operation(summary = "检查会话是否超时")
    public Result<Boolean> checkSessionTimeout(@PathVariable String sessionCode) {
        boolean isTimeout = answerSessionService.checkSessionTimeout(sessionCode);
        return Result.success(isTimeout);
    }

    @GetMapping("/my-sessions")
    @Operation(summary = "获取我的答题会话列表")
    public Result<IPage<AnswerSession>> getMySessionPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int current,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @AuthenticationPrincipal User currentUser) {
        IPage<AnswerSession> result = answerSessionService.getUserSessionPage(current, size, currentUser.getId(), status);
        return Result.success(result);
    }

    @GetMapping("/admin/sessions")
    @Operation(summary = "获取所有答题会话列表（管理员）")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<AnswerSession>> getAllSessionPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int current,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "题型") @RequestParam(required = false) Integer questionType) {
        
        IPage<AnswerSession> result = answerSessionService.getAllSessionPage(current, size, status, questionType);
        return Result.success(result);
    }

    @GetMapping("/my-stats")
    @Operation(summary = "获取我的答题统计")
    public Result<Object> getMyStats(@AuthenticationPrincipal User currentUser) {
        Object stats = answerSessionService.getUserStats(currentUser.getId());
        return Result.success(stats);
    }

    @GetMapping("/user/{userId}/stats")
    @Operation(summary = "获取用户答题统计（管理员）")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Object> getUserStats(@PathVariable Long userId) {
        Object stats = answerSessionService.getUserStats(userId);
        return Result.success(stats);
    }
} 