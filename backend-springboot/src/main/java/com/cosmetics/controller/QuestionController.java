package com.cosmetics.controller;

import com.cosmetics.dto.request.QuestionRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.ProductQuestion;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý Hỏi đáp sản phẩm — TV4
 */
@RestController
@RequestMapping("/api")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // ── Lấy câu hỏi sản phẩm (public) ──────────────────────────────────

    @GetMapping("/questions/product/{productId}")
    public ApiResponse<List<ProductQuestion>> getProductQuestions(@PathVariable String productId) {
        return ApiResponse.success(questionService.getProductQuestions(productId));
    }

    // ── Đặt câu hỏi (customer) ─────────────────────────────────────────

    @PostMapping("/questions")
    public ApiResponse<ProductQuestion> createQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuestionRequest request) {
        ProductQuestion question = questionService.createQuestion(userDetails.getId(), request);
        return ApiResponse.success(question, "Đã gửi câu hỏi!");
    }

    // ── Staff trả lời ───────────────────────────────────────────────────────

    @PutMapping("/staff/questions/{id}/answer")
    public ApiResponse<ProductQuestion> answerQuestion(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String answer = body.get("answer");
        ProductQuestion question = questionService.answerQuestion(id, userDetails.getId(), answer);
        return ApiResponse.success(question, "Đã trả lời câu hỏi.");
    }

    // ── Staff: DS câu hỏi chưa TL ──────────────────────────────────────

    @GetMapping("/staff/questions/pending")
    public ApiResponse<List<ProductQuestion>> getPendingQuestions() {
        return ApiResponse.success(questionService.getUnansweredQuestions());
    }

    // ── Staff: Tất cả câu hỏi ──────────────────────────────────────────

    @GetMapping("/staff/questions")
    public ApiResponse<List<ProductQuestion>> getAllQuestions() {
        return ApiResponse.success(questionService.getAllQuestions());
    }
}
