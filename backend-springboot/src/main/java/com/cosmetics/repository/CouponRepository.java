package com.cosmetics.repository;

import com.cosmetics.model.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository mã giảm giá — TV3
 */
@Repository
public interface CouponRepository extends MongoRepository<Coupon, String> {

    /** Tìm coupon theo mã (case-sensitive) */
    Optional<Coupon> findByCode(String code);

    /** Lấy danh sách coupon đang hoạt động */
    List<Coupon> findByIsActiveTrueOrderByCreatedAtDesc();
}
