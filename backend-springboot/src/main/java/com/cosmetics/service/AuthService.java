package com.cosmetics.service;

import com.cosmetics.dto.request.ChangePasswordRequest;
import com.cosmetics.dto.request.ForgotPasswordRequest;
import com.cosmetics.dto.request.LoginRequest;
import com.cosmetics.dto.request.RegisterRequest;
import com.cosmetics.dto.request.UpdateProfileRequest;
import com.cosmetics.dto.response.AuthResponse;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.User;
import com.cosmetics.repository.UserRepository;
import com.cosmetics.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role("customer") // Mặc định role user
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Tạo context để trả về token ngay sau khi đăng ký
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .user(AuthResponse.UserDto.fromEntity(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            return AuthResponse.builder()
                    .token(jwt)
                    .user(AuthResponse.UserDto.fromEntity(user))
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            // Tùy chọn: ném lỗi nếu trùng pass cũ, hiện tại bỏ qua hoặc ném lỗi cũng được (theo user)
            // Mình sẽ ném chung INVALID_OLD_PASSWORD hoặc BAD_REQUEST. 
            // Thôi cứ cho qua, tùy theo policy. Mình lưu lại bình thường.
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // AI hỗ trợ: Cập nhật thông tin cá nhân (tên, SĐT)
    @Transactional
    public AuthResponse.UserDto updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setName(request.getName());
        user.setPhone(request.getPhone());

        User saved = userRepository.save(user);
        return AuthResponse.UserDto.fromEntity(saved);
    }

    // AI hỗ trợ: Quên mật khẩu - xác thực bằng email + số điện thoại đã đăng ký
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // So sánh SĐT đã đăng ký với SĐT user nhập vào
        if (user.getPhone() == null || !user.getPhone().equals(request.getPhone())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
