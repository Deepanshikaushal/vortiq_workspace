package com.vortiq.model.crm;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_deals")
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private Long customerId;
    private String customerName;
    private Double amount;
    private String stage; // PROSPECT, QUALIFIED, PROPOSAL, WON, LOST
    private Integer probability; // 0 - 100%
    private LocalDate expectedCloseDate;
    private String dealOwner;
    private LocalDateTime createdAt;

    public Deal() {
        this.createdAt = LocalDateTime.now();
        this.stage = "PROSPECT";
        this.probability = 20;
    }

    public Deal(String title, Long customerId, String customerName, Double amount, String stage, Integer probability, LocalDate expectedCloseDate, String dealOwner) {
        this.title = title;
        this.customerId = customerId;
        this.customerName = customerName;
        this.amount = amount;
        this.stage = stage != null ? stage : "PROSPECT";
        this.probability = probability != null ? probability : 20;
        this.expectedCloseDate = expectedCloseDate;
        this.dealOwner = dealOwner;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getProbability() { return probability; }
    public void setProbability(Integer probability) { this.probability = probability; }

    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public void setExpectedCloseDate(LocalDate expectedCloseDate) { this.expectedCloseDate = expectedCloseDate; }

    public String getDealOwner() { return dealOwner; }
    public void setDealOwner(String dealOwner) { this.dealOwner = dealOwner; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
