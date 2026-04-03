package com.cosmetics.controller;

import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Banner;
import com.cosmetics.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    // Lấy banner, nếu có param ?position=hero thì chỉ lấy banner hero đang active
    @GetMapping
    public ApiResponse<List<Banner>> getBanners(@RequestParam(required = false) String position) {
        return ApiResponse.success(bannerService.getBannersByPosition(position));
    }

    @PostMapping
    public ApiResponse<Banner> createBanner(@RequestBody Banner banner) {
        return ApiResponse.success(bannerService.createBanner(banner), "Thêm banner thành công.");
    }

    @PutMapping("/{id}")
    public ApiResponse<Banner> updateBanner(@PathVariable String id, @RequestBody Banner banner) {
        return ApiResponse.success(bannerService.updateBanner(id, banner), "Cập nhật banner thành công.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable String id) {
        bannerService.deleteBanner(id);
        return ApiResponse.success(null, "Xóa banner thành công.");
    }
}