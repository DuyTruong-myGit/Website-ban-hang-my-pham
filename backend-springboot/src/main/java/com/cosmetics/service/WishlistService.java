package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Product;
import com.cosmetics.model.Wishlist;
import com.cosmetics.repository.ProductRepository;
import com.cosmetics.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    // ── Lấy DS yêu thích (kèm thông tin SP) ──────────────────────────────

    public List<Map<String, Object>> getWishlist(String userId) {
        List<Wishlist> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<String> productIds = items.stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());

        Map<String, Product> productMap = new HashMap<>();
        if (!productIds.isEmpty()) {
            List<Product> products = productRepository.findAllById(productIds);
            products.forEach(p -> productMap.put(p.getId(), p));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Wishlist item : items) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", item.getId());
            entry.put("productId", item.getProductId());
            entry.put("createdAt", item.getCreatedAt());

            Product product = productMap.get(item.getProductId());
            if (product != null) {
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("id", product.getId());
                productInfo.put("name", product.getName());
                productInfo.put("slug", product.getSlug());
                productInfo.put("images", product.getImages());
                productInfo.put("basePrice", product.getBasePrice());
                productInfo.put("salePrice", product.getSalePrice());
                productInfo.put("avgRating", product.getAvgRating());
                productInfo.put("reviewCount", product.getReviewCount());
                productInfo.put("inStock", product.getInStock());
                entry.put("product", productInfo);
            }
            result.add(entry);
        }

        return result;
    }

    // ── Thêm vào yêu thích ──────────────────────────────────────────────

    public Wishlist addToWishlist(String userId, String productId) {
        // Kiểm tra sản phẩm tồn tại
        productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Kiểm tra đã yêu thích chưa
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new AppException(ErrorCode.WISHLIST_ALREADY_EXISTS);
        }

        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .productId(productId)
                .createdAt(LocalDateTime.now())
                .build();

        return wishlistRepository.save(wishlist);
    }

    // ── Xóa khỏi yêu thích ─────────────────────────────────────────────

    public void removeFromWishlist(String userId, String productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new AppException(ErrorCode.WISHLIST_NOT_FOUND);
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    // ── Kiểm tra đã yêu thích ──────────────────────────────────────────

    public boolean isInWishlist(String userId, String productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    // ── Đếm số yêu thích ───────────────────────────────────────────────

    public long countWishlist(String userId) {
        return wishlistRepository.countByUserId(userId);
    }
}
