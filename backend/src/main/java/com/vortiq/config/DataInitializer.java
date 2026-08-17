package com.vortiq.config;

import com.vortiq.model.*;
import com.vortiq.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Connection;
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
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            syncDatabaseSequences();

            // 1. Seed or update Deepanshi Kaushal (Owner & Lead Engineer)
            User deepanshi = userRepository.findByEmail("deepanshi@vortiq.com")
                    .or(() -> userRepository.findByEmail("admin@vortiq.com"))
                    .or(() -> userRepository.findById(1L))
                    .orElseGet(() -> new User("deepanshi", "Deepanshi Kaushal", "deepanshi@vortiq.com", passwordEncoder.encode("Password123!")));

            deepanshi.setUsername("deepanshi");
            deepanshi.setName("Deepanshi Kaushal");
            deepanshi.setEmail("deepanshi@vortiq.com");
            deepanshi.setDepartment("Engineering & Development");
            deepanshi.setPhone("+1 (555) 019-2834");
            deepanshi.setRole("ROLE_OWNER");
            deepanshi.setBio("Lead Engineer & Workspace Architect. Building high-concurrency Spring Boot & React platforms.");
            deepanshi.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80");
            deepanshi = userRepository.save(deepanshi);

            // 2. Seed other team members
            User sarah = getOrCreateUser(
                    "sarah",
                    "Sarah Chen",
                    "sarah@vortiq.com",
                    "Password123!",
                    "Product & Strategy",
                    "+1 (555) 019-5821",
                    "ROLE_ADMIN",
                    "Senior Product Manager driving sprint roadmaps and cross-functional feature execution.",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80"
            );

            User marcus = getOrCreateUser(
                    "marcus",
                    "Marcus Vance",
                    "marcus@vortiq.com",
                    "Password123!",
                    "Cloud Infrastructure & DevOps",
                    "+1 (555) 019-7742",
                    "ROLE_MEMBER",
                    "Site Reliability Engineer managing Docker orchestration, K8s clusters, and automated CI/CD.",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80"
            );

            User alex = getOrCreateUser(
                    "alex",
                    "Alex Rivera",
                    "alex@vortiq.com",
                    "Password123!",
                    "UI/UX & Design",
                    "+1 (555) 019-3319",
                    "ROLE_MEMBER",
                    "Principal UI/UX Designer crafting cyber glassmorphic design systems and micro-interactions.",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80"
            );

            User david = getOrCreateUser(
                    "david",
                    "David Kim",
                    "david@vortiq.com",
                    "Password123!",
                    "QA & Test Automation",
                    "+1 (555) 019-4488",
                    "ROLE_MEMBER",
                    "QA Engineer specializing in end-to-end automation, API contract tests, and performance benchmarks.",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&auto=format&fit=crop&q=80"
            );

            User elena = getOrCreateUser(
                    "elena",
                    "Elena Rostova",
                    "elena@vortiq.com",
                    "Password123!",
                    "Cybersecurity & Compliance",
                    "+1 (555) 019-9921",
                    "ROLE_MEMBER",
                    "Security Architect focused on JWT auth, zero-trust token flows, and SAIF cloud safety.",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140&auto=format&fit=crop&q=80"
            );

            // 3. Create or find default workspace
            final User ownerRef = deepanshi;
            Workspace defaultWorkspace = workspaceRepository.findById(1L).orElseGet(() -> {
                Workspace ws = new Workspace("VortiQ Studio Workspace", "Enterprise Workspace for Team Collaboration", "#64748b", ownerRef);
                return workspaceRepository.save(ws);
            });

            // 4. Ensure all users are workspace members
            List<User> allUsers = List.of(deepanshi, sarah, marcus, alex, david, elena);
            for (User user : allUsers) {
                if (!workspaceMemberRepository.existsByWorkspaceAndUser(defaultWorkspace, user)) {
                    WorkspaceRole role = user.getRole().contains("OWNER") ? WorkspaceRole.OWNER :
                                         user.getRole().contains("ADMIN") ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER;
                    workspaceMemberRepository.save(new WorkspaceMember(defaultWorkspace, user, role));
                }
            }

            // 5. Prepopulate demo projects and tasks if empty
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
            }

            System.out.println(">>> VortiQ DataInitializer: Initialized members and workspace data cleanly!");
        } catch (Exception e) {
            System.err.println(">>> VortiQ DataInitializer safe warning (non-fatal): " + e.getMessage());
        }
    }

    private User getOrCreateUser(String username, String name, String email, String password, String department, String phone, String role, String bio, String avatarUrl) {
        User u = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(username))
                .orElseGet(() -> new User(username, name, email, passwordEncoder.encode(password)));
        u.setName(name);
        u.setEmail(email);
        u.setDepartment(department);
        u.setPhone(phone);
        u.setRole(role);
        u.setBio(bio);
        u.setAvatarUrl(avatarUrl);
        return userRepository.save(u);
    }

    private void syncDatabaseSequences() {
        try {
            Connection conn = jdbcTemplate.getDataSource() != null ? jdbcTemplate.getDataSource().getConnection() : null;
            if (conn == null) return;
            String dbProduct = conn.getMetaData().getDatabaseProductName();
            if (dbProduct != null && dbProduct.equalsIgnoreCase("H2")) {
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM users)");
                jdbcTemplate.execute("ALTER TABLE workspaces ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM workspaces)");
                jdbcTemplate.execute("ALTER TABLE workspace_members ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM workspace_members)");
                jdbcTemplate.execute("ALTER TABLE projects ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM projects)");
                jdbcTemplate.execute("ALTER TABLE tasks ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM tasks)");
            } else if (dbProduct != null && dbProduct.toLowerCase().contains("postgres")) {
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('workspaces', 'id'), COALESCE(MAX(id), 1)) FROM workspaces");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('workspace_members', 'id'), COALESCE(MAX(id), 1)) FROM workspace_members");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE(MAX(id), 1)) FROM projects");
                jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('tasks', 'id'), COALESCE(MAX(id), 1)) FROM tasks");
            }
        } catch (Exception e) {
            System.out.println(">>> Info: Sequence sync check completed: " + e.getMessage());
        }
    }
}
