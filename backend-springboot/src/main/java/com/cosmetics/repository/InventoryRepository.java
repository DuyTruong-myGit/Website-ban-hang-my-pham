package com.cosmetics.repository;

import com.cosmetics.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    List<Inventory> findByProductId(String productId);
    Optional<Inventory> findByProductIdAndVariantSku(String productId, String variantSku);
    List<Inventory> findByQuantityLessThanEqual(Integer threshold);
}
