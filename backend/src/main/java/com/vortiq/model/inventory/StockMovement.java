package com.vortiq.model.inventory;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sku;

    private String itemName;
    private String movementType; // INBOUND, OUTBOUND, DAMAGED, ADJUSTMENT
    private Integer quantity;
    private String referenceReason;
    private String handledBy;
    private LocalDateTime movementDate;

    public StockMovement() {
        this.movementDate = LocalDateTime.now();
    }

    public StockMovement(String sku, String itemName, String movementType, Integer quantity, String referenceReason, String handledBy) {
        this.sku = sku;
        this.itemName = itemName;
        this.movementType = movementType;
        this.quantity = quantity;
        this.referenceReason = referenceReason;
        this.handledBy = handledBy;
        this.movementDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getReferenceReason() { return referenceReason; }
    public void setReferenceReason(String referenceReason) { this.referenceReason = referenceReason; }

    public String getHandledBy() { return handledBy; }
    public void setHandledBy(String handledBy) { this.handledBy = handledBy; }

    public LocalDateTime getMovementDate() { return movementDate; }
    public void setMovementDate(LocalDateTime movementDate) { this.movementDate = movementDate; }
}
