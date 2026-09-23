package com.vortiq.model.finance;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "finance_expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String category; // INFRASTRUCTURE, MARKETING, SALARY, TRAVEL, OFFICE, SOFTWARE
    private Double amount;
    private LocalDate expenseDate;
    private String status; // PENDING, APPROVED, REJECTED
    private String submittedBy;
    private String approvedBy;
    private String receiptUrl;
    private String notes;
    private LocalDateTime createdAt;

    public Expense() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
        this.expenseDate = LocalDate.now();
    }

    public Expense(String title, String category, Double amount, LocalDate expenseDate, String submittedBy, String notes) {
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.submittedBy = submittedBy;
        this.notes = notes;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
