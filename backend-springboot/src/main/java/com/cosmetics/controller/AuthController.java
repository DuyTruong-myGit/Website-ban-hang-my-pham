package com.cosmetics.controller;

import com.cosmetics.dto.request.ChangePasswordRequest;
import com.cosmetics.dto.request.ForgotPasswordRequest;
import com.cosmetics.dto.request.LoginRequest;
import com.cosmetics.dto.request.RegisterRequest;
import com.cosmetics.dto.request.UpdateProfileRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.dto.response.AuthResponse;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.User;
import com.cosmetics.repository.UserRepository;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.success(response, "Đăng ký thành công.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success(response, "Đăng nhập thành công.");
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse.UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        if (customUserDetails == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return ApiResponse.success(AuthResponse.UserDto.fromEntity(user));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (customUserDetails == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // AI hỗ trợ: Thêm API đổi mật khẩu bằng mật khẩu hiện tại (dành cho người dùng đã đăng nhập)
        authService.changePassword(customUserDetails.getId(), request);
        
        return ApiResponse.success(null, "Mật khẩu đã được thay đổi thành công.");
    }

    // AI hỗ trợ: API cập nhật thông tin cá nhân (yêu cầu đăng nhập)
    @PutMapping("/update-profile")
    public ApiResponse<AuthResponse.UserDto> updateProfile(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (customUserDetails == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        AuthResponse.UserDto updated = authService.updateProfile(customUserDetails.getId(), request);
        return ApiResponse.success(updated, "Cập nhật thông tin thành công.");
    }

    // AI hỗ trợ: API quên mật khẩu - xác thực bằng email + SĐT, không cần đăng nhập
    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success(null, "Mật khẩu đã được đặt lại thành công.");
    }
}
