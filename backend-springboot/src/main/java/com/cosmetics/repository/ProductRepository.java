package com.cosmetics.repository;

import com.cosmetics.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    
    // Dùng cho trang chủ Hasaki
    Page<Product> findByIsActiveTrueAndIsFeaturedTrue(Pageable pageable);
    Page<Product> findByIsActiveTrueAndIsBestSellerTrue(Pageable pageable);
    Page<Product> findByIsActiveTrueAndSalePriceGreaterThan(Double salePrice, Pageable pageable); // Flash sale
}