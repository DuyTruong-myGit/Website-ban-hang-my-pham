package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Wishlist;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý Danh sách yêu thích — TV4
 */
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // ── Lấy DS yêu thích ──────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.success(wishlistService.getWishlist(userDetails.getId()));
    }

    // ── Thêm vào yêu thích ──────────────────────────────────────────────

    @PostMapping("/{productId}")
    public ApiResponse<Wishlist> addToWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId) {
        Wishlist wishlist = wishlistService.addToWishlist(userDetails.getId(), productId);
        return ApiResponse.success(wishlist, "Đã thêm vào yêu thích!");
    }

    // ── Xóa khỏi yêu thích ─────────────────────────────────────────────

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> removeFromWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId) {
        wishlistService.removeFromWishlist(userDetails.getId(), productId);
        return ApiResponse.success(null, "Đã xóa khỏi yêu thích.");
    }

    // ── Kiểm tra đã yêu thích ──────────────────────────────────────────

    @GetMapping("/check/{productId}")
    public ApiResponse<Map<String, Object>> checkWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String productId) {
        boolean inWishlist = wishlistService.isInWishlist(userDetails.getId(), productId);
        long count = wishlistService.countWishlist(userDetails.getId());
        return ApiResponse.success(Map.of("inWishlist", inWishlist, "totalCount", count));
    }
}
