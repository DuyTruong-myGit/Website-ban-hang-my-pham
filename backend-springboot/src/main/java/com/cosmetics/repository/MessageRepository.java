package com.cosmetics.repository;

import com.cosmetics.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    // Lấy tất cả tin nhắn trong 1 phòng (sắp xếp theo thời gian)
    List<Message> findByRoomIdOrderByCreatedAtAsc(String roomId);

    // Đếm tin nhắn chưa đọc trong phòng (cho 1 phía)
    long countByRoomIdAndSenderRoleNotAndIsReadFalse(String roomId, String senderRole);
}
