package com.cosmetics.controller;

import com.cosmetics.dto.request.CreateStaffRequest;
import com.cosmetics.dto.request.UserStatusRequest;
import com.cosmetics.dto.response.ApiResponse;

import com.cosmetics.dto.response.UserResponse;
import com.cosmetics.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        Page<UserResponse> userPage = userService.getAllUsers(PageRequest.of(page, limit));
        return ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Lấy danh sách người dùng thành công")
                .data(userPage.getContent())
                .pagination(ApiResponse.Pagination.builder()
                        .page(page)
                        .limit(limit)
                        .total(userPage.getTotalElements())
                        .totalPages(userPage.getTotalPages())
                        .build())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<UserResponse> getUserById(@PathVariable String id) {
        return ApiResponse.success(userService.getUserById(id), "Lấy thông tin người dùng thành công");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UserStatusRequest request) {
        return ApiResponse.success(userService.updateStatus(id, request.getIsActive()), "Cập nhật trạng thái thành công");
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ApiResponse.success(userService.createStaff(request), "Tạo tài khoản nhân viên thành công");
    }
}
