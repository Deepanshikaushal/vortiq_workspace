package com.vortiq.model.inventory;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String category; // HARDWARE, ASSETS, SERVER, OFFICE_SUPPLIES, PACKAGING
    private Integer quantity;
    private Integer minThreshold;
    private Double unitCost;
    private String supplierName;
    private String location; // WAREHOUSE_A, SERVER_ROOM_1, OFFICE_CABINET
    private String status; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
    private LocalDateTime updatedAt;

    public InventoryItem() {
        this.updatedAt = LocalDateTime.now();
        this.status = "IN_STOCK";
    }

    public InventoryItem(String sku, String name, String category, Integer quantity, Integer minThreshold, Double unitCost, String supplierName, String location) {
        this.sku = sku;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.minThreshold = minThreshold != null ? minThreshold : 10;
        this.unitCost = unitCost;
        this.supplierName = supplierName;
        this.location = location;
        this.status = quantity <= 0 ? "OUT_OF_STOCK" : (quantity <= this.minThreshold ? "LOW_STOCK" : "IN_STOCK");
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity; 
        if (quantity != null && minThreshold != null) {
            this.status = quantity <= 0 ? "OUT_OF_STOCK" : (quantity <= this.minThreshold ? "LOW_STOCK" : "IN_STOCK");
        }
    }

    public Integer getMinThreshold() { return minThreshold; }
    public void setMinThreshold(Integer minThreshold) { this.minThreshold = minThreshold; }

    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
