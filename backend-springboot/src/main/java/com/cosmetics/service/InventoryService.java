package com.cosmetics.service;

import com.cosmetics.dto.request.InventoryUpdateRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Inventory;
import com.cosmetics.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public Page<Inventory> getAllInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable);
    }

    public Inventory getInventoryById(String id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy tồn kho."));
    }

    public Inventory updateInventory(String id, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy tồn kho."));

        if (request.getQuantity() != null) {
            inventory.setQuantity(request.getQuantity());
        }
        if (request.getReserved() != null) {
            inventory.setReserved(request.getReserved());
        }
        if (request.getWarehouse() != null) {
            inventory.setWarehouse(request.getWarehouse());
        }
        if (request.getLowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.getLowStockThreshold());
        }

        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getLowStockItems() {
        // Lấy tất cả inventory rồi filter những item có quantity <= low_stock_threshold
        List<Inventory> allInventory = inventoryRepository.findAll();
        return allInventory.stream()
                .filter(inv -> inv.getQuantity() <= inv.getLowStockThreshold())
                .toList();
    }
}
