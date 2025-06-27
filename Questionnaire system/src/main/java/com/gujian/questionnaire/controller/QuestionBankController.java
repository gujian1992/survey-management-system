package com.gujian.questionnaire.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gujian.questionnaire.common.Result;
import com.gujian.questionnaire.entity.QuestionBank;
import com.gujian.questionnaire.entity.User;
import com.gujian.questionnaire.service.QuestionBankService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 题库管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/question-bank")
@Tag(name = "题库管理")
public class QuestionBankController {

    @Autowired
    private QuestionBankService questionBankService;

    @GetMapping("/page")
    @Operation(summary = "分页查询题库")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<QuestionBank>> getQuestionPage(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int current,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "题型") @RequestParam(required = false) Integer type,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "难度") @RequestParam(required = false) Integer difficulty,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword) {
        
        IPage<QuestionBank> result = questionBankService.getQuestionPage(current, size, type, status, difficulty, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取题目详情")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<QuestionBank> getQuestionDetail(@PathVariable Long id) {
        QuestionBank question = questionBankService.getQuestionDetail(id);
        return Result.success(question);
    }

    @PostMapping
    @Operation(summary = "创建题目")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> createQuestion(@Valid @RequestBody QuestionBank question,
                                         @AuthenticationPrincipal User currentUser) {
        boolean success = questionBankService.createQuestion(question, currentUser.getId());
        return success ? Result.success(true) : Result.error("创建题目失败");
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新题目")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> updateQuestion(@PathVariable Long id,
                                         @Valid @RequestBody QuestionBank question,
                                         @AuthenticationPrincipal User currentUser) {
        question.setId(id);
        boolean success = questionBankService.updateQuestion(question, currentUser.getId());
        return success ? Result.success(true) : Result.error("更新题目失败");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除题目")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> deleteQuestion(@PathVariable Long id) {
        boolean success = questionBankService.deleteQuestion(id);
        return success ? Result.success(true) : Result.error("删除题目失败");
    }

    @DeleteMapping("/batch")
    @Operation(summary = "批量删除题目")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> batchDeleteQuestions(@RequestBody List<Long> ids) {
        boolean success = questionBankService.batchDeleteQuestions(ids);
        return success ? Result.success(true) : Result.error("批量删除题目失败");
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "切换题目状态")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> toggleQuestionStatus(@PathVariable Long id,
                                               @RequestParam Integer status) {
        boolean success = questionBankService.toggleQuestionStatus(id, status);
        return success ? Result.success(true) : Result.error("切换题目状态失败");
    }

    @GetMapping("/stats")
    @Operation(summary = "获取题目统计")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Object> getQuestionStats() {
        Object stats = questionBankService.getQuestionStats();
        return Result.success(stats);
    }

    @GetMapping("/random")
    @Operation(summary = "获取随机题目（用于答题）")
    public Result<List<QuestionBank>> getRandomQuestions(
            @Parameter(description = "题型") @RequestParam Integer type,
            @Parameter(description = "数量") @RequestParam Integer count) {
        
        List<QuestionBank> questions = questionBankService.getRandomQuestions(type, count);
        return Result.success(questions);
    }
} 