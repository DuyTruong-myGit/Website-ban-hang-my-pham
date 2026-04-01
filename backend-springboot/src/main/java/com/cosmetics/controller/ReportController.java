package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOverview() {
        Map<String, Object> overview = reportService.getOverview();
        return ApiResponse.success(overview);
    }

    @GetMapping("/revenue")
    public ApiResponse<List<Map>> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<Map> revenue = reportService.getRevenue(from, to);
        return ApiResponse.success(revenue);
    }

    @GetMapping("/top-products")
    public ApiResponse<List<Map>> getTopProducts() {
        List<Map> topProducts = reportService.getTopProducts();
        return ApiResponse.success(topProducts);
    }

    @GetMapping("/recent-orders")
    public ApiResponse<List<Map>> getRecentOrders() {
        List<Map> recentOrders = reportService.getRecentOrders();
        return ApiResponse.success(recentOrders);
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<Map>> getLowStockList() {
        List<Map> lowStockItems = reportService.getLowStockList();
        return ApiResponse.success(lowStockItems);
    }
}
