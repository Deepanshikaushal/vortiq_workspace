package com.vortiq.repository;

import com.vortiq.model.finance.IncomeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncomeTransactionRepository extends JpaRepository<IncomeTransaction, Long> {
    List<IncomeTransaction> findByPaymentStatus(String paymentStatus);
    List<IncomeTransaction> findAllByOrderByTransactionDateDesc();
}
