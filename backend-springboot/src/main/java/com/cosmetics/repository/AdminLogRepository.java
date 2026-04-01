package com.cosmetics.repository;

import com.cosmetics.model.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AdminLogRepository extends MongoRepository<AdminLog, String> {
    Page<AdminLog> findByUserId(String userId, Pageable pageable);
    Page<AdminLog> findByAction(String action, Pageable pageable);
    Page<AdminLog> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<AdminLog> findByUserIdAndAction(String userId, String action, Pageable pageable);
    Page<AdminLog> findByUserIdAndCreatedAtBetween(String userId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<AdminLog> findByActionAndCreatedAtBetween(String action, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<AdminLog> findByUserIdAndActionAndCreatedAtBetween(String userId, String action, LocalDateTime from, LocalDateTime to, Pageable pageable);
}
