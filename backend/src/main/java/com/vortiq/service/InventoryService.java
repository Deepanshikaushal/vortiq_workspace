package com.vortiq.service;

import com.vortiq.model.inventory.InventoryItem;
import com.vortiq.model.inventory.StockMovement;
import com.vortiq.repository.InventoryItemRepository;
import com.vortiq.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    @Autowired
    private InventoryItemRepository itemRepository;

    @Autowired
    private StockMovementRepository movementRepository;

    // Items
    public List<InventoryItem> getAllItems() {
        return itemRepository.findAll();
    }

    public InventoryItem createItem(InventoryItem item) {
        return itemRepository.save(item);
    }

    public InventoryItem updateItem(Long id, InventoryItem details) {
        InventoryItem item = itemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setName(details.getName());
        item.setCategory(details.getCategory());
        item.setQuantity(details.getQuantity());
        item.setMinThreshold(details.getMinThreshold());
        item.setUnitCost(details.getUnitCost());
        item.setSupplierName(details.getSupplierName());
        item.setLocation(details.getLocation());
        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    // Stock Movements
    public List<StockMovement> getAllMovements() {
        return movementRepository.findAllByOrderByMovementDateDesc();
    }

    public StockMovement recordMovement(StockMovement movement) {
        // Adjust inventory item quantity
        itemRepository.findBySku(movement.getSku()).ifPresent(item -> {
            if ("INBOUND".equalsIgnoreCase(movement.getMovementType())) {
                item.setQuantity(item.getQuantity() + movement.getQuantity());
            } else if ("OUTBOUND".equalsIgnoreCase(movement.getMovementType())) {
                item.setQuantity(Math.max(0, item.getQuantity() - movement.getQuantity()));
            }
            itemRepository.save(item);
        });
        return movementRepository.save(movement);
    }

    public Map<String, Object> getInventoryStats() {
        Map<String, Object> stats = new HashMap<>();
        List<InventoryItem> items = itemRepository.findAll();
        stats.put("totalSKUs", items.size());
        stats.put("lowStockCount", items.stream().filter(i -> "LOW_STOCK".equalsIgnoreCase(i.getStatus())).count());
        stats.put("outOfStockCount", items.stream().filter(i -> "OUT_OF_STOCK".equalsIgnoreCase(i.getStatus())).count());
        Double totalValuation = items.stream()
                .mapToDouble(i -> (i.getQuantity() != null && i.getUnitCost() != null) ? i.getQuantity() * i.getUnitCost() : 0.0)
                .sum();
        stats.put("totalValuation", totalValuation);
        return stats;
    }
}
