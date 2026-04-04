package com.cosmetics.service;

import com.cosmetics.dto.request.ReviewRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Product;
import com.cosmetics.model.Review;
import com.cosmetics.model.User;
import com.cosmetics.repository.ProductRepository;
import com.cosmetics.repository.ReviewRepository;
import com.cosmetics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired(required = false)
    private NotificationService notificationService;

    // ── Lấy reviews cho sản phẩm (public) ─────────────────────────────────

    public Map<String, Object> getProductReviews(String productId, Integer filterRating) {
        List<Review> reviews;
        if (filterRating != null && filterRating >= 1 && filterRating <= 5) {
            reviews = reviewRepository.findByProductIdAndRatingAndIsHiddenFalse(productId, filterRating);
        } else {
            reviews = reviewRepository.findByProductIdAndIsHiddenFalseOrderByCreatedAtDesc(productId);
        }

        // Tính stats
        List<Review> allReviews = reviewRepository.findByProductIdAndIsHiddenFalseOrderByCreatedAtDesc(productId);
        Map<String, Object> stats = calculateStats(allReviews);

        Map<String, Object> result = new HashMap<>();
        result.put("reviews", reviews);
        result.put("stats", stats);
        return result;
    }

    private Map<String, Object> calculateStats(List<Review> reviews) {
        Map<String, Object> stats = new HashMap<>();
        if (reviews.isEmpty()) {
            stats.put("avgRating", 0.0);
            stats.put("totalReviews", 0);
            stats.put("distribution", Map.of(1, 0, 2, 0, 3, 0, 4, 0, 5, 0));
            return stats;
        }

        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        Map<Integer, Long> dist = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));

        Map<Integer, Long> fullDist = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            fullDist.put(i, dist.getOrDefault(i, 0L));
        }

        stats.put("avgRating", Math.round(avg * 10.0) / 10.0);
        stats.put("totalReviews", reviews.size());
        stats.put("distribution", fullDist);
        return stats;
    }

    // ── Tạo review ──────────────────────────────────────────────────────────

    public Review createReview(String userId, ReviewRequest request) {
        // Kiểm tra đã review chưa
        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), userId)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // Kiểm tra sản phẩm tồn tại
        productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(userId)
                .userName(user.getName())
                .orderId(request.getOrderId())
                .rating(request.getRating())
                .comment(request.getComment())
                .images(request.getImages())
                .skinType(request.getSkinType())
                .helpfulCount(0)
                .isHidden(false)
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);

        // Cập nhật avgRating và reviewCount trên Product
        updateProductRating(request.getProductId());

        return saved;
    }

    // ── Cập nhật rating trung bình của sản phẩm ─────────────────────────────

    private void updateProductRating(String productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsHiddenFalseOrderByCreatedAtDesc(productId);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        int count = reviews.size();

        Query query = new Query(Criteria.where("id").is(productId));
        Update update = new Update()
                .set("avgRating", Math.round(avg * 10.0) / 10.0)
                .set("reviewCount", count);
        mongoTemplate.updateFirst(query, update, Product.class);
    }

    // ── Bấm hữu ích (+1 helpful) ───────────────────────────────────────────

    public Review markHelpful(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return reviewRepository.save(review);
    }

    // ── Admin: Trả lời review ───────────────────────────────────────────────

    public Review adminReply(String reviewId, String adminId, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Review.AdminReply reply = Review.AdminReply.builder()
                .content(content)
                .repliedBy(adminId)
                .repliedByName(admin.getName())
                .repliedAt(LocalDateTime.now())
                .build();

        review.setAdminReply(reply);
        Review saved = reviewRepository.save(review);

        // Gửi thông báo cho người đánh giá
        if (notificationService != null) {
            notificationService.createNotification(
                    review.getUserId(),
                    "review_reply",
                    "Phản hồi đánh giá",
                    admin.getName() + " đã trả lời đánh giá của bạn",
                    "/product/" + review.getProductId()
            );
        }

        return saved;
    }

    // ── Admin: Ẩn/hiện review ────────────────────────────────────────────

    public Review toggleHide(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setIsHidden(!review.getIsHidden());
        Review saved = reviewRepository.save(review);

        // Cập nhật rating sản phẩm
        updateProductRating(review.getProductId());

        return saved;
    }

    // ── Admin: Lấy tất cả reviews ──────────────────────────────────────────

    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }
}
