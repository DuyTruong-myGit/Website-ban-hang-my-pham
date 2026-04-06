package com.cosmetics.controller;

import com.cosmetics.dto.request.ReviewRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Review;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý Đánh giá sản phẩm — TV4
 */
@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ── Lấy reviews cho sản phẩm (public) ────────────────────────────────

    @GetMapping("/reviews/product/{productId}")
    public ApiResponse<Map<String, Object>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(required = false) Integer rating) {
        Map<String, Object> data = reviewService.getProductReviews(productId, rating);
        return ApiResponse.success(data);
    }

    // ── Tạo review ──────────────────────────────────────────────────────────

    @PostMapping("/reviews")
    public ApiResponse<Review> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        Review review = reviewService.createReview(userDetails.getId(), request);
        return ApiResponse.success(review, "Đánh giá thành công!");
    }

    // ── Bấm hữu ích ─────────────────────────────────────────────────────────

    @PutMapping("/reviews/{id}/helpful")
    public ApiResponse<Review> markHelpful(@PathVariable String id) {
        Review review = reviewService.markHelpful(id);
        return ApiResponse.success(review);
    }

    // ── Admin: Trả lời ──────────────────────────────────────────────────────

    @PutMapping("/admin/reviews/{id}/reply")
    public ApiResponse<Review> adminReply(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        Review review = reviewService.adminReply(id, userDetails.getId(), content);
        return ApiResponse.success(review, "Đã trả lời đánh giá.");
    }

    // ── Admin: Ẩn/hiện ──────────────────────────────────────────────────────

    @PutMapping("/admin/reviews/{id}/toggle-hide")
    public ApiResponse<Review> toggleHide(@PathVariable String id) {
        Review review = reviewService.toggleHide(id);
        return ApiResponse.success(review, review.getIsHidden() ? "Đã ẩn đánh giá." : "Đã hiện đánh giá.");
    }

    // ── Admin: Lấy tất cả reviews ──────────────────────────────────────────

    @GetMapping("/admin/reviews")
    public ApiResponse<List<Review>> getAllReviews() {
        return ApiResponse.success(reviewService.getAllReviews());
    }
}
