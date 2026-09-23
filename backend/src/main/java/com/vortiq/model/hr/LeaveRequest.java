package com.vortiq.model.hr;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    private String leaveType; // SICK, CASUAL, ANNUAL, MATERNITY
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer daysCount;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private String reviewedBy;
    private LocalDateTime createdAt;

    public LeaveRequest() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public LeaveRequest(Long employeeId, String employeeName, String leaveType, LocalDate startDate, LocalDate endDate, Integer daysCount, String reason) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.daysCount = daysCount;
        this.reason = reason;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getDaysCount() { return daysCount; }
    public void setDaysCount(Integer daysCount) { this.daysCount = daysCount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
