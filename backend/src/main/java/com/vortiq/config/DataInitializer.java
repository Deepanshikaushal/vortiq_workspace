package com.vortiq.config;

import com.vortiq.model.*;
import com.vortiq.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

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
        // 1. Seed Deepanshi Kaushal (Owner & Lead Engineer)
        User deepanshi = userRepository.findByEmail("deepanshi@vortiq.com").orElseGet(() -> {
            User u = new User("deepanshi", "Deepanshi Kaushal", "deepanshi@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("Engineering & Development");
            u.setPhone("+1 (555) 019-2834");
            u.setRole("ROLE_OWNER");
            u.setBio("Lead Engineer & Workspace Architect. Building high-concurrency Spring Boot & React platforms.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // 2. Seed Sarah Chen (Product Manager)
        User sarah = userRepository.findByEmail("sarah@vortiq.com").orElseGet(() -> {
            User u = new User("sarah", "Sarah Chen", "sarah@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("Product & Strategy");
            u.setPhone("+1 (555) 019-5821");
            u.setRole("ROLE_ADMIN");
            u.setBio("Senior Product Manager driving sprint roadmaps and cross-functional feature execution.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // 3. Seed Marcus Vance (DevOps Engineer)
        User marcus = userRepository.findByEmail("marcus@vortiq.com").orElseGet(() -> {
            User u = new User("marcus", "Marcus Vance", "marcus@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("Cloud Infrastructure & DevOps");
            u.setPhone("+1 (555) 019-7742");
            u.setRole("ROLE_MEMBER");
            u.setBio("Site Reliability Engineer managing Docker orchestration, K8s clusters, and automated CI/CD.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // 4. Seed Alex Rivera (UI/UX Designer)
        User alex = userRepository.findByEmail("alex@vortiq.com").orElseGet(() -> {
            User u = new User("alex", "Alex Rivera", "alex@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("UI/UX & Design");
            u.setPhone("+1 (555) 019-3319");
            u.setRole("ROLE_MEMBER");
            u.setBio("Principal UI/UX Designer crafting cyber glassmorphic design systems and micro-interactions.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // 5. Seed David Kim (QA Engineer)
        User david = userRepository.findByEmail("david@vortiq.com").orElseGet(() -> {
            User u = new User("david", "David Kim", "david@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("QA & Test Automation");
            u.setPhone("+1 (555) 019-4488");
            u.setRole("ROLE_MEMBER");
            u.setBio("QA Engineer specializing in end-to-end automation, API contract tests, and performance benchmarks.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // 6. Seed Elena Rostova (Security Engineer)
        User elena = userRepository.findByEmail("elena@vortiq.com").orElseGet(() -> {
            User u = new User("elena", "Elena Rostova", "elena@vortiq.com", passwordEncoder.encode("Password123!"));
            u.setDepartment("Cybersecurity & Compliance");
            u.setPhone("+1 (555) 019-9921");
            u.setRole("ROLE_MEMBER");
            u.setBio("Security Architect focused on JWT auth, zero-trust token flows, and SAIF cloud safety.");
            u.setAvatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140&auto=format&fit=crop&q=80");
            return userRepository.save(u);
        });

        // Create or find default workspace
        Workspace defaultWorkspace = workspaceRepository.findById(1L).orElseGet(() -> {
            Workspace ws = new Workspace("VortiQ Studio Workspace", "Enterprise Workspace for Team Collaboration", "#6366f1", deepanshi);
            Workspace saved = workspaceRepository.save(ws);
            return saved;
        });

        // Ensure all users are workspace members
        List<User> allUsers = List.of(deepanshi, sarah, marcus, alex, david, elena);
        for (User user : allUsers) {
            if (!workspaceMemberRepository.existsByWorkspaceAndUser(defaultWorkspace, user)) {
                WorkspaceRole role = user.getRole().contains("OWNER") ? WorkspaceRole.OWNER :
                                     user.getRole().contains("ADMIN") ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER;
                workspaceMemberRepository.save(new WorkspaceMember(defaultWorkspace, user, role));
            }
        }

        // Prepopulate demo projects and tasks if empty
        if (projectRepository.count() == 0 && taskRepository.count() == 0) {
            Project coreApp = projectRepository.save(new Project("Core Application", "Main web app platform development", "#6366f1", defaultWorkspace, deepanshi));
            Project mobileApp = projectRepository.save(new Project("Mobile App", "iOS & Android companion app", "#10b981", defaultWorkspace, deepanshi));
            Project devOps = projectRepository.save(new Project("Cloud & Infrastructure", "Kubernetes, CI/CD, and AWS deployment", "#f59e0b", defaultWorkspace, deepanshi));

            Task t1 = new Task(
                    "Design Glassmorphic UI Components",
                    "Create modern, translucent card components, custom scrollbars, and dynamic badges.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    "Frontend",
                    "Deepanshi Kaushal",
                    LocalDate.now().plusDays(2),
                    coreApp,
                    deepanshi
            );
            t1.setWorkspace(defaultWorkspace);
            t1.setAssignedTo(deepanshi);
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
                    sarah
            );
            t2.setWorkspace(defaultWorkspace);
            t2.setAssignedTo(sarah);
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
                    sarah
            );
            t3.setWorkspace(defaultWorkspace);
            t3.setAssignedTo(sarah);
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
                    deepanshi
            );
            t4.setWorkspace(defaultWorkspace);
            t4.setAssignedTo(deepanshi);
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
                    marcus
            );
            t5.setWorkspace(defaultWorkspace);
            t5.setAssignedTo(marcus);
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
                    elena
            );
            t6.setWorkspace(defaultWorkspace);
            t6.setAssignedTo(elena);
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
                    marcus
            );
            t7.setWorkspace(defaultWorkspace);
            t7.setAssignedTo(marcus);
            taskRepository.save(t7);

            System.out.println(">>> VortiQ DataInitializer: Pre-populated 6 Workspace Members and platform tasks successfully!");
        }
    }
}
