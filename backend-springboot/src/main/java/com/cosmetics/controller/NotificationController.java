package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Notification;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller quản lý Thông báo — TV4
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // ── Lấy DS thông báo ──────────────────────────────────────────────────

    @GetMapping
    public ApiResponse<Map<String, Object>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.success(notificationService.getNotifications(userDetails.getId()));
    }

    // ── Đánh dấu đã đọc ──────────────────────────────────────────────────

    @PutMapping("/{id}/read")
    public ApiResponse<Notification> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Notification notification = notificationService.markAsRead(id, userDetails.getId());
        return ApiResponse.success(notification);
    }

    // ── Đánh dấu tất cả đã đọc ──────────────────────────────────────────

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ApiResponse.success(null, "Đã đánh dấu tất cả đã đọc.");
    }

    // ── Đếm chưa đọc ────────────────────────────────────────────────────

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ApiResponse.success(Map.of("unreadCount", count));
    }
}
