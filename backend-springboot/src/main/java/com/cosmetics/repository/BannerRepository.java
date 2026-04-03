package com.cosmetics.repository;

import com.cosmetics.model.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BannerRepository extends MongoRepository<Banner, String> {
    List<Banner> findByPositionAndIsActiveTrueOrderBySortOrderAsc(String position);
}