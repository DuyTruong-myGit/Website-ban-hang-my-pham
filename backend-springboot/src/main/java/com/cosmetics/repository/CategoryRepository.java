package com.cosmetics.repository;

import com.cosmetics.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();
    // Tìm tất cả danh mục con dựa vào ID của danh mục cha
    List<Category> findByParentId(String parentId);
}