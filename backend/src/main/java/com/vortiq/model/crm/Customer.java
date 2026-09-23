package com.vortiq.model.crm;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String company;
    private String email;
    private String phone;
    private String industry;
    private String status; // ACTIVE, INACTIVE, CHURNED
    private Double totalDealsValue;
    private String accountManager;
    private LocalDateTime createdAt;

    public Customer() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
        this.totalDealsValue = 0.0;
    }

    public Customer(String name, String company, String email, String phone, String industry, String accountManager) {
        this.name = name;
        this.company = company;
        this.email = email;
        this.phone = phone;
        this.industry = industry;
        this.accountManager = accountManager;
        this.status = "ACTIVE";
        this.totalDealsValue = 0.0;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalDealsValue() { return totalDealsValue; }
    public void setTotalDealsValue(Double totalDealsValue) { this.totalDealsValue = totalDealsValue; }

    public String getAccountManager() { return accountManager; }
    public void setAccountManager(String accountManager) { this.accountManager = accountManager; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
