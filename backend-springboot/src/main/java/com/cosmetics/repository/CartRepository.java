package com.cosmetics.repository;

import com.cosmetics.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository giỏ hàng — TV3
 */
@Repository
public interface CartRepository extends MongoRepository<Cart, String> {

    /** Tìm giỏ hàng theo userId (mỗi user có 1 giỏ) */
    Optional<Cart> findByUserId(String userId);

    /** Xóa toàn bộ giỏ hàng của user (dùng khi đặt hàng thành công) */
    void deleteByUserId(String userId);
}
