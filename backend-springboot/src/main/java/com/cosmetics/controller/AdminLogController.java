package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.AdminLog;
import com.cosmetics.service.AdminLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
public class AdminLogController {

    @Autowired
    private AdminLogService adminLogService;

    @GetMapping
    public ApiResponse<List<AdminLog>> getLogs(
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Page<AdminLog> logPage = adminLogService.getLogs(
                user, action, from, to,
                PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt")));

        return ApiResponse.success(
                logPage.getContent(),
                ApiResponse.Pagination.builder()
                        .page(page)
                        .limit(limit)
                        .total(logPage.getTotalElements())
                        .totalPages(logPage.getTotalPages())
                        .build()
        );
    }
}
