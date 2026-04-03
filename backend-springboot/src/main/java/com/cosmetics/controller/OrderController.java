package com.cosmetics.controller;

import com.cosmetics.dto.request.CreateOrderRequest;
import com.cosmetics.dto.request.UpdateOrderStatusRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Order;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller quản lý đơn hàng — TV3
 *
 * User endpoints (cần JWT):
 *   POST   /api/orders                     → Tạo đơn hàng từ giỏ hàng
 *   GET    /api/orders                     → Lịch sử đơn của tôi
 *   GET    /api/orders/{id}                → Chi tiết đơn của tôi
 *   PUT    /api/orders/{id}/cancel         → Hủy đơn (chỉ khi pending)
 *
 * Admin/Staff endpoints (cần JWT + role):
 *   GET    /api/admin/orders               → Tất cả đơn hàng + phân trang
 *   PUT    /api/admin/orders/{id}/status   → Cập nhật trạng thái đơn
 */
@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ── USER: Tạo đơn hàng ──────────────────────────────────────────────────

    @PostMapping("/api/orders")
    public ApiResponse<Order> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        Order order = orderService.createOrder(userDetails.getId(), request);
        return ApiResponse.success(order, "Đặt hàng thành công! Mã đơn: " + order.getOrderCode());
    }

    // ── USER: Lịch sử đơn hàng ──────────────────────────────────────────────

    @GetMapping("/api/orders")
    public ApiResponse<List<Order>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Order> orders = orderService.getMyOrders(userDetails.getId());
        return ApiResponse.success(orders);
    }

    // ── USER: Chi tiết đơn ──────────────────────────────────────────────────

    @GetMapping("/api/orders/{id}")
    public ApiResponse<Order> getMyOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        Order order = orderService.getMyOrderById(userDetails.getId(), id);
        return ApiResponse.success(order);
    }

    // ── USER: Hủy đơn ───────────────────────────────────────────────────────

    @PutMapping("/api/orders/{id}/cancel")
    public ApiResponse<Order> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        Order order = orderService.cancelMyOrder(userDetails.getId(), id);
        return ApiResponse.success(order, "Đơn hàng đã được hủy.");
    }

    // ── ADMIN/STAFF: Tất cả đơn hàng ────────────────────────────────────────

    @GetMapping("/api/admin/orders")
    public ApiResponse<List<Order>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        Page<Order> orderPage = orderService.getAllOrders(status, page, limit);

        ApiResponse.Pagination pagination = ApiResponse.Pagination.builder()
                .page(page)
                .limit(limit)
                .total(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();

        return ApiResponse.success(orderPage.getContent(), pagination);
    }

    // ── ADMIN/STAFF: Cập nhật trạng thái ────────────────────────────────────

    @PutMapping("/api/admin/orders/{id}/status")
    public ApiResponse<Order> updateOrderStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        Order order = orderService.updateOrderStatus(id, request, userDetails.getId());
        return ApiResponse.success(order, "Cập nhật trạng thái thành công.");
    }
}
