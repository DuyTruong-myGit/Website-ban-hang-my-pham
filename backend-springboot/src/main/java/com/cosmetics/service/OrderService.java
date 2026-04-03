package com.cosmetics.service;

import com.cosmetics.dto.request.CreateOrderRequest;
import com.cosmetics.dto.request.UpdateOrderStatusRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Cart;
import com.cosmetics.model.Order;
import com.cosmetics.model.Order.OrderItem;
import com.cosmetics.model.Order.ShippingAddress;
import com.cosmetics.model.Order.StatusHistory;
import com.cosmetics.repository.CartRepository;
import com.cosmetics.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


/**
 * Service xử lý logic đơn hàng — TV3
 *
 * Luồng chính:
 *  1. User checkout → lấy items từ Cart → tạo Order → xóa Cart
 *  2. Admin/Staff cập nhật trạng thái → ghi StatusHistory
 *  3. User chỉ có thể hủy đơn khi đang ở trạng thái 'pending'
 */
@Service
public class OrderService {

    private static final double SHIPPING_THRESHOLD = 500_000.0;
    private static final double SHIPPING_FEE = 30_000.0;

    /** Tập trạng thái cho phép user hủy đơn */
    private static final Set<String> CANCELLABLE_STATUSES = Set.of("pending");

    /** Tập trạng thái hợp lệ mà Admin/Staff được chuyển tới */
    private static final Set<String> VALID_STATUSES = Set.of("confirmed", "shipping", "delivered", "cancelled");

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // TẠO ĐƠN HÀNG
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tạo đơn hàng mới từ giỏ hàng hiện tại của user.
     * Sau khi tạo thành công, giỏ hàng sẽ bị xóa.
     */
    public Order createOrder(String userId, CreateOrderRequest request) {
        // 1. Lấy giỏ hàng
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // 2. Chuyển CartItem → OrderItem và tính tổng
        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;

        for (Cart.CartItem cartItem : cart.getItems()) {
            double lineTotal = cartItem.getPrice() * cartItem.getQuantity();
            subtotal += lineTotal;

            orderItems.add(OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .variantSku(cartItem.getVariantSku())
                    .name(cartItem.getName())
                    .variantName(cartItem.getVariantName())
                    .imageUrl(cartItem.getImageUrl())
                    .price(cartItem.getPrice())
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .build());
        }

        // 3. Tính phí ship
        double shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0.0 : SHIPPING_FEE;
        double total = subtotal + shippingFee;

        // 4. Xây dựng ShippingAddress
        ShippingAddress shippingAddress = ShippingAddress.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .street(request.getStreet())
                .build();

        // 5. Tạo StatusHistory ban đầu
        List<StatusHistory> statusHistory = new ArrayList<>();
        statusHistory.add(StatusHistory.builder()
                .status("pending")
                .note("Đơn hàng được đặt thành công")
                .changedBy(userId)
                .changedAt(LocalDateTime.now())
                .build());

        // 6. Tạo đơn hàng
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .total(total)
                .discount(0.0)
                .couponCode(request.getCouponCode())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .status("pending")
                .statusHistory(statusHistory)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 7. Xóa giỏ hàng sau khi đặt hàng thành công
        cartRepository.deleteByUserId(userId);

        return savedOrder;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // XEM ĐƠN HÀNG (USER)
    // ─────────────────────────────────────────────────────────────────────────

    /** Lấy lịch sử đơn hàng của user */
    public List<Order> getMyOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Lấy chi tiết 1 đơn của user */
    public Order getMyOrderById(String userId, String orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HỦY ĐƠN (USER)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * User hủy đơn hàng của mình.
     * Chỉ được hủy khi đơn đang ở trạng thái 'pending'.
     */
    public Order cancelMyOrder(String userId, String orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        return updateStatus(order, "cancelled", "Khách hàng hủy đơn", userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN / STAFF
    // ─────────────────────────────────────────────────────────────────────────

    /** Admin/Staff lấy tất cả đơn hàng với phân trang và lọc theo status */
    public Page<Order> getAllOrders(String status, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null && !status.isBlank()) {
            return orderRepository.findByStatus(status, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    /** Admin/Staff cập nhật trạng thái đơn hàng */
    public Order updateOrderStatus(String orderId, UpdateOrderStatusRequest request, String staffId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!VALID_STATUSES.contains(request.getStatus())) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS);
        }

        if (request.getTrackingCode() != null && !request.getTrackingCode().isBlank()) {
            order.setTrackingCode(request.getTrackingCode());
        }

        return updateStatus(order, request.getStatus(), request.getNote(), staffId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────────

    /** Cập nhật status và ghi vào StatusHistory */
    private Order updateStatus(Order order, String newStatus, String note, String changedBy) {
        order.setStatus(newStatus);

        List<StatusHistory> history = new ArrayList<>(order.getStatusHistory());
        history.add(StatusHistory.builder()
                .status(newStatus)
                .note(note)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .build());
        order.setStatusHistory(history);

        return orderRepository.save(order);
    }

    /** Sinh mã đơn hàng dạng: ORD-20260404-XXXXXX */
    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        return String.format("ORD-%s-%06d", datePart, count);
    }
}
