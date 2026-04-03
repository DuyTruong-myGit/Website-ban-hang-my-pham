package com.cosmetics.service;

import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Banner;
import com.cosmetics.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    public List<Banner> getBannersByPosition(String position) {
        if (position != null && !position.isEmpty()) {
            return bannerRepository.findByPositionAndIsActiveTrueOrderBySortOrderAsc(position);
        }
        return bannerRepository.findAll();
    }
    
    public Banner getBannerById(String id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy Banner."));
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(String id, Banner bannerDetails) {
        Banner banner = getBannerById(id);
        banner.setTitle(bannerDetails.getTitle());
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setLinkUrl(bannerDetails.getLinkUrl());
        banner.setPosition(bannerDetails.getPosition());
        banner.setSortOrder(bannerDetails.getSortOrder());
        banner.setIsActive(bannerDetails.getIsActive());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(String id) {
        bannerRepository.deleteById(id);
    }
}