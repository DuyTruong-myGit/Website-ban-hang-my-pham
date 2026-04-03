package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Category;
import com.cosmetics.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getCategoryTree() {
        return ApiResponse.success(categoryService.getCategoryTree(), "Lấy danh mục thành công");
    }

    @GetMapping("/{slug}")
    public ApiResponse<Category> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success(categoryService.getCategoryBySlug(slug));
    }

    @PostMapping
    public ApiResponse<Category> createCategory(@RequestBody Category category) {
        return ApiResponse.success(categoryService.createCategory(category), "Tạo danh mục thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<Category> updateCategory(@PathVariable String id, @RequestBody Category category) {
        return ApiResponse.success(categoryService.updateCategory(id, category), "Cập nhật danh mục thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success(null, "Xóa danh mục thành công");
    }
}