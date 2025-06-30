package com.gujian.questionnaire.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.dto.BatchSubmitAnswerDTO;
import com.gujian.questionnaire.dto.SubmitAnswerDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.service.AnswerRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 答题记录控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/answer-record")
@Tag(name = "答题记录管理")
public class AnswerRecordController {
    @Autowired
    private  AnswerRecordService answerRecordService;

    @PostMapping("/batch-submit")
    @Operation(summary = "批量提交答案")
    public Result<List<AnswerRecord>> batchSubmitAnswers(@Valid @RequestBody BatchSubmitAnswerDTO batchSubmitDTO,
                                                        @AuthenticationPrincipal User currentUser) {
        List<AnswerRecord> records = answerRecordService.batchSubmitAnswers(batchSubmitDTO, currentUser.getId());
        return Result.success(records);
    }

    @PostMapping("/submit")
    @Operation(summary = "提交答案")
    public Result<AnswerRecord> submitAnswer(@Valid @RequestBody SubmitAnswerDTO submitAnswerDTO,
                                           @AuthenticationPrincipal User currentUser) {
        AnswerRecord answerRecord = answerRecordService.submitAnswer(submitAnswerDTO, currentUser.getId());
        return Result.success(answerRecord);
    }

    @GetMapping("/next-question/{sessionCode}")
    @Operation(summary = "获取下一题")
    public Result<QuestionBank> getNextQuestion(@PathVariable String sessionCode) {
        QuestionBank nextQuestion = answerRecordService.getNextQuestion(sessionCode);
        return Result.success(nextQuestion);
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "获取会话的所有答题记录")
    public Result<List<AnswerRecord>> getSessionRecords(@PathVariable Long sessionId) {
        List<AnswerRecord> records = answerRecordService.getSessionRecords(sessionId);
        return Result.success(records);
    }

    @GetMapping("/{recordId}")
    @Operation(summary = "获取答题记录详情")
    public Result<AnswerRecord> getRecordDetail(@PathVariable Long recordId) {
        AnswerRecord record = answerRecordService.getRecordDetail(recordId);
        return Result.success(record);
    }

    @GetMapping("/need-scoring")
    @Operation(summary = "获取需要评分的记录（管理员）")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<AnswerRecord>> getNeedScoringPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int current,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") int size) {
        
        IPage<AnswerRecord> result = answerRecordService.getNeedScoringPage(current, size);
        return Result.success(result);
    }

    @PostMapping("/batch-auto-score/{sessionId}")
    @Operation(summary = "批量自动评分（管理员）")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> batchAutoScore(@PathVariable Long sessionId) {
        boolean success = answerRecordService.batchAutoScore(sessionId);
        return success ? Result.success(true) : Result.error("批量自动评分失败");
    }

    @GetMapping("/session/{sessionId}/stats")
    @Operation(summary = "获取会话答题统计")
    public Result<Object> getSessionAnswerStats(@PathVariable Long sessionId) {
        Object stats = answerRecordService.getSessionAnswerStats(sessionId);
        return Result.success(stats);
    }
} 