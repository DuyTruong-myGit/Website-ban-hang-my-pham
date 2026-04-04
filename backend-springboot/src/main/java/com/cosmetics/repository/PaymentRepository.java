package com.cosmetics.repository;

import com.cosmetics.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thanh toán — TV3
 */
@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    /** Tìm payment theo orderId */
    Optional<Payment> findByOrderId(String orderId);

    /** Tìm payment theo orderCode */
    Optional<Payment> findByOrderCode(String orderCode);
}
