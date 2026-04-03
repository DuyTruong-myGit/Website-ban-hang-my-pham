package com.cosmetics.repository;

import com.cosmetics.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository đơn hàng — TV3
 */
@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    /** Lấy tất cả đơn hàng của 1 user, sắp xếp theo thời gian mới nhất */
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Lấy đơn hàng theo userId + id (để chắc chắn user chỉ xem đơn của mình) */
    Optional<Order> findByIdAndUserId(String id, String userId);

    /** Lấy đơn theo mã đơn hàng */
    Optional<Order> findByOrderCode(String orderCode);

    /** Admin/Staff: xem tất cả đơn hàng, có phân trang */
    Page<Order> findAll(Pageable pageable);

    /** Admin/Staff: lọc theo status */
    Page<Order> findByStatus(String status, Pageable pageable);
}
