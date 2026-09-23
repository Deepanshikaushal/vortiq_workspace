package com.vortiq.repository;

import com.vortiq.model.finance.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByStatus(String status);
    List<Expense> findByCategory(String category);
    List<Expense> findAllByOrderByCreatedAtDesc();
}
