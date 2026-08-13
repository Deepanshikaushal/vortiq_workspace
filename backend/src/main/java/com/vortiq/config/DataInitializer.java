package com.vortiq.config;

import com.vortiq.model.Project;
import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import com.vortiq.repository.ProjectRepository;
import com.vortiq.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DataInitializer(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (projectRepository.count() == 0) {
            Project coreApp = projectRepository.save(new Project("Core Application", "Main web app platform development", "#6366f1"));
            Project mobileApp = projectRepository.save(new Project("Mobile App", "iOS & Android companion app", "#10b981"));
            Project devOps = projectRepository.save(new Project("Cloud & Infrastructure", "Kubernetes, CI/CD, and AWS deployment", "#f59e0b"));

            taskRepository.save(new Task(
                    "Design Glassmorphic UI Components",
                    "Create modern, translucent card components, custom scrollbars, and dynamic badges.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    "Frontend",
                    "Deepanshi Kaushal",
                    LocalDate.now().plusDays(2),
                    coreApp.getId()
            ));

            taskRepository.save(new Task(
                    "Implement Spring Boot REST APIs",
                    "Build Java REST controllers, Data JPA repositories, and CORS configuration.",
                    TaskStatus.COMPLETED,
                    TaskPriority.URGENT,
                    "Backend",
                    "Sarah Chen",
                    LocalDate.now().minusDays(1),
                    coreApp.getId()
            ));

            taskRepository.save(new Task(
                    "Configure H2 Database Auto-schema",
                    "Ensure in-memory entity tables are properly mapped with Hibernate DDL.",
                    TaskStatus.COMPLETED,
                    TaskPriority.MEDIUM,
                    "Database",
                    "Sarah Chen",
                    LocalDate.now().minusDays(3),
                    coreApp.getId()
            ));

            taskRepository.save(new Task(
                    "Integrate Real-Time Status Filter",
                    "Add debounced search input and status drop-down filtering on React task grid.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    "Frontend",
                    "Deepanshi Kaushal",
                    LocalDate.now().plusDays(5),
                    coreApp.getId()
            ));

            taskRepository.save(new Task(
                    "Setup Docker & Containerization Pipeline",
                    "Write Dockerfiles for Spring Boot jar and Vite React static build.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.HIGH,
                    "DevOps",
                    "Marcus Vance",
                    LocalDate.now().plusDays(1),
                    devOps.getId()
            ));

            taskRepository.save(new Task(
                    "Mobile Push Notification Handler",
                    "Implement APNs and FCM payload dispatch service in Java.",
                    TaskStatus.TODO,
                    TaskPriority.URGENT,
                    "Mobile",
                    "Elena Rostova",
                    LocalDate.now().plusDays(7),
                    mobileApp.getId()
            ));

            taskRepository.save(new Task(
                    "Security & OWASP Dependency Scan",
                    "Perform static code analysis and audit Java dependencies.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.LOW,
                    "Security",
                    "Marcus Vance",
                    LocalDate.now().plusDays(4),
                    devOps.getId()
            ));

            System.out.println(">>> VortiQ DataInitializer: Pre-populated sample data successfully!");
        }
    }
}
