package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Payment;
import com.cosmetics.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.cosmetics.security.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller thanh toán — TV3
 *
 * GET /api/payments/:orderId
 *   → Lấy thông tin thanh toán của đơn hàng (cần JWT)
 *   → Dùng để hiển thị trạng thái payment trong trang chi tiết đơn
 *   → Tự tạo payment record nếu đơn cũ chưa có
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Lấy thông tin thanh toán theo orderId.
     *
     * GET /api/payments/:orderId
     * Authorization: Bearer <jwt>
     */
    @GetMapping("/{orderId}")
    public ApiResponse<Payment> getPaymentByOrderId(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderId
    ) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ApiResponse.success(payment);
    }
}
