package com.vortiq.repository;

import com.vortiq.model.inventory.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySku(String sku);
    List<InventoryItem> findByCategory(String category);
    List<InventoryItem> findByStatus(String status);
}
