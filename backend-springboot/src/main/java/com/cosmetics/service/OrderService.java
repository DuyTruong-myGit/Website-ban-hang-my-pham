package com.cosmetics.service;

import com.cosmetics.dto.request.CreateOrderRequest;
import com.cosmetics.dto.request.UpdateOrderStatusRequest;
import com.cosmetics.dto.request.ValidateCouponRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Cart;
import com.cosmetics.model.Order;
import com.cosmetics.model.Order.OrderItem;
import com.cosmetics.model.Order.ShippingAddress;
import com.cosmetics.model.Order.StatusHistory;
import com.cosmetics.model.Product;
import com.cosmetics.repository.CartRepository;
import com.cosmetics.repository.OrderRepository;
import com.cosmetics.repository.ProductRepository;
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
 *  1. User checkout → lấy items từ Cart → kiểm tra tồn kho → tạo Order → trừ stock → xóa Cart
 *  2. Admin/Staff cập nhật trạng thái → ghi StatusHistory
 *  3. User chỉ có thể hủy đơn khi đang ở trạng thái 'pending' → cộng lại stock
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

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

    // ─────────────────────────────────────────────────────────────────────────
    // TẠO ĐƠN HÀNG
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Tạo đơn hàng mới từ giỏ hàng hiện tại của user.
     * Kiểm tra tồn kho → trừ stock → tạo đơn → xóa giỏ hàng.
     */
    public Order createOrder(String userId, CreateOrderRequest request) {
        // 1. Lấy giỏ hàng
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // 2. Kiểm tra tồn kho cho TẤT CẢ items trước khi xử lý
        for (Cart.CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            String variantSku = cartItem.getVariantSku() != null ? cartItem.getVariantSku() : "";
            int availableStock = getAvailableStock(product, variantSku);

            if (availableStock < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                        "Sản phẩm \"" + cartItem.getName() + "\" chỉ còn " + availableStock + " trong kho.");
            }
        }

        // 3. Chuyển CartItem → OrderItem và tính tổng
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

        // 4. Tính phí ship
        double shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0.0 : SHIPPING_FEE;

        // 5. Xây dựng ShippingAddress
        ShippingAddress shippingAddress = ShippingAddress.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .street(request.getStreet())
                .build();

        // 6. Tạo StatusHistory ban đầu
        List<StatusHistory> statusHistory = new ArrayList<>();
        statusHistory.add(StatusHistory.builder()
                .status("pending")
                .note("Đơn hàng được đặt thành công")
                .changedBy(userId)
                .changedAt(LocalDateTime.now())
                .build());

        // 7. Xử lý coupon nếu có
        double discount = 0.0;
        String couponCodeUsed = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            try {
                ValidateCouponRequest couponReq = new ValidateCouponRequest();
                couponReq.setCode(request.getCouponCode());
                couponReq.setOrderAmount(subtotal);
                java.util.Map<String, Object> couponResult = couponService.validateCoupon(couponReq);
                discount = ((Number) couponResult.get("discountAmount")).doubleValue();
                couponCodeUsed = request.getCouponCode().trim().toUpperCase();
            } catch (AppException e) {
                discount = 0.0;
            }
        }

        double total = subtotal + shippingFee - discount;

        // 8. Tạo đơn hàng
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .total(Math.max(0, total))
                .discount(discount)
                .couponCode(couponCodeUsed)
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .status("pending")
                .statusHistory(statusHistory)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 9. TRỪ TỒN KHO sau khi tạo đơn thành công
        deductStock(cart.getItems());

        // 10. Tăng usedCount của coupon
        if (couponCodeUsed != null) {
            couponService.applyCoupon(couponCodeUsed);
        }

        // 11. Tạo bản ghi thanh toán
        paymentService.createPaymentRecord(savedOrder);

        // 12. Xóa giỏ hàng sau khi đặt hàng thành công
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
     * Tự động cộng lại tồn kho.
     */
    public Order cancelMyOrder(String userId, String orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        // Cộng lại tồn kho
        restoreStock(order.getItems());

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

        // Nếu chuyển sang cancelled → cộng lại tồn kho (chỉ khi đơn chưa bị cancelled trước đó)
        if ("cancelled".equals(request.getStatus()) && !"cancelled".equals(order.getStatus())) {
            restoreStock(order.getItems());
        }

        if (request.getTrackingCode() != null && !request.getTrackingCode().isBlank()) {
            order.setTrackingCode(request.getTrackingCode());
        }

        return updateStatus(order, request.getStatus(), request.getNote(), staffId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INVENTORY HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Trừ tồn kho cho các sản phẩm trong đơn hàng.
     * Cập nhật stock, soldCount, và inStock trên DB.
     */
    private void deductStock(List<Cart.CartItem> items) {
        for (Cart.CartItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) continue;

            String variantSku = item.getVariantSku() != null ? item.getVariantSku() : "";

            if (!variantSku.isEmpty() && product.getVariants() != null) {
                // Trừ stock của variant
                for (Product.Variant variant : product.getVariants()) {
                    if (variantSku.equals(variant.getSku())) {
                        int newStock = Math.max(0, (variant.getStock() != null ? variant.getStock() : 0) - item.getQuantity());
                        variant.setStock(newStock);
                        break;
                    }
                }
            } else {
                // Trừ stock chung của product
                int newStock = Math.max(0, (product.getStock() != null ? product.getStock() : 0) - item.getQuantity());
                product.setStock(newStock);
            }

            // Tăng soldCount
            product.setSoldCount((product.getSoldCount() != null ? product.getSoldCount() : 0) + item.getQuantity());

            // Cập nhật inStock tự động
            product.setInStock(computeInStock(product));

            productRepository.save(product);
        }
    }

    /**
     * Cộng lại tồn kho khi đơn hàng bị hủy.
     */
    private void restoreStock(List<OrderItem> items) {
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) continue;

            String variantSku = item.getVariantSku() != null ? item.getVariantSku() : "";

            if (!variantSku.isEmpty() && product.getVariants() != null) {
                for (Product.Variant variant : product.getVariants()) {
                    if (variantSku.equals(variant.getSku())) {
                        int newStock = (variant.getStock() != null ? variant.getStock() : 0) + item.getQuantity();
                        variant.setStock(newStock);
                        break;
                    }
                }
            } else {
                int newStock = (product.getStock() != null ? product.getStock() : 0) + item.getQuantity();
                product.setStock(newStock);
            }

            // Giảm soldCount
            product.setSoldCount(Math.max(0, (product.getSoldCount() != null ? product.getSoldCount() : 0) - item.getQuantity()));

            // Cập nhật inStock tự động
            product.setInStock(computeInStock(product));

            productRepository.save(product);
        }
    }

    /**
     * Lấy stock khả dụng cho 1 sản phẩm (có xét variant).
     */
    private int getAvailableStock(Product product, String variantSku) {
        if (variantSku != null && !variantSku.isEmpty() && product.getVariants() != null) {
            for (Product.Variant variant : product.getVariants()) {
                if (variantSku.equals(variant.getSku())) {
                    return variant.getStock() != null ? variant.getStock() : 0;
                }
            }
        }
        return product.getStock() != null ? product.getStock() : 0;
    }

    /**
     * Tính toán trạng thái inStock dựa trên stock hiện tại.
     * Product còn hàng nếu:
     * - Không có variant: stock > 0
     * - Có variant: ít nhất 1 variant có stock > 0
     */
    private boolean computeInStock(Product product) {
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            return product.getVariants().stream()
                    .anyMatch(v -> v.getStock() != null && v.getStock() > 0);
        }
        return product.getStock() != null && product.getStock() > 0;
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

        Order savedOrder = orderRepository.save(order);

        // Đồng bộ trạng thái thanh toán
        paymentService.syncPaymentStatus(order.getId(), newStatus);

        return savedOrder;
    }

    /** Sinh mã đơn hàng dạng: ORD-20260404-XXXXXX */
    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        return String.format("ORD-%s-%06d", datePart, count);
    }
}
