package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Category;
import com.cosmetics.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Lấy tất cả danh mục và dựng thành cây (Tree)
    public List<Map<String, Object>> getCategoryTree() {
        List<Category> allCategories = categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        
        Map<String, Map<String, Object>> categoryMap = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();

        // Khởi tạo Map
        for (Category cat : allCategories) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", cat.getId());
            node.put("name", cat.getName());
            node.put("slug", cat.getSlug());
            node.put("imageUrl", cat.getImageUrl());
            node.put("parentId", cat.getParentId());
            node.put("children", new ArrayList<Map<String, Object>>());
            categoryMap.put(cat.getId(), node);
        }

        // Xây dựng cây
        for (Category cat : allCategories) {
            Map<String, Object> node = categoryMap.get(cat.getId());
            if (cat.getParentId() == null || cat.getParentId().isEmpty()) {
                roots.add(node); // Là danh mục gốc
            } else {
                Map<String, Object> parent = categoryMap.get(cat.getParentId());
                if (parent != null) {
                    ((List<Map<String, Object>>) parent.get("children")).add(node);
                }
            }
        }
        return roots;
    }

    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy danh mục"));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy danh mục"));
        
        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());
        category.setParentId(categoryDetails.getParentId());
        category.setSortOrder(categoryDetails.getSortOrder());
        category.setIsActive(categoryDetails.getIsActive());

        return categoryRepository.save(category);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}