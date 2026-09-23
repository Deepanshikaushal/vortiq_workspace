package com.vortiq.controller;

import com.vortiq.model.Project;
import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import com.vortiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeProfileRepository employeeRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private IncomeTransactionRepository incomeRepository;

    @GetMapping("/kpi")
    public ResponseEntity<Map<String, Object>> getKpiOverview() {
        Map<String, Object> kpis = new HashMap<>();

        List<Task> allTasks = taskRepository.findAll();
        List<Project> allProjects = projectRepository.findAll();

        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todoTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long blockedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.BLOCKED).count();

        double completionRate = totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0;

        kpis.put("totalTasks", totalTasks);
        kpis.put("completedTasks", completedTasks);
        kpis.put("inProgressTasks", inProgressTasks);
        kpis.put("todoTasks", todoTasks);
        kpis.put("blockedTasks", blockedTasks);
        kpis.put("completionRate", Math.round(completionRate * 10.0) / 10.0);

        kpis.put("totalProjects", allProjects.size());
        kpis.put("activeProjects", allProjects.size()); // all available

        kpis.put("totalUsers", userRepository.count());
        kpis.put("totalEmployees", employeeRepository.count());

        // Priority breakdown
        Map<String, Long> priorityMap = new HashMap<>();
        priorityMap.put("URGENT", allTasks.stream().filter(t -> t.getPriority() == TaskPriority.URGENT).count());
        priorityMap.put("HIGH", allTasks.stream().filter(t -> t.getPriority() == TaskPriority.HIGH).count());
        priorityMap.put("MEDIUM", allTasks.stream().filter(t -> t.getPriority() == TaskPriority.MEDIUM).count());
        priorityMap.put("LOW", allTasks.stream().filter(t -> t.getPriority() == TaskPriority.LOW).count());
        kpis.put("priorityDistribution", priorityMap);

        // Assignee workload
        Map<String, Long> workloadMap = allTasks.stream()
                .filter(t -> t.getAssignee() != null && !t.getAssignee().trim().isEmpty())
                .collect(Collectors.groupingBy(Task::getAssignee, Collectors.counting()));
        kpis.put("assigneeWorkload", workloadMap);

        // Financial KPI
        Double totalRevenue = incomeRepository.findAll().stream()
                .filter(i -> "PAID".equalsIgnoreCase(i.getPaymentStatus()))
                .mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0)
                .sum();
        Double totalExpense = expenseRepository.findAll().stream()
                .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus()))
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();
        kpis.put("totalRevenue", totalRevenue);
        kpis.put("totalExpense", totalExpense);
        kpis.put("netIncome", totalRevenue - totalExpense);

        return ResponseEntity.ok(kpis);
    }
}
