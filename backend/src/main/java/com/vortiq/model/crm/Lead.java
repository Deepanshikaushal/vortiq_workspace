package com.vortiq.model.crm;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String company;
    private String email;
    private String phone;
    private String stage; // NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST
    private Double estimatedValue;
    private String source; // WEBSITE, REFERRAL, LINKEDIN, COLD_CALL
    private String assignedTo;
    private String notes;
    private LocalDateTime createdAt;

    public Lead() {
        this.createdAt = LocalDateTime.now();
        this.stage = "NEW";
    }

    public Lead(String name, String company, String email, String phone, String stage, Double estimatedValue, String source) {
        this.name = name;
        this.company = company;
        this.email = email;
        this.phone = phone;
        this.stage = stage != null ? stage : "NEW";
        this.estimatedValue = estimatedValue != null ? estimatedValue : 0.0;
        this.source = source;
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

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Double getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(Double estimatedValue) { this.estimatedValue = estimatedValue; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
