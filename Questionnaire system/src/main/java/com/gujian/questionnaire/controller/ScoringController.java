package com.gujian.questionnaire.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.dto.ScoringDTO;
import com.gujian.questionnaire.entity.AnswerRecord;
import com.gujian.questionnaire.entity.ScoringRecord;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.service.ScoringService;
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
 * 评分控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/scoring")
@Tag(name = "评分管理")
@PreAuthorize("hasRole('ADMIN')")
public class ScoringController {

    @Autowired
    private ScoringService scoringService;

    @PostMapping("/create")
    @Operation(summary = "创建评分记录")
    public Result<ScoringRecord> createScoringRecord(@Valid @RequestBody ScoringDTO scoringDTO,
                                                     @AuthenticationPrincipal User currentUser) {
        ScoringRecord scoringRecord = scoringService.createScoringRecord(scoringDTO, currentUser.getId());
        return Result.success(scoringRecord);
    }

    @PutMapping("/{recordId}")
    @Operation(summary = "更新评分记录")
    public Result<ScoringRecord> updateScoringRecord(
            @PathVariable Long recordId,
            @Valid @RequestBody ScoringDTO scoringDTO,
            @AuthenticationPrincipal User currentUser) {
        ScoringRecord scoringRecord = scoringService.updateScoringRecord(recordId, scoringDTO, currentUser.getId());
        return Result.success(scoringRecord);
    }

    @DeleteMapping("/{recordId}")
    @Operation(summary = "删除评分记录")
    public Result<Boolean> deleteScoringRecord(@PathVariable Long recordId,
                                              @AuthenticationPrincipal User currentUser) {
        boolean success = scoringService.deleteScoringRecord(recordId, currentUser.getId());
        return success ? Result.success(true) : Result.error("删除失败");
    }

    @GetMapping("/records")
    @Operation(summary = "获取评分记录分页列表")
    public Result<IPage<ScoringRecord>> getScoringRecordsPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int current,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "会话ID") @RequestParam(required = false) Long sessionId,
            @Parameter(description = "评分者ID") @RequestParam(required = false) Long scorerId) {
        
        IPage<ScoringRecord> result = scoringService.getScoringRecordsPage(current, size, sessionId, scorerId);
        return Result.success(result);
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "获取会话的所有评分记录")
    public Result<List<ScoringRecord>> getSessionScoringRecords(@PathVariable Long sessionId) {
        List<ScoringRecord> records = scoringService.getSessionScoringRecords(sessionId);
        return Result.success(records);
    }

    @GetMapping("/record/{recordId}")
    @Operation(summary = "获取评分记录详情")
    public Result<ScoringRecord> getScoringRecordDetail(@PathVariable Long recordId) {
        ScoringRecord record = scoringService.getScoringRecordDetail(recordId);
        return Result.success(record);
    }

    @GetMapping("/statistics")
    @Operation(summary = "获取评分统计")
    public Result<Object> getScoringStatistics(
            @Parameter(description = "会话ID") @RequestParam(required = false) Long sessionId,
            @Parameter(description = "评分者ID") @RequestParam(required = false) Long scorerId) {
        
        Object statistics = scoringService.getScoringStatistics(sessionId, scorerId);
        return Result.success(statistics);
    }

    @PostMapping("/batch")
    @Operation(summary = "批量评分")
    public Result<Boolean> batchScoring(@Valid @RequestBody List<ScoringDTO> scoringDTOList,
                                       @AuthenticationPrincipal User currentUser) {
        boolean success = scoringService.batchScoring(scoringDTOList, currentUser.getId());
        return success ? Result.success(true) : Result.error("批量评分失败");
    }

    @GetMapping("/unscored/{sessionId}")
    @Operation(summary = "获取未评分的记录")
    public Result<List<AnswerRecord>> getUnscoredRecords(@PathVariable Long sessionId,
                                                         @AuthenticationPrincipal User currentUser) {
        List<AnswerRecord> records = scoringService.getUnscoredRecords(sessionId, currentUser.getId());
        return Result.success(records);
    }

    @PostMapping("/complete/{sessionId}")
    @Operation(summary = "完成会话评分")
    public Result<Boolean> completeSessionScoring(@PathVariable Long sessionId) {
        boolean success = scoringService.completeSessionScoring(sessionId);
        return success ? Result.success(true) : Result.error("完成评分失败");
    }
} 