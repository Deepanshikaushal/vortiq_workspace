package com.vortiq.config;

import com.vortiq.model.*;
import com.vortiq.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            PasswordEncoder passwordEncoder) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User defaultUser = userRepository.findByEmail("admin@vortiq.com").orElseGet(() -> {
            User user = new User("Admin", "Deepanshi Kaushal", "admin@vortiq.com", passwordEncoder.encode("Password123!"));
            user.setRole("ROLE_ADMIN");
            user.setBio("Lead System Architect & Workspace Owner");
            return userRepository.save(user);
        });

        Workspace defaultWorkspace = workspaceRepository.findById(1L).orElseGet(() -> {
            Workspace ws = new Workspace("VortiQ Studio Workspace", "Enterprise Workspace for Team Collaboration", "#6366f1", defaultUser);
            Workspace saved = workspaceRepository.save(ws);
            workspaceMemberRepository.save(new WorkspaceMember(saved, defaultUser, WorkspaceRole.OWNER));
            return saved;
        });

        if (projectRepository.count() == 0 && taskRepository.count() == 0) {
            Project coreApp = projectRepository.save(new Project("Core Application", "Main web app platform development", "#6366f1", defaultWorkspace, defaultUser));
            Project mobileApp = projectRepository.save(new Project("Mobile App", "iOS & Android companion app", "#10b981", defaultWorkspace, defaultUser));
            Project devOps = projectRepository.save(new Project("Cloud & Infrastructure", "Kubernetes, CI/CD, and AWS deployment", "#f59e0b", defaultWorkspace, defaultUser));

            Task t1 = new Task(
                    "Design Glassmorphic UI Components",
                    "Create modern, translucent card components, custom scrollbars, and dynamic badges.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    "Frontend",
                    "Deepanshi Kaushal",
                    LocalDate.now().plusDays(2),
                    coreApp,
                    defaultUser
            );
            t1.setWorkspace(defaultWorkspace);
            t1.setAssignedTo(defaultUser);
            taskRepository.save(t1);

            Task t2 = new Task(
                    "Implement Spring Boot REST APIs",
                    "Build Java REST controllers, Data JPA repositories, and CORS configuration.",
                    TaskStatus.COMPLETED,
                    TaskPriority.URGENT,
                    "Backend",
                    "Sarah Chen",
                    LocalDate.now().minusDays(1),
                    coreApp,
                    defaultUser
            );
            t2.setWorkspace(defaultWorkspace);
            taskRepository.save(t2);

            Task t3 = new Task(
                    "Configure H2 Database Auto-schema",
                    "Ensure in-memory entity tables are properly mapped with Hibernate DDL.",
                    TaskStatus.COMPLETED,
                    TaskPriority.MEDIUM,
                    "Database",
                    "Sarah Chen",
                    LocalDate.now().minusDays(3),
                    coreApp,
                    defaultUser
            );
            t3.setWorkspace(defaultWorkspace);
            taskRepository.save(t3);

            Task t4 = new Task(
                    "Integrate Real-Time Status Filter",
                    "Add debounced search input and status drop-down filtering on React task grid.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    "Frontend",
                    "Deepanshi Kaushal",
                    LocalDate.now().plusDays(5),
                    coreApp,
                    defaultUser
            );
            t4.setWorkspace(defaultWorkspace);
            t4.setAssignedTo(defaultUser);
            taskRepository.save(t4);

            Task t5 = new Task(
                    "Setup Docker & Containerization Pipeline",
                    "Write Dockerfiles for Spring Boot jar and Vite React static build.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.HIGH,
                    "DevOps",
                    "Marcus Vance",
                    LocalDate.now().plusDays(1),
                    devOps,
                    defaultUser
            );
            t5.setWorkspace(defaultWorkspace);
            taskRepository.save(t5);

            Task t6 = new Task(
                    "Mobile Push Notification Handler",
                    "Implement APNs and FCM payload dispatch service in Java.",
                    TaskStatus.TODO,
                    TaskPriority.URGENT,
                    "Mobile",
                    "Elena Rostova",
                    LocalDate.now().plusDays(7),
                    mobileApp,
                    defaultUser
            );
            t6.setWorkspace(defaultWorkspace);
            taskRepository.save(t6);

            Task t7 = new Task(
                    "Security & OWASP Dependency Scan",
                    "Perform static code analysis and audit Java dependencies.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.LOW,
                    "Security",
                    "Marcus Vance",
                    LocalDate.now().plusDays(4),
                    devOps,
                    defaultUser
            );
            t7.setWorkspace(defaultWorkspace);
            taskRepository.save(t7);

            System.out.println(">>> VortiQ DataInitializer: Pre-populated Workspace Collaboration platform data successfully!");
        }
    }
}
