package com.vortiq.model.finance;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "finance_income")
public class IncomeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source; // CLIENT_INVOICE, SUBSCRIPTION, CONSULTING, LICENSING

    private String clientName;
    private Double amount;
    private LocalDate transactionDate;
    private String paymentStatus; // PAID, PENDING, OVERDUE
    private String paymentMethod;
    private String invoiceNumber;
    private LocalDateTime createdAt;

    public IncomeTransaction() {
        this.createdAt = LocalDateTime.now();
        this.paymentStatus = "PAID";
        this.transactionDate = LocalDate.now();
    }

    public IncomeTransaction(String source, String clientName, Double amount, LocalDate transactionDate, String paymentStatus, String paymentMethod, String invoiceNumber) {
        this.source = source;
        this.clientName = clientName;
        this.amount = amount;
        this.transactionDate = transactionDate != null ? transactionDate : LocalDate.now();
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.paymentMethod = paymentMethod;
        this.invoiceNumber = invoiceNumber;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
