package com.cosmetics.service;

import com.cosmetics.dto.request.CreateChatRoomRequest;
import com.cosmetics.dto.request.SendMessageRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.ChatRoom;
import com.cosmetics.model.Message;
import com.cosmetics.model.User;
import com.cosmetics.repository.ChatRoomRepository;
import com.cosmetics.repository.MessageRepository;
import com.cosmetics.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    // ── Tạo phòng chat mới ──────────────────────────────────────────────────

    public ChatRoom createRoom(String customerId, CreateChatRoomRequest request) {
        // Kiểm tra khách đã có phòng chat đang mở chưa
        List<ChatRoom> existingRooms = chatRoomRepository
                .findByCustomerIdAndStatusIn(customerId, Arrays.asList("waiting", "active"));
        if (!existingRooms.isEmpty()) {
            // Trả về phòng chat đã mở thay vì tạo mới
            return existingRooms.get(0);
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ChatRoom room = ChatRoom.builder()
                .customerId(customerId)
                .customerName(customer.getName())
                .subject(request.getSubject())
                .status("waiting")
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(room);

        // Thông báo cho staff qua WebSocket
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/staff/new-room", savedRoom);
        }

        log.info("Tạo phòng chat mới: {} — Khách: {}", savedRoom.getId(), customer.getName());
        return savedRoom;
    }

    // ── Lấy DS phòng chat của khách hàng ────────────────────────────────────

    public List<ChatRoom> getCustomerRooms(String customerId) {
        return chatRoomRepository.findByCustomerIdOrderByUpdatedAtDesc(customerId);
    }

    // ── Lấy DS phòng chat của staff ─────────────────────────────────────────

    public List<ChatRoom> getStaffRooms(String staffId) {
        return chatRoomRepository.findByStaffIdOrderByUpdatedAtDesc(staffId);
    }

    // ── Lấy DS phòng chat đang chờ (cho staff) ─────────────────────────────

    public List<ChatRoom> getPendingRooms() {
        return chatRoomRepository.findByStatusOrderByCreatedAtAsc("waiting");
    }

    // ── Lấy tất cả phòng (cho admin/staff xem tổng quan) ───────────────────

    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }

    // ── Lấy tin nhắn trong phòng ────────────────────────────────────────────

    public List<Message> getMessages(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHATROOM_NOT_FOUND));

        // Kiểm tra quyền truy cập (khách hàng chỉ xem phòng của mình, staff/admin xem tất cả)
        // Cho phép truy cập nếu là customer của phòng, hoặc staff/admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole().equals("customer") && !room.getCustomerId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return messageRepository.findByRoomIdOrderByCreatedAtAsc(roomId);
    }

    // ── Gửi tin nhắn ────────────────────────────────────────────────────────

    public Message sendMessage(String roomId, String senderId, SendMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHATROOM_NOT_FOUND));

        // Không cho gửi tin vào phòng đã đóng
        if ("closed".equals(room.getStatus())) {
            throw new AppException(ErrorCode.MESSAGE_SEND_FAILED);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Message message = Message.builder()
                .roomId(roomId)
                .senderId(senderId)
                .senderName(sender.getName())
                .senderRole(sender.getRole())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        // Cập nhật thông tin phòng chat
        room.setLastMessage(request.getContent() != null ? request.getContent() : "[Hình ảnh]");
        room.setLastMessageAt(LocalDateTime.now());

        // Tăng số tin nhắn chưa đọc cho phía đối diện
        if ("customer".equals(sender.getRole())) {
            room.setUnreadStaff(room.getUnreadStaff() + 1);
        } else {
            room.setUnreadCustomer(room.getUnreadCustomer() + 1);
        }

        chatRoomRepository.save(room);

        // Gửi tin nhắn realtime qua WebSocket
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
        }

        return savedMessage;
    }

    // ── Staff tiếp nhận phòng chat ──────────────────────────────────────────

    public ChatRoom assignRoom(String roomId, String staffId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHATROOM_NOT_FOUND));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        room.setStaffId(staffId);
        room.setStaffName(staff.getName());
        room.setStatus("active");

        ChatRoom updatedRoom = chatRoomRepository.save(room);

        // Thông báo cho khách hàng rằng staff đã tiếp nhận
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/status",
                    Map.of("type", "room_assigned", "staffName", staff.getName(), "roomId", roomId));
        }

        log.info("Staff {} tiếp nhận phòng chat {}", staff.getName(), roomId);
        return updatedRoom;
    }

    // ── Đóng phòng chat ─────────────────────────────────────────────────────

    public ChatRoom closeRoom(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHATROOM_NOT_FOUND));

        room.setStatus("closed");
        ChatRoom updatedRoom = chatRoomRepository.save(room);

        // Thông báo qua WebSocket
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/status",
                    Map.of("type", "room_closed", "roomId", roomId));
        }

        log.info("Phòng chat {} đã đóng bởi user {}", roomId, userId);
        return updatedRoom;
    }

    // ── Đánh dấu đã đọc ────────────────────────────────────────────────────

    public void markAsRead(String roomId, String userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.CHATROOM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if ("customer".equals(user.getRole())) {
            room.setUnreadCustomer(0);
        } else {
            room.setUnreadStaff(0);
        }

        chatRoomRepository.save(room);
    }
}
