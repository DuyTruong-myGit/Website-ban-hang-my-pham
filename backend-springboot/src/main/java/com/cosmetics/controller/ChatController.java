package com.cosmetics.controller;

import com.cosmetics.dto.request.CreateChatRoomRequest;
import com.cosmetics.dto.request.SendMessageRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.config.WebSocketEventListener;
import com.cosmetics.model.ChatRoom;
import com.cosmetics.model.Message;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý Chat — TV4
 *
 * Endpoints:
 *   POST   /api/chat/rooms                → Tạo phòng chat mới
 *   GET    /api/chat/rooms                → Lấy DS phòng chat của user
 *   GET    /api/chat/rooms/{id}/messages   → Lấy tin nhắn trong phòng
 *   POST   /api/chat/rooms/{id}/messages   → Gửi tin nhắn (REST fallback)
 *   PUT    /api/chat/rooms/{id}/close      → Đóng phòng chat
 *   PUT    /api/chat/rooms/{id}/assign     → Staff tiếp nhận phòng
 *   PUT    /api/chat/rooms/{id}/read       → Đánh dấu đã đọc
 *   GET    /api/staff/chat/pending         → DS phòng chat đang chờ (staff)
 *   GET    /api/staff/chat/rooms           → DS phòng chat của staff
 *   GET    /api/staff/chat/all             → Tất cả phòng (admin/staff)
 */
@RestController
@RequestMapping("/api")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired(required = false)
    private WebSocketEventListener webSocketEventListener;

    // ── Customer: Tạo phòng chat ────────────────────────────────────────────

    @PostMapping("/chat/rooms")
    public ApiResponse<ChatRoom> createRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateChatRoomRequest request
    ) {
        ChatRoom room = chatService.createRoom(userDetails.getId(), request);
        return ApiResponse.success(room, "Phòng chat đã được tạo.");
    }

    // ── Customer: Lấy DS phòng chat của mình ────────────────────────────────

    @GetMapping("/chat/rooms")
    public ApiResponse<List<ChatRoom>> getMyRooms(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ChatRoom> rooms = chatService.getCustomerRooms(userDetails.getId());
        return ApiResponse.success(rooms);
    }

    // ── Lấy tin nhắn trong phòng ────────────────────────────────────────────

    @GetMapping("/chat/rooms/{id}/messages")
    public ApiResponse<List<Message>> getMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        List<Message> messages = chatService.getMessages(id, userDetails.getId());
        return ApiResponse.success(messages);
    }

    // ── Gửi tin nhắn (REST fallback — WebSocket là cách chính) ──────────────

    @PostMapping("/chat/rooms/{id}/messages")
    public ApiResponse<Message> sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody SendMessageRequest request
    ) {
        Message message = chatService.sendMessage(id, userDetails.getId(), request);
        return ApiResponse.success(message, "Đã gửi tin nhắn.");
    }

    // ── Đóng phòng chat ─────────────────────────────────────────────────────

    @PutMapping("/chat/rooms/{id}/close")
    public ApiResponse<ChatRoom> closeRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        ChatRoom room = chatService.closeRoom(id, userDetails.getId());
        return ApiResponse.success(room, "Phòng chat đã đóng.");
    }

    // ── Staff: Tiếp nhận phòng chat ─────────────────────────────────────────

    @PutMapping("/chat/rooms/{id}/assign")
    public ApiResponse<ChatRoom> assignRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        ChatRoom room = chatService.assignRoom(id, userDetails.getId());
        return ApiResponse.success(room, "Đã tiếp nhận phòng chat.");
    }

    // ── Đánh dấu đã đọc ────────────────────────────────────────────────────

    @PutMapping("/chat/rooms/{id}/read")
    public ApiResponse<Void> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        chatService.markAsRead(id, userDetails.getId());
        return ApiResponse.success(null, "Đã đánh dấu đã đọc.");
    }

    // ── Staff: DS phòng chat đang chờ ───────────────────────────────────────

    @GetMapping("/staff/chat/pending")
    public ApiResponse<List<ChatRoom>> getPendingRooms() {
        List<ChatRoom> rooms = chatService.getPendingRooms();
        return ApiResponse.success(rooms);
    }

    // ── Staff: DS phòng chat của mình ───────────────────────────────────────

    @GetMapping("/staff/chat/rooms")
    public ApiResponse<List<ChatRoom>> getStaffRooms(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ChatRoom> rooms = chatService.getStaffRooms(userDetails.getId());
        return ApiResponse.success(rooms);
    }

    // ── Staff/Admin: Tất cả phòng chat ──────────────────────────────────────

    @GetMapping("/staff/chat/all")
    public ApiResponse<List<ChatRoom>> getAllRooms() {
        List<ChatRoom> rooms = chatService.getAllRooms();
        return ApiResponse.success(rooms);
    }

    // ── Admin: Xóa phòng chat ───────────────────────────────────────────────

    @DeleteMapping("/admin/chat/rooms/{id}")
    public ApiResponse<Void> deleteRoom(@PathVariable String id) {
        chatService.deleteRoom(id);
        return ApiResponse.success(null, "Đã xóa phòng chat.");
    }

    // ── Kiểm tra user đang online ────────────────────────────────────────────

    @GetMapping("/chat/online/{userId}")
    public ApiResponse<Map<String, Object>> isUserOnline(@PathVariable String userId) {
        boolean isOnline = webSocketEventListener != null && webSocketEventListener.isUserOnline(userId);
        return ApiResponse.success(Map.of("userId", userId, "isOnline", isOnline));
    }
}
