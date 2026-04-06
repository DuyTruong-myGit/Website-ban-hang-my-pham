package com.cosmetics.repository;

import com.cosmetics.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // DS thông báo user (mới nhất trước)
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    // Đếm chưa đọc
    long countByUserIdAndIsReadFalse(String userId);

    // Lấy chưa đọc
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
}
