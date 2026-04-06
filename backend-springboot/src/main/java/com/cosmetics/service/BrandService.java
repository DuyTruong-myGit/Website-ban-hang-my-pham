package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Brand;
import com.cosmetics.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandBySlug(String slug) {
        return brandRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy thương hiệu với slug: " + slug));
    }

    public Brand createBrand(Brand brand) {
        // Có thể thêm logic tự động generate slug từ name nếu cần
        return brandRepository.save(brand);
    }

    public Brand updateBrand(String id, Brand brandDetails) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy thương hiệu"));
        
        brand.setName(brandDetails.getName());
        brand.setSlug(brandDetails.getSlug());
        brand.setLogoUrl(brandDetails.getLogoUrl());
        brand.setDescription(brandDetails.getDescription());
        brand.setOriginCountry(brandDetails.getOriginCountry());
        brand.setIsActive(brandDetails.getIsActive());

        return brandRepository.save(brand);
    }

    public void deleteBrand(String id) {
        brandRepository.deleteById(id);
    }
}