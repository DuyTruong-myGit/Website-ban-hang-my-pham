package com.cosmetics.controller;

import com.cosmetics.dto.request.LoginRequest;
import com.cosmetics.dto.request.RegisterRequest;
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
}
