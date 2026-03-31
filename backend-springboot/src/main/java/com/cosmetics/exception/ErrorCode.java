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
    
    // Server Errors
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
