package com.cosmetics.config;

import com.cosmetics.model.ChatRoom;
import com.cosmetics.repository.ChatRoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;


import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lắng nghe sự kiện WebSocket connect/disconnect
 * Broadcast trạng thái online/offline cho phòng chat active
 */
@Component
@Slf4j
public class WebSocketEventListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    // Map: sessionId -> userId (track ai đang online)
    private final ConcurrentHashMap<String, String> onlineSessions = new ConcurrentHashMap<>();

    // Map: userId -> số lượng sessions (1 user có thể mở nhiều tab)
    private final ConcurrentHashMap<String, Integer> userSessionCount = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        // userId sẽ được set khi client gửi presence message
        log.info("WebSocket session connected: {}", sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        String userId = onlineSessions.remove(sessionId);
        if (userId != null) {
            int remaining = userSessionCount.getOrDefault(userId, 1) - 1;
            if (remaining <= 0) {
                userSessionCount.remove(userId);
                // Broadcast offline cho tất cả phòng chat active của user này
                broadcastPresence(userId, false);
                log.info("User {} đã offline (session: {})", userId, sessionId);
            } else {
                userSessionCount.put(userId, remaining);
                log.info("User {} vẫn online ({} sessions còn lại)", userId, remaining);
            }
        }

        log.info("WebSocket session disconnected: {}", sessionId);
    }

    /**
     * Đăng ký session cho user (gọi từ ChatWebSocketController khi nhận presence)
     */
    public void registerSession(String sessionId, String userId) {
        onlineSessions.put(sessionId, userId);
        userSessionCount.merge(userId, 1, Integer::sum);
        broadcastPresence(userId, true);
        log.info("User {} registered session {} (total: {})", userId, sessionId, userSessionCount.get(userId));
    }

    /**
     * Kiểm tra user có đang online không
     */
    public boolean isUserOnline(String userId) {
        return userSessionCount.containsKey(userId) && userSessionCount.get(userId) > 0;
    }

    /**
     * Broadcast trạng thái online/offline vào tất cả phòng chat active của user
     */
    private void broadcastPresence(String userId, boolean isOnline) {
        try {
            // Tìm tất cả phòng chat active mà user tham gia (staff hoặc customer)
            List<ChatRoom> activeRooms = chatRoomRepository.findByStatusOrderByCreatedAtAsc("active");

            for (ChatRoom room : activeRooms) {
                boolean isParticipant = userId.equals(room.getStaffId()) || userId.equals(room.getCustomerId());
                if (isParticipant) {
                    String role = userId.equals(room.getStaffId()) ? "staff" : "customer";
                    messagingTemplate.convertAndSend("/topic/chat/" + room.getId() + "/presence",
                            Map.of(
                                    "userId", userId,
                                    "role", role,
                                    "isOnline", isOnline,
                                    "roomId", room.getId()
                            ));
                }
            }
        } catch (Exception e) {
            log.error("Lỗi broadcast presence: {}", e.getMessage());
        }
    }
}
