package com.cosmetics.repository;

import com.cosmetics.model.ProductQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductQuestionRepository extends MongoRepository<ProductQuestion, String> {

    // Lấy câu hỏi cho sản phẩm
    List<ProductQuestion> findByProductIdOrderByCreatedAtDesc(String productId);

    // Lấy câu hỏi chưa trả lời (staff dùng)
    List<ProductQuestion> findByAnswerIsNullOrderByCreatedAtAsc();

    // Tất cả câu hỏi (staff dùng)
    List<ProductQuestion> findAllByOrderByCreatedAtDesc();
}
