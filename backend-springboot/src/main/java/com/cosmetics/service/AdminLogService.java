package com.cosmetics.service;

import com.cosmetics.model.AdminLog;
import com.cosmetics.repository.AdminLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AdminLogService {

    @Autowired
    private AdminLogRepository adminLogRepository;

    /**
     * Ghi log hành động admin/staff — được gọi từ các controller/service khác
     */
    public AdminLog createLog(String userId, String action, String target, Map<String, Object> metadata) {
        AdminLog log = AdminLog.builder()
                .userId(userId)
                .action(action)
                .target(target)
                .metadata(metadata != null ? metadata : Map.of())
                .build();
        return adminLogRepository.save(log);
    }

    /**
     * Lấy danh sách logs có phân trang + filter
     */
    public Page<AdminLog> getLogs(String userId, String action, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        boolean hasUser = userId != null && !userId.isEmpty();
        boolean hasAction = action != null && !action.isEmpty();
        boolean hasDate = from != null && to != null;

        if (hasUser && hasAction && hasDate) {
            return adminLogRepository.findByUserIdAndActionAndCreatedAtBetween(userId, action, from, to, pageable);
        } else if (hasUser && hasAction) {
            return adminLogRepository.findByUserIdAndAction(userId, action, pageable);
        } else if (hasUser && hasDate) {
            return adminLogRepository.findByUserIdAndCreatedAtBetween(userId, from, to, pageable);
        } else if (hasAction && hasDate) {
            return adminLogRepository.findByActionAndCreatedAtBetween(action, from, to, pageable);
        } else if (hasUser) {
            return adminLogRepository.findByUserId(userId, pageable);
        } else if (hasAction) {
            return adminLogRepository.findByAction(action, pageable);
        } else if (hasDate) {
            return adminLogRepository.findByCreatedAtBetween(from, to, pageable);
        }

        return adminLogRepository.findAll(pageable);
    }
}
