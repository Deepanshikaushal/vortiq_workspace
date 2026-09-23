package com.vortiq.model.hr;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status; // PRESENT, LATE, ABSENT, HALF_DAY, REMOTE
    private String notes;

    public AttendanceRecord() {
        this.date = LocalDate.now();
        this.status = "PRESENT";
    }

    public AttendanceRecord(Long employeeId, String employeeName, LocalDate date, LocalTime checkInTime, LocalTime checkOutTime, String status) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.date = date != null ? date : LocalDate.now();
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.status = status != null ? status : "PRESENT";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
