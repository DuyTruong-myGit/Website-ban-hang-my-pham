package com.cosmetics.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    
    // Auth Errors
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Không có quyền truy cập."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Người dùng không tồn tại."),
    USER_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Tài khoản đã tồn tại."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn."),
    
    // Request Errors
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ."),

    // Product Errors
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại."),
    PRODUCT_INACTIVE(HttpStatus.BAD_REQUEST, "Sản phẩm hiện không còn kinh doanh."),
    PRODUCT_OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng."),
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "Số lượng yêu cầu vượt quá tồn kho."),

    // Cart Errors — TV3
    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại."),
    CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "Sản phẩm không có trong giỏ hàng."),
    CART_EMPTY(HttpStatus.BAD_REQUEST, "Giỏ hàng đang trống, không thể đặt hàng."),

    // Order Errors — TV3
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại."),
    ORDER_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng ở trạng thái hiện tại."),
    ORDER_INVALID_STATUS(HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ."),

    // Chat Errors — TV4
    CHATROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "Phòng chat không tồn tại."),
    CHATROOM_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Bạn đã có phòng chat đang mở. Vui lòng sử dụng phòng hiện tại."),
    MESSAGE_SEND_FAILED(HttpStatus.BAD_REQUEST, "Không thể gửi tin nhắn. Phòng chat đã đóng."),
    // Coupon Errors — TV3
    COUPON_NOT_FOUND(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại."),
    COUPON_EXPIRED(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn."),
    COUPON_INACTIVE(HttpStatus.BAD_REQUEST, "Mã giảm giá không còn hiệu lực."),
    COUPON_USAGE_LIMIT(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết lượt sử dụng."),
    COUPON_MIN_ORDER(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá."),
    COUPON_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Mã giảm giá đã tồn tại."),

    // Review Errors — TV4
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "Đánh giá không tồn tại."),
    REVIEW_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Bạn đã đánh giá sản phẩm này rồi."),
    REVIEW_NOT_PURCHASED(HttpStatus.BAD_REQUEST, "Bạn cần mua sản phẩm trước khi đánh giá."),

    // Question Errors — TV4
    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Câu hỏi không tồn tại."),

    // Wishlist Errors — TV4
    WISHLIST_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Sản phẩm đã có trong danh sách yêu thích."),
    WISHLIST_NOT_FOUND(HttpStatus.NOT_FOUND, "Sản phẩm không có trong danh sách yêu thích."),

    // Notification Errors — TV4
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Thông báo không tồn tại."),

    // Server Errors
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
