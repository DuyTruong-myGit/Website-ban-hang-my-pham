package com.cosmetics.controller;

import com.cosmetics.dto.request.InventoryUpdateRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Inventory;
import com.cosmetics.security.CustomUserDetails;
import com.cosmetics.service.AdminLogService;
import com.cosmetics.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AdminLogService adminLogService;

    @GetMapping
    public ApiResponse<List<Inventory>> getAllInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Page<Inventory> inventoryPage = inventoryService.getAllInventory(
                PageRequest.of(page, limit, Sort.by(Sort.Direction.ASC, "productId")));

        return ApiResponse.success(
                inventoryPage.getContent(),
                ApiResponse.Pagination.builder()
                        .page(page)
                        .limit(limit)
                        .total(inventoryPage.getTotalElements())
                        .totalPages(inventoryPage.getTotalPages())
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<Inventory> updateInventory(
            @PathVariable String id,
            @Valid @RequestBody InventoryUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Inventory updated = inventoryService.updateInventory(id, request);

        // Ghi admin log
        adminLogService.createLog(
                userDetails.getId(),
                "UPDATE_INVENTORY",
                "inventory:" + id,
                Map.of("quantity", request.getQuantity())
        );

        return ApiResponse.success(updated, "Cập nhật tồn kho thành công.");
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<Inventory>> getLowStockItems() {
        List<Inventory> lowStockItems = inventoryService.getLowStockItems();
        return ApiResponse.success(lowStockItems);
    }
}
