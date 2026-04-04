package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Order;
import com.cosmetics.model.Payment;
import com.cosmetics.repository.OrderRepository;
import com.cosmetics.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service xử lý thanh toán — TV3
 *
 * Luồng COD:
 *  1. Khi tạo đơn hàng → OrderService gọi createPaymentRecord() → tạo Payment với status=pending
 *  2. Khi đơn "delivered" → updatePaymentStatus("paid")
 *  3. Khi đơn "cancelled" → updatePaymentStatus("refunded") nếu đã paid, ngược lại "failed"
 */
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Tạo bản ghi thanh toán khi đặt hàng
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tạo bản ghi Payment ngay khi Order được tạo.
     * Gọi từ OrderService sau khi save đơn thành công.
     */
    public Payment createPaymentRecord(Order order) {
        // Tránh tạo trùng
        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            return paymentRepository.findByOrderId(order.getId()).get();
        }

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus("pending")
                .amount(order.getTotal())
                .note("Thanh toán khi nhận hàng (COD)")
                .build();

        return paymentRepository.save(payment);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy thông tin thanh toán
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lấy thông tin thanh toán theo orderId.
     * Nếu chưa có bản ghi (đơn cũ), tạo mới tự động.
     */
    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId).orElseGet(() -> {
            // Tự tạo payment record nếu đơn cũ chưa có
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
            return createPaymentRecord(order);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cập nhật trạng thái thanh toán (gọi từ OrderService khi đổi trạng thái đơn)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Đồng bộ trạng thái Payment khi Order thay đổi trạng thái.
     *
     * Mapping:
     *   order "delivered"  → payment "paid" + ghi paidAt
     *   order "cancelled"  → payment "refunded" (nếu đã paid) hoặc "failed"
     */
    public void syncPaymentStatus(String orderId, String newOrderStatus) {
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            switch (newOrderStatus) {
                case "delivered" -> {
                    payment.setPaymentStatus("paid");
                    payment.setPaidAt(LocalDateTime.now());
                    payment.setNote("Đã giao hàng thành công — COD thu tiền.");
                }
                case "cancelled" -> {
                    if ("paid".equals(payment.getPaymentStatus())) {
                        payment.setPaymentStatus("refunded");
                        payment.setNote("Đơn hàng bị hủy — chờ hoàn tiền.");
                    } else {
                        payment.setPaymentStatus("failed");
                        payment.setNote("Đơn hàng bị hủy trước khi thanh toán.");
                    }
                }
                default -> { /* pending, confirmed, shipping → không đổi payment status */ }
            }
            paymentRepository.save(payment);
        });
    }
}
