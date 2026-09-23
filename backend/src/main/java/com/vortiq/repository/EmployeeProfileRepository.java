package com.vortiq.repository;

import com.vortiq.model.hr.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByEmail(String email);
    Optional<EmployeeProfile> findByEmployeeCode(String employeeCode);
    List<EmployeeProfile> findByDepartment(String department);
    List<EmployeeProfile> findByStatus(String status);
}
