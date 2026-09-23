package com.vortiq.controller;

import com.vortiq.model.hr.AttendanceRecord;
import com.vortiq.model.hr.EmployeeProfile;
import com.vortiq.model.hr.LeaveRequest;
import com.vortiq.service.HrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/hr")
@CrossOrigin(origins = "*")
public class HrController {

    @Autowired
    private HrService hrService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(hrService.getHrStats());
    }

    // Employees
    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeProfile>> getAllEmployees() {
        return ResponseEntity.ok(hrService.getAllEmployees());
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeProfile> createEmployee(@RequestBody EmployeeProfile employee) {
        return ResponseEntity.ok(hrService.createEmployee(employee));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeProfile> updateEmployee(@PathVariable Long id, @RequestBody EmployeeProfile employee) {
        return ResponseEntity.ok(hrService.updateEmployee(id, employee));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        hrService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    // Leaves
    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(hrService.getAllLeaves());
    }

    @PostMapping("/leaves")
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody LeaveRequest request) {
        return ResponseEntity.ok(hrService.applyLeave(request));
    }

    @PatchMapping("/leaves/{id}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String reviewer = payload.getOrDefault("reviewedBy", "HR Admin");
        return ResponseEntity.ok(hrService.updateLeaveStatus(id, status, reviewer));
    }

    // Attendance
    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceRecord>> getTodayAttendance() {
        return ResponseEntity.ok(hrService.getTodayAttendance());
    }

    @PostMapping("/attendance")
    public ResponseEntity<AttendanceRecord> recordAttendance(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(hrService.recordAttendance(record));
    }
}
