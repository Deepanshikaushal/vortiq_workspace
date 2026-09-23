package com.vortiq.controller;

import com.vortiq.model.inventory.InventoryItem;
import com.vortiq.model.inventory.StockMovement;
import com.vortiq.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(inventoryService.getInventoryStats());
    }

    // Items
    @GetMapping("/items")
    public ResponseEntity<List<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @PostMapping("/items")
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.createItem(item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.updateItem(id, item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // Movements
    @GetMapping("/movements")
    public ResponseEntity<List<StockMovement>> getAllMovements() {
        return ResponseEntity.ok(inventoryService.getAllMovements());
    }

    @PostMapping("/movements")
    public ResponseEntity<StockMovement> recordMovement(@RequestBody StockMovement movement) {
        return ResponseEntity.ok(inventoryService.recordMovement(movement));
    }
}
