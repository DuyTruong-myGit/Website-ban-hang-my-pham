package com.cosmetics.repository;

import com.cosmetics.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {

    // Lấy DS phòng chat của 1 khách hàng
    List<ChatRoom> findByCustomerIdOrderByUpdatedAtDesc(String customerId);

    // Lấy DS phòng chat được chỉ định cho 1 staff
    List<ChatRoom> findByStaffIdOrderByUpdatedAtDesc(String staffId);

    // Lấy DS phòng chat theo trạng thái
    List<ChatRoom> findByStatusOrderByCreatedAtAsc(String status);

    // Lấy DS phòng chat của staff theo trạng thái
    List<ChatRoom> findByStaffIdAndStatusOrderByUpdatedAtDesc(String staffId, String status);

    // Kiểm tra khách có phòng chat đang mở hay chưa (tránh tạo trùng)
    List<ChatRoom> findByCustomerIdAndStatusIn(String customerId, List<String> statuses);
}
