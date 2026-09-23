package com.vortiq.repository;

import com.vortiq.model.crm.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStage(String stage);
    List<Lead> findAllByOrderByCreatedAtDesc();
}
