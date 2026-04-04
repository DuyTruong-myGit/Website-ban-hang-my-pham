package com.cosmetics.controller;

import com.cosmetics.dto.request.SendMessageRequest;
import com.cosmetics.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * WebSocket Controller cho chat realtime — TV4
 *
 * Client gửi:
 *   /app/chat.send/{roomId}    → gửi tin nhắn
 *   /app/chat.typing/{roomId}  → đang gõ
 *   /app/chat.read/{roomId}    → đánh dấu đã đọc
 */
@Controller
@Slf4j
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Xử lý tin nhắn gửi qua WebSocket
     * Client gửi: /app/chat.send/{roomId}
     * Payload: { senderId, content, imageUrl }
     */
    @MessageMapping("/chat.send/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload Map<String, String> payload
    ) {
        try {
            String senderId = payload.get("senderId");
            SendMessageRequest request = new SendMessageRequest();
            request.setContent(payload.get("content"));
            request.setImageUrl(payload.get("imageUrl"));

            // ChatService.sendMessage đã tự gửi qua /topic/chat/{roomId}
            chatService.sendMessage(roomId, senderId, request);
        } catch (Exception e) {
            log.error("Lỗi gửi tin nhắn WebSocket: {}", e.getMessage());
        }
    }

    /**
     * Xử lý sự kiện "đang gõ"
     * Client gửi: /app/chat.typing/{roomId}
     * Payload: { senderId, senderName, isTyping }
     */
    @MessageMapping("/chat.typing/{roomId}")
    public void typing(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload
    ) {
        // Chuyển tiếp sự kiện typing cho đối phương
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing", payload);
    }

    /**
     * Xử lý sự kiện "đã đọc"
     * Client gửi: /app/chat.read/{roomId}
     * Payload: { userId }
     */
    @MessageMapping("/chat.read/{roomId}")
    public void markAsRead(
            @DestinationVariable String roomId,
            @Payload Map<String, String> payload
    ) {
        String userId = payload.get("userId");
        chatService.markAsRead(roomId, userId);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/read",
                Map.of("userId", userId, "roomId", roomId));
    }
}
