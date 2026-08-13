-- V2__seed_initial_data.sql
-- Seed initial project and task dataset if tables are empty

INSERT INTO projects (id, name, description, color_code, created_at)
VALUES 
    (1, 'Core Application', 'Main web app platform development', '#6366f1', CURRENT_TIMESTAMP),
    (2, 'Mobile App', 'iOS & Android companion app', '#10b981', CURRENT_TIMESTAMP),
    (3, 'Cloud & Infrastructure', 'Kubernetes, CI/CD, and AWS deployment', '#f59e0b', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
VALUES 
    ('Design Glassmorphic UI Components', 'Create modern translucent card components, custom scrollbars, and dynamic badges.', 'IN_PROGRESS', 'HIGH', 'Frontend', 'Deepanshi Kaushal', CURRENT_DATE + INTERVAL '2 day', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Implement Spring Boot REST APIs', 'Build Java REST controllers, Data JPA repositories, and CORS configuration.', 'COMPLETED', 'URGENT', 'Backend', 'Sarah Chen', CURRENT_DATE - INTERVAL '1 day', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Configure H2 Database Auto-schema', 'Ensure in-memory entity tables are properly mapped with Hibernate DDL.', 'COMPLETED', 'MEDIUM', 'Database', 'Sarah Chen', CURRENT_DATE - INTERVAL '3 day', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Integrate Real-Time Status Filter', 'Add debounced search input and status drop-down filtering on React task grid.', 'TODO', 'MEDIUM', 'Frontend', 'Deepanshi Kaushal', CURRENT_DATE + INTERVAL '5 day', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Setup Docker & Containerization Pipeline', 'Write Dockerfiles for Spring Boot jar and Vite React static build.', 'IN_REVIEW', 'HIGH', 'DevOps', 'Marcus Vance', CURRENT_DATE + INTERVAL '1 day', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Mobile Push Notification Handler', 'Implement APNs and FCM payload dispatch service in Java.', 'TODO', 'URGENT', 'Mobile', 'Elena Rostova', CURRENT_DATE + INTERVAL '7 day', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Security & OWASP Dependency Scan', 'Perform static code analysis and audit Java dependencies.', 'IN_PROGRESS', 'LOW', 'Security', 'Marcus Vance', CURRENT_DATE + INTERVAL '4 day', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
