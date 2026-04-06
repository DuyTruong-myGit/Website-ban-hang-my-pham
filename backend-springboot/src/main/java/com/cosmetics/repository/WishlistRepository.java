package com.cosmetics.repository;

import com.cosmetics.model.Wishlist;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends MongoRepository<Wishlist, String> {

    // Lấy DS yêu thích của user
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(String userId);

    // Tìm item cụ thể
    Optional<Wishlist> findByUserIdAndProductId(String userId, String productId);

    // Kiểm tra đã yêu thích chưa
    boolean existsByUserIdAndProductId(String userId, String productId);

    // Xóa khỏi yêu thích
    void deleteByUserIdAndProductId(String userId, String productId);

    // Đếm số SP yêu thích
    long countByUserId(String userId);
}
