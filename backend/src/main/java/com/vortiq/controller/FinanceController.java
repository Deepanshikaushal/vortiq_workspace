package com.vortiq.controller;

import com.vortiq.model.finance.Budget;
import com.vortiq.model.finance.Expense;
import com.vortiq.model.finance.IncomeTransaction;
import com.vortiq.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(financeService.getFinanceStats());
    }

    // Expenses
    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(financeService.getAllExpenses());
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.createExpense(expense));
    }

    @PatchMapping("/expenses/{id}/status")
    public ResponseEntity<Expense> updateExpenseStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String approvedBy = payload.getOrDefault("approvedBy", "Finance Manager");
        return ResponseEntity.ok(financeService.updateExpenseStatus(id, status, approvedBy));
    }

    // Budgets
    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getAllBudgets() {
        return ResponseEntity.ok(financeService.getAllBudgets());
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> saveBudget(@RequestBody Budget budget) {
        return ResponseEntity.ok(financeService.saveBudget(budget));
    }

    // Income
    @GetMapping("/income")
    public ResponseEntity<List<IncomeTransaction>> getAllIncome() {
        return ResponseEntity.ok(financeService.getAllIncome());
    }

    @PostMapping("/income")
    public ResponseEntity<IncomeTransaction> createIncome(@RequestBody IncomeTransaction income) {
        return ResponseEntity.ok(financeService.createIncome(income));
    }
}
