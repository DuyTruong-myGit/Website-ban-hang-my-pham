package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Product;
import com.cosmetics.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // API Lấy danh sách có bộ lọc (Dùng cho Trang Danh mục & Tìm kiếm)
    @GetMapping
    public ApiResponse<List<Product>> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String brandId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int limit
    ) {
        Page<Product> productPage = productService.getProducts(categoryId, brandId, minPrice, maxPrice, search, inStock, sort, page, limit);
        
        ApiResponse.Pagination pagination = ApiResponse.Pagination.builder()
                .page(page)
                .limit(limit)
                .total(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();

        return ApiResponse.success(productPage.getContent(), pagination);
    }

    // Chi tiết sản phẩm
    @GetMapping("/{slug}")
    public ApiResponse<Product> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(productService.getProductBySlug(slug));
    }

    // Các API dành cho Homepage
    @GetMapping("/featured")
    public ApiResponse<List<Product>> getFeaturedProducts() {
        return ApiResponse.success(productService.getFeaturedProducts());
    }

    @GetMapping("/best-sellers")
    public ApiResponse<List<Product>> getBestSellers() {
        return ApiResponse.success(productService.getBestSellers());
    }

    // --- CÁC API DÀNH CHO ADMIN ---
    
    @PostMapping
    public ApiResponse<Product> createProduct(@RequestBody Product product) {
        return ApiResponse.success(productService.createProduct(product), "Tạo sản phẩm thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        return ApiResponse.success(productService.updateProduct(id, product), "Cập nhật sản phẩm thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ApiResponse.success(null, "Xóa sản phẩm thành công");
    }
}