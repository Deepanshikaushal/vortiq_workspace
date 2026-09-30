package com.vortiq.controller;

import com.vortiq.config.DataInitializer;
import com.vortiq.repository.ProjectRepository;
import com.vortiq.repository.TaskRepository;
import com.vortiq.repository.UserRepository;
import com.vortiq.repository.WorkspaceRepository;
import com.vortiq.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import com.vortiq.service.DemoDataSeeder;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@Tag(name = "System Administration & Diagnostics", description = "System metrics, diagnostic probes, and demo data initialization")
public class SystemAdminController {

    private final DemoDataSeeder demoDataSeeder;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public SystemAdminController(
            DemoDataSeeder demoDataSeeder,
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.demoDataSeeder = demoDataSeeder;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/system-info")
    @Operation(summary = "Get system diagnostic telemetry", description = "Returns JVM memory statistics, active thread count, and entity counts")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        long heapUsedMB = memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMaxMB = memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024);

        info.put("application", "Flowvia Workspace Enterprise Edition");
        info.put("version", "1.0.0-PROD");
        info.put("status", "HEALTHY");
        info.put("timestamp", LocalDateTime.now().toString());
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("jvmVendor", System.getProperty("java.vendor"));
        info.put("heapUsedMB", heapUsedMB);
        info.put("heapMaxMB", heapMaxMB);
        info.put("activeThreads", Thread.activeCount());

        info.put("totalUsers", userRepository.count());
        info.put("totalWorkspaces", workspaceRepository.count());
        info.put("totalProjects", projectRepository.count());
        info.put("totalTasks", taskRepository.count());
        info.put("totalAuditLogs", auditLogService.getRecentLogs().size());

        return ResponseEntity.ok(info);
    }

    @PostMapping("/seed-demo-data")
    @Operation(summary = "Seed enterprise demonstration data", description = "Re-populates demo tasks, ERP transactions, and audit records for viva demonstration")
    public ResponseEntity<Map<String, Object>> seedDemoData() {
        try {
            demoDataSeeder.seedEnterpriseData();
            auditLogService.record("DATA_SEEDED", "SYSTEM", "0", "Admin",
                    "Enterprise demo data re-seeded successfully for viva demonstration", "127.0.0.1");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Enterprise demonstration dataset initialized successfully!");
            response.put("totalTasks", taskRepository.count());
            response.put("totalProjects", projectRepository.count());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
