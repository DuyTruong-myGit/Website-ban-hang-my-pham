package com.cosmetics.repository;

import com.cosmetics.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    // Lấy reviews cho sản phẩm (không lấy bị ẩn)
    List<Review> findByProductIdAndIsHiddenFalseOrderByCreatedAtDesc(String productId);

    // Lấy tất cả reviews cho sản phẩm (admin dùng)
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);

    // Kiểm tra user đã review sản phẩm chưa
    boolean existsByProductIdAndUserId(String productId, String userId);

    // Đếm số review theo productId
    long countByProductIdAndIsHiddenFalse(String productId);

    // Lấy reviews theo rating
    List<Review> findByProductIdAndRatingAndIsHiddenFalse(String productId, Integer rating);

    // Tất cả reviews (admin)
    List<Review> findAllByOrderByCreatedAtDesc();
}
