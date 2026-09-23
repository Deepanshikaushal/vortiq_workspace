package com.vortiq.model.hr;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_profiles")
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String department;
    private String position;
    private LocalDate joiningDate;
    private Double salary;
    private String status; // ACTIVE, ON_LEAVE, PROBATION, TERMINATED
    private String phone;
    private LocalDateTime createdAt;

    public EmployeeProfile() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public EmployeeProfile(String employeeCode, String fullName, String email, String department, String position, LocalDate joiningDate, Double salary) {
        this.employeeCode = employeeCode;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.position = position;
        this.joiningDate = joiningDate;
        this.salary = salary;
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
