package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Brand;
import com.cosmetics.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @GetMapping
    public ApiResponse<List<Brand>> getAllBrands() {
        return ApiResponse.success(brandService.getAllBrands());
    }

    @GetMapping("/{slug}")
    public ApiResponse<Brand> getBrandBySlug(@PathVariable String slug) {
        return ApiResponse.success(brandService.getBrandBySlug(slug));
    }

    @PostMapping
    public ApiResponse<Brand> createBrand(@RequestBody Brand brand) {
        return ApiResponse.success(brandService.createBrand(brand), "Thêm thương hiệu thành công.");
    }

    @PutMapping("/{id}")
    public ApiResponse<Brand> updateBrand(@PathVariable String id, @RequestBody Brand brand) {
        return ApiResponse.success(brandService.updateBrand(id, brand), "Cập nhật thương hiệu thành công.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ApiResponse.success(null, "Xóa thương hiệu thành công.");
    }
}