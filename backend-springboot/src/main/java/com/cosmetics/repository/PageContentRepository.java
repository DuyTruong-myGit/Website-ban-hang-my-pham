package com.cosmetics.repository;

import com.cosmetics.model.PageContent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageContentRepository extends MongoRepository<PageContent, String> {
    Optional<PageContent> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
