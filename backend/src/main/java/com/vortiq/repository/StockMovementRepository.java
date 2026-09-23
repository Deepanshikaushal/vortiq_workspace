package com.vortiq.repository;

import com.vortiq.model.inventory.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findBySkuOrderByMovementDateDesc(String sku);
    List<StockMovement> findAllByOrderByMovementDateDesc();
}
