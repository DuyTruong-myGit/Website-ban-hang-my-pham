package com.cosmetics.service;

import com.cosmetics.dto.request.QuestionRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.ProductQuestion;
import com.cosmetics.model.User;
import com.cosmetics.repository.ProductQuestionRepository;
import com.cosmetics.repository.ProductRepository;
import com.cosmetics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private ProductQuestionRepository questionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    // ── Lấy câu hỏi sản phẩm ──────────────────────────────────────────────

    public List<ProductQuestion> getProductQuestions(String productId) {
        return questionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    // ── Đặt câu hỏi ─────────────────────────────────────────────────────────

    public ProductQuestion createQuestion(String userId, QuestionRequest request) {
        // Kiểm tra sản phẩm tồn tại
        productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ProductQuestion question = ProductQuestion.builder()
                .productId(request.getProductId())
                .userId(userId)
                .userName(user.getName())
                .question(request.getQuestion())
                .createdAt(LocalDateTime.now())
                .build();

        return questionRepository.save(question);
    }

    // ── Staff trả lời câu hỏi ────────────────────────────────────────────

    public ProductQuestion answerQuestion(String questionId, String staffId, String answer) {
        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        question.setAnswer(answer);
        question.setAnsweredBy(staffId);
        question.setAnsweredByName(staff.getName());
        question.setAnsweredAt(LocalDateTime.now());

        ProductQuestion saved = questionRepository.save(question);

        // Gửi thông báo cho người hỏi
        if (notificationService != null) {
            notificationService.createNotification(
                    question.getUserId(),
                    "question_answered",
                    "Câu hỏi đã được trả lời",
                    staff.getName() + " đã trả lời câu hỏi của bạn",
                    "/product/" + question.getProductId()
            );
        }

        return saved;
    }

    // ── Staff: Lấy câu hỏi chưa trả lời ────────────────────────────────

    public List<ProductQuestion> getUnansweredQuestions() {
        return questionRepository.findByAnswerIsNullOrderByCreatedAtAsc();
    }

    // ── Staff: Lấy tất cả ───────────────────────────────────────────────

    public List<ProductQuestion> getAllQuestions() {
        return questionRepository.findAllByOrderByCreatedAtDesc();
    }
}
