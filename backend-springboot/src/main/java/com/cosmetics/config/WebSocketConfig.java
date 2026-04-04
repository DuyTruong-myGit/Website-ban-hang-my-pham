package com.cosmetics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket dùng STOMP + SockJS cho chat realtime — TV4
 *
 * Client kết nối: ws://localhost:8080/ws (SockJS fallback)
 * Subscribe:      /topic/chat/{roomId}          → tin nhắn mới
 *                 /topic/chat/{roomId}/status    → trạng thái phòng (assign, close)
 *                 /topic/staff/new-room          → thông báo phòng chat mới cho staff
 * Send:           /app/chat.send                 → gửi tin nhắn
 *                 /app/chat.typing               → đang gõ
 *                 /app/chat.read                 → đánh dấu đã đọc
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix cho subscribe (nhận tin từ server)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix cho send (gửi tin từ client)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket — client sẽ kết nối tới đây
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép mọi origin (dev)
                .withSockJS(); // Fallback cho trình duyệt cũ
    }
}
