package com.vortiq.config;

import com.vortiq.model.*;
import com.vortiq.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.vortiq.service.DemoDataSeeder;
import java.sql.Connection;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner, DemoDataSeeder {

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
    public void seedEnterpriseData() {
        run();
    }

    @Override
    public void run(String... args) {
        try {
            syncDatabaseSequences();

            // 1. Seed or update Dedicated Backend Administrator
            User backendAdmin = getOrCreateUser(
                    "admin",
                    "Backend Administrator",
                    "admin@vortiq.com",
                    "admin123",
                    "Backend Infrastructure & Operations",
                    "+1 (555) 019-0001",
                    "ROLE_ADMIN",
                    "Dedicated backend administrator account with full privileges for API orchestration, DB inspection, and system health.",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80"
            );

            // 2. Seed or update Standard User Account
            User standardUser = getOrCreateUser(
                    "user",
                    "Standard Member",
                    "user@vortiq.com",
                    "user123",
                    "Product & Engineering",
                    "+1 (555) 019-0002",
                    "ROLE_MEMBER",
                    "Standard user account for workspace collaboration, tasks, Kanban boards, and daily work.",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80"
            );

            // 3. Seed or update Deepanshi Kaushal (Owner & Lead Engineer)
            final User deepanshi = getOrCreateUser(
                    "deepanshi",
                    "Deepanshi Kaushal",
                    "deepanshi@vortiq.com",
                    "Password123!",
                    "Engineering & Development",
                    "+1 (555) 019-2834",
                    "ROLE_OWNER",
                    "Lead Engineer & Workspace Architect. Building high-concurrency Spring Boot & React platforms.",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80"
            );

            // 4. Seed other team members
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

            // 5. Create or find default workspace
            final User ownerRef = deepanshi;
            Workspace defaultWorkspace = workspaceRepository.findById(1L).orElseGet(() -> {
                Workspace ws = new Workspace("VortiQ Studio Workspace", "Enterprise Workspace for Team Collaboration", "#64748b", ownerRef);
                return workspaceRepository.save(ws);
            });

            // 6. Ensure all users are workspace members
            List<User> allUsers = List.of(backendAdmin, standardUser, deepanshi, sarah, marcus, alex, david, elena);
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

                Task t8 = new Task(
                        "Build Mobile Feedback Survey Widget",
                        "Design and integrate responsive client survey modal with rating inputs and animation.",
                        TaskStatus.IN_PROGRESS,
                        TaskPriority.HIGH,
                        "Frontend",
                        "Standard Member",
                        LocalDate.now().plusDays(3),
                        coreApp,
                        standardUser
                );
                t8.setWorkspace(defaultWorkspace);
                t8.setAssignedTo(standardUser);
                taskRepository.save(t8);

                Task t9 = new Task(
                        "Document Team Workflows & Daily Standup Checklists",
                        "Draft agile sprint checklist and onboard documentation for junior engineering members.",
                        TaskStatus.TODO,
                        TaskPriority.MEDIUM,
                        "Product",
                        "Standard Member",
                        LocalDate.now().plusDays(6),
                        coreApp,
                        standardUser
                );
                t9.setWorkspace(defaultWorkspace);
                t9.setAssignedTo(standardUser);
                taskRepository.save(t9);

                Task t10 = new Task(
                        "Audit Backend API Latency & JVM Memory Caps",
                        "Inspect Actuator metrics, thread pools, and HikariCP connection health under peak loads.",
                        TaskStatus.COMPLETED,
                        TaskPriority.URGENT,
                        "Backend",
                        "Backend Administrator",
                        LocalDate.now().minusDays(1),
                        devOps,
                        backendAdmin
                );
                t10.setWorkspace(defaultWorkspace);
                t10.setAssignedTo(backendAdmin);
                taskRepository.save(t10);
            }

            // 6. Ensure existing tasks have assignedTo set & seed member tasks if missing
            Project defaultProject = projectRepository.findById(1L).orElse(null);
            if (defaultProject != null) {
                taskRepository.findById(1L).ifPresent(t -> { if (t.getAssignedTo() == null) { t.setAssignedTo(deepanshi); taskRepository.save(t); } });
                taskRepository.findById(2L).ifPresent(t -> { if (t.getAssignedTo() == null) { t.setAssignedTo(sarah); taskRepository.save(t); } });
                taskRepository.findById(3L).ifPresent(t -> { if (t.getAssignedTo() == null) { t.setAssignedTo(sarah); taskRepository.save(t); } });
                taskRepository.findById(4L).ifPresent(t -> { if (t.getAssignedTo() == null) { t.setAssignedTo(deepanshi); taskRepository.save(t); } });
                taskRepository.findById(5L).ifPresent(t -> { if (t.getAssignedTo() == null) { t.setAssignedTo(marcus); taskRepository.save(t); } });

                if (taskRepository.count() <= 5) {
                    Task t8 = new Task(
                            "Build Mobile Feedback Survey Widget",
                            "Design and integrate responsive client survey modal with rating inputs and animation.",
                            TaskStatus.IN_PROGRESS,
                            TaskPriority.HIGH,
                            "Frontend",
                            "Standard Member",
                            LocalDate.now().plusDays(3),
                            defaultProject,
                            standardUser
                    );
                    t8.setWorkspace(defaultWorkspace);
                    t8.setAssignedTo(standardUser);
                    taskRepository.save(t8);

                    Task t9 = new Task(
                            "Document Team Workflows & Daily Standup Checklists",
                            "Draft agile sprint checklist and onboard documentation for junior engineering members.",
                            TaskStatus.TODO,
                            TaskPriority.MEDIUM,
                            "Product",
                            "Standard Member",
                            LocalDate.now().plusDays(6),
                            defaultProject,
                            standardUser
                    );
                    t9.setWorkspace(defaultWorkspace);
                    t9.setAssignedTo(standardUser);
                    taskRepository.save(t9);

                    Task t10 = new Task(
                            "Audit Backend API Latency & JVM Memory Caps",
                            "Inspect Actuator metrics, thread pools, and HikariCP connection health under peak loads.",
                            TaskStatus.COMPLETED,
                            TaskPriority.URGENT,
                            "Backend",
                            "Backend Administrator",
                            LocalDate.now().minusDays(1),
                            defaultProject,
                            backendAdmin
                    );
                    t10.setWorkspace(defaultWorkspace);
                    t10.setAssignedTo(backendAdmin);
                    taskRepository.save(t10);
                }
            }

            // 7. Seed Enterprise ERP Modules if empty
            seedErpData();

            System.out.println(">>> VortiQ DataInitializer: Initialized members, workspace, and ERP data cleanly!");
        } catch (Exception e) {
            System.err.println(">>> VortiQ DataInitializer safe warning (non-fatal): " + e.getMessage());
        }
    }

    private void seedErpData() {
        try {
            // HR Employees
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employee_profiles", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO employee_profiles (employee_code, full_name, email, department, position, joining_date, salary, status, phone, created_at) " +
                        "VALUES ('EMP-101', 'Deepanshi Kaushal', 'deepanshi@vortiq.com', 'Engineering', 'Lead Solutions Architect', '2023-01-15', 135000, 'ACTIVE', '+1 (555) 019-2834', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO employee_profiles (employee_code, full_name, email, department, position, joining_date, salary, status, phone, created_at) " +
                        "VALUES ('EMP-102', 'Sarah Chen', 'sarah@vortiq.com', 'Product', 'Principal Product Manager', '2023-03-01', 125000, 'ACTIVE', '+1 (555) 019-5821', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO employee_profiles (employee_code, full_name, email, department, position, joining_date, salary, status, phone, created_at) " +
                        "VALUES ('EMP-103', 'Marcus Vance', 'marcus@vortiq.com', 'DevOps', 'Staff Site Reliability Engineer', '2023-05-10', 120000, 'ACTIVE', '+1 (555) 019-7742', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO employee_profiles (employee_code, full_name, email, department, position, joining_date, salary, status, phone, created_at) " +
                        "VALUES ('EMP-104', 'Alex Rivera', 'alex@vortiq.com', 'Design', 'Lead UI/UX Designer', '2023-06-20', 110000, 'ACTIVE', '+1 (555) 019-3319', CURRENT_TIMESTAMP)");
            }

            // Leaves
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM leave_requests", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO leave_requests (employee_id, employee_name, leave_type, start_date, end_date, days_count, reason, status, reviewed_by, created_at) " +
                        "VALUES (104, 'Alex Rivera', 'ANNUAL', '2026-09-10', '2026-09-15', 5, 'Family vacation', 'APPROVED', 'Sarah Chen', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO leave_requests (employee_id, employee_name, leave_type, start_date, end_date, days_count, reason, status, reviewed_by, created_at) " +
                        "VALUES (103, 'Marcus Vance', 'SICK', '2026-09-02', '2026-09-03', 2, 'Doctor appointment', 'PENDING', NULL, CURRENT_TIMESTAMP)");
            }

            // CRM Leads & Customers & Deals
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crm_leads", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO crm_leads (name, company, email, phone, stage, estimated_value, source, assigned_to, created_at) " +
                        "VALUES ('Jonathan Pierce', 'Apex Logistics Corp', 'j.pierce@apexlogistics.io', '+1 (415) 890-1234', 'QUALIFIED', 45000.0, 'LINKEDIN', 'Sarah Chen', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO crm_leads (name, company, email, phone, stage, estimated_value, source, assigned_to, created_at) " +
                        "VALUES ('Evelyn Thorne', 'Nova Health Systems', 'thorne@novahealth.org', '+1 (650) 432-8765', 'PROPOSAL', 85000.0, 'WEBSITE', 'Deepanshi Kaushal', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO crm_leads (name, company, email, phone, stage, estimated_value, source, assigned_to, created_at) " +
                        "VALUES ('Rajiv Patel', 'Strata Fintech Inc', 'rajiv@stratafintech.com', '+1 (212) 777-9081', 'NEW', 32000.0, 'REFERRAL', 'Sarah Chen', CURRENT_TIMESTAMP)");
            }

            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crm_customers", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO crm_customers (name, company, email, phone, industry, status, total_deals_value, account_manager, created_at) " +
                        "VALUES ('Acme Cyber Systems', 'Acme Global LLC', 'contact@acmeglobal.com', '+1 (800) 555-0199', 'Technology', 'ACTIVE', 120000.0, 'Deepanshi Kaushal', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO crm_customers (name, company, email, phone, industry, status, total_deals_value, account_manager, created_at) " +
                        "VALUES ('Solaris Media Labs', 'Solaris Entertainment', 'ops@solarismedia.com', '+1 (310) 902-3344', 'Media & Entertainment', 'ACTIVE', 65000.0, 'Sarah Chen', CURRENT_TIMESTAMP)");
            }

            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crm_deals", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO crm_deals (title, customer_id, customer_name, amount, stage, probability, expected_close_date, deal_owner, created_at) " +
                        "VALUES ('Enterprise Workspace Cloud Migration', 1, 'Acme Cyber Systems', 75000.0, 'WON', 100, '2026-09-30', 'Deepanshi Kaushal', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO crm_deals (title, customer_id, customer_name, amount, stage, probability, expected_close_date, deal_owner, created_at) " +
                        "VALUES ('AI Workflow Automation Suite', 2, 'Solaris Media Labs', 45000.0, 'PROPOSAL', 75, '2026-10-15', 'Sarah Chen', CURRENT_TIMESTAMP)");
            }

            // Finance Expenses & Budgets & Income
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM finance_expenses", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO finance_expenses (title, category, amount, expense_date, status, submitted_by, approved_by, notes, created_at) " +
                        "VALUES ('AWS Cloud GPU Cluster (Cluster-E3)', 'INFRASTRUCTURE', 3420.50, '2026-09-01', 'APPROVED', 'Marcus Vance', 'Deepanshi Kaushal', 'Sprint LLM fine-tuning cluster', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO finance_expenses (title, category, amount, expense_date, status, submitted_by, approved_by, notes, created_at) " +
                        "VALUES ('Figma Enterprise Annual License', 'SOFTWARE', 1800.00, '2026-08-25', 'APPROVED', 'Alex Rivera', 'Deepanshi Kaushal', 'Design team license renewal', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO finance_expenses (title, category, amount, expense_date, status, submitted_by, approved_by, notes, created_at) " +
                        "VALUES ('Security Audit & Penetration Testing', 'INFRASTRUCTURE', 4500.00, '2026-09-01', 'PENDING', 'Elena Rostova', NULL, 'SOC2 compliance pre-audit', CURRENT_TIMESTAMP)");
            }

            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM finance_budgets", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO finance_budgets (department, allocated_amount, spent_amount, fiscal_year) " +
                        "VALUES ('Engineering', 150000.0, 48200.0, 2026)");
                jdbcTemplate.execute("INSERT INTO finance_budgets (department, allocated_amount, spent_amount, fiscal_year) " +
                        "VALUES ('Design & Product', 60000.0, 18500.0, 2026)");
                jdbcTemplate.execute("INSERT INTO finance_budgets (department, allocated_amount, spent_amount, fiscal_year) " +
                        "VALUES ('Infrastructure & DevOps', 95000.0, 32400.0, 2026)");
            }

            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM finance_income", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO finance_income (source, client_name, amount, transaction_date, payment_status, payment_method, invoice_number, created_at) " +
                        "VALUES ('CLIENT_INVOICE', 'Acme Cyber Systems', 37500.0, '2026-08-28', 'PAID', 'Wire Transfer', 'INV-2026-089', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO finance_income (source, client_name, amount, transaction_date, payment_status, payment_method, invoice_number, created_at) " +
                        "VALUES ('SUBSCRIPTION', 'Solaris Media Labs', 15000.0, '2026-09-01', 'PAID', 'Stripe ACH', 'INV-2026-090', CURRENT_TIMESTAMP)");
            }

            // Inventory Items
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_items", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO inventory_items (sku, name, category, quantity, min_threshold, unit_cost, supplier_name, location, status, updated_at) " +
                        "VALUES ('SKU-SRV-01', 'NVIDIA A100 Tensor Core GPU 80GB', 'HARDWARE', 8, 4, 9800.00, 'NVIDIA Enterprise', 'SERVER_ROOM_1', 'IN_STOCK', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO inventory_items (sku, name, category, quantity, min_threshold, unit_cost, supplier_name, location, status, updated_at) " +
                        "VALUES ('SKU-NET-04', 'Cisco Catalyst 9300 48-Port Switch', 'HARDWARE', 3, 5, 2400.00, 'Cisco Direct', 'WAREHOUSE_A', 'LOW_STOCK', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO inventory_items (sku, name, category, quantity, min_threshold, unit_cost, supplier_name, location, status, updated_at) " +
                        "VALUES ('SKU-DEV-12', 'MacBook Pro M3 Max 64GB Unified', 'ASSETS', 12, 5, 3499.00, 'Apple Business', 'OFFICE_CABINET', 'IN_STOCK', CURRENT_TIMESTAMP)");
            }

            // Documents Vault
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM document_vault", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO document_vault (file_name, file_type, file_size, file_url, category, uploaded_by, project_id, version, uploaded_at) " +
                        "VALUES ('VortiQ_System_Architecture_Master_v2.pdf', 'PDF', '4.8 MB', '/docs/arch_v2.pdf', 'ARCHITECTURE', 'Deepanshi Kaushal', 1, 'v2.4', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO document_vault (file_name, file_type, file_size, file_url, category, uploaded_by, project_id, version, uploaded_at) " +
                        "VALUES ('Enterprise_MSA_Contract_AcmeGlobal.docx', 'DOCX', '1.2 MB', '/docs/msa_acme.docx', 'CONTRACT', 'Sarah Chen', 1, 'v1.0', CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO document_vault (file_name, file_type, file_size, file_url, category, uploaded_by, project_id, version, uploaded_at) " +
                        "VALUES ('Q3_Sprint_Velocity_and_Financial_Report.xlsx', 'XLSX', '850 KB', '/docs/q3_report.xlsx', 'REPORT', 'Deepanshi Kaushal', 1, 'v1.1', CURRENT_TIMESTAMP)");
            }

            // In-App Notifications
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM notifications", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at) " +
                        "VALUES (1, 'Task Assigned', 'Sarah Chen assigned you to: Implement Spring Boot REST APIs', 'TASK_ASSIGNED', '/tasks', false, CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at) " +
                        "VALUES (1, 'Project Risk Alert', 'AI Engine flagged Cloud & Infrastructure project risk at 35%', 'PROJECT_RISK', '/projects', false, CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("INSERT INTO notifications (user_id, title, message, type, link_url, is_read, created_at) " +
                        "VALUES (1, 'Expense Approved', 'Figma Enterprise Annual License was approved by Deepanshi Kaushal', 'SYSTEM', '/erp/finance', true, CURRENT_TIMESTAMP)");
            }
        } catch (Exception e) {
            System.out.println(">>> Info: ERP Data seeding note: " + e.getMessage());
        }
    }

    private User getOrCreateUser(String username, String name, String email, String password, String department, String phone, String role, String bio, String avatarUrl) {
        User u = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(username))
                .orElseGet(() -> new User(username, name, email, passwordEncoder.encode(password)));
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(password));
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
