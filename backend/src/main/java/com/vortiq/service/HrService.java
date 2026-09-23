package com.vortiq.service;

import com.vortiq.model.hr.AttendanceRecord;
import com.vortiq.model.hr.EmployeeProfile;
import com.vortiq.model.hr.LeaveRequest;
import com.vortiq.repository.AttendanceRecordRepository;
import com.vortiq.repository.EmployeeProfileRepository;
import com.vortiq.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HrService {

    @Autowired
    private EmployeeProfileRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    // Employees
    public List<EmployeeProfile> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public EmployeeProfile createEmployee(EmployeeProfile employee) {
        return employeeRepository.save(employee);
    }

    public EmployeeProfile updateEmployee(Long id, EmployeeProfile details) {
        EmployeeProfile emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setFullName(details.getFullName());
        emp.setEmail(details.getEmail());
        emp.setDepartment(details.getDepartment());
        emp.setPosition(details.getPosition());
        emp.setSalary(details.getSalary());
        emp.setStatus(details.getStatus());
        emp.setPhone(details.getPhone());
        return employeeRepository.save(emp);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    // Leaves
    public List<LeaveRequest> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public LeaveRequest applyLeave(LeaveRequest request) {
        return leaveRepository.save(request);
    }

    public LeaveRequest updateLeaveStatus(Long id, String status, String reviewer) {
        LeaveRequest req = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        req.setStatus(status);
        req.setReviewedBy(reviewer);
        return leaveRepository.save(req);
    }

    // Attendance
    public List<AttendanceRecord> getTodayAttendance() {
        return attendanceRepository.findByDate(LocalDate.now());
    }

    public AttendanceRecord recordAttendance(AttendanceRecord record) {
        return attendanceRepository.save(record);
    }

    public Map<String, Object> getHrStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", employeeRepository.count());
        stats.put("activeEmployees", employeeRepository.findByStatus("ACTIVE").size());
        stats.put("pendingLeaves", leaveRepository.findByStatus("PENDING").size());
        stats.put("todayPresent", attendanceRepository.findByDate(LocalDate.now()).size());
        return stats;
    }
}
