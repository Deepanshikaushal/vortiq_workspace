package com.vortiq.repository;

import com.vortiq.model.crm.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByStage(String stage);
    List<Deal> findByCustomerId(Long customerId);
    List<Deal> findAllByOrderByCreatedAtDesc();
}
