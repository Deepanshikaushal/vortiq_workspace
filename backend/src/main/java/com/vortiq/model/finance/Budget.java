package com.vortiq.model.finance;

import jakarta.persistence.*;

@Entity
@Table(name = "finance_budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String department;

    private Double allocatedAmount;
    private Double spentAmount;
    private Integer fiscalYear;

    public Budget() {
        this.spentAmount = 0.0;
        this.fiscalYear = 2026;
    }

    public Budget(String department, Double allocatedAmount, Double spentAmount, Integer fiscalYear) {
        this.department = department;
        this.allocatedAmount = allocatedAmount;
        this.spentAmount = spentAmount != null ? spentAmount : 0.0;
        this.fiscalYear = fiscalYear != null ? fiscalYear : 2026;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(Double allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public Double getSpentAmount() { return spentAmount; }
    public void setSpentAmount(Double spentAmount) { this.spentAmount = spentAmount; }

    public Integer getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(Integer fiscalYear) { this.fiscalYear = fiscalYear; }
}
