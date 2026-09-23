package com.vortiq.service;

import com.vortiq.model.finance.Budget;
import com.vortiq.model.finance.Expense;
import com.vortiq.model.finance.IncomeTransaction;
import com.vortiq.repository.BudgetRepository;
import com.vortiq.repository.ExpenseRepository;
import com.vortiq.repository.IncomeTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private IncomeTransactionRepository incomeRepository;

    // Expenses
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAllByOrderByCreatedAtDesc();
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense updateExpenseStatus(Long id, String status, String approvedBy) {
        Expense exp = expenseRepository.findById(id).orElseThrow(() -> new RuntimeException("Expense not found"));
        exp.setStatus(status);
        exp.setApprovedBy(approvedBy);
        return expenseRepository.save(exp);
    }

    // Budgets
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public Budget saveBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    // Income
    public List<IncomeTransaction> getAllIncome() {
        return incomeRepository.findAllByOrderByTransactionDateDesc();
    }

    public IncomeTransaction createIncome(IncomeTransaction income) {
        return incomeRepository.save(income);
    }

    public Map<String, Object> getFinanceStats() {
        Map<String, Object> stats = new HashMap<>();
        Double totalExpenses = expenseRepository.findAll().stream()
                .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus()))
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();
        Double totalIncome = incomeRepository.findAll().stream()
                .filter(i -> "PAID".equalsIgnoreCase(i.getPaymentStatus()))
                .mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0)
                .sum();
        stats.put("totalExpenses", totalExpenses);
        stats.put("totalIncome", totalIncome);
        stats.put("netProfit", totalIncome - totalExpenses);
        stats.put("pendingExpensesCount", expenseRepository.findByStatus("PENDING").size());
        return stats;
    }
}
