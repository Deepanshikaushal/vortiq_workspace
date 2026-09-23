package com.vortiq.repository;

import com.vortiq.model.hr.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByDate(LocalDate date);
    List<AttendanceRecord> findByEmployeeIdOrderByDateDesc(Long employeeId);
}
