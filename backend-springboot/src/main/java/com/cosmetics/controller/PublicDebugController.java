package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class PublicDebugController {
    
    @Autowired
    private ReportService reportService;

    @GetMapping("/api/products/debug-products")
    public ApiResponse<List<Map>> getDebug() {
        return ApiResponse.success(reportService.getTopProducts());
    }
}
