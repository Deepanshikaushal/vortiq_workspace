-- V2__seed_initial_data.sql
-- Seed initial project and task dataset if tables are empty

INSERT INTO projects (id, name, description, color_code, created_at)
SELECT 1, 'Core Application', 'Main web app platform development', '#6366f1', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 1);

INSERT INTO projects (id, name, description, color_code, created_at)
SELECT 2, 'Mobile App', 'iOS & Android companion app', '#10b981', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 2);

INSERT INTO projects (id, name, description, color_code, created_at)
SELECT 3, 'Cloud & Infrastructure', 'Kubernetes, CI/CD, and AWS deployment', '#f59e0b', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 3);

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
SELECT 'Design Glassmorphic UI Components', 'Create modern translucent card components, custom scrollbars, and dynamic badges.', 'IN_PROGRESS', 'HIGH', 'Frontend', 'Deepanshi Kaushal', CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Design Glassmorphic UI Components');

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
SELECT 'Implement Spring Boot REST APIs', 'Build Java REST controllers, Data JPA repositories, and CORS configuration.', 'COMPLETED', 'URGENT', 'Backend', 'Sarah Chen', CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Implement Spring Boot REST APIs');

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
SELECT 'Configure H2 Database Auto-schema', 'Ensure in-memory entity tables are properly mapped with Hibernate DDL.', 'COMPLETED', 'MEDIUM', 'Database', 'Sarah Chen', CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configure H2 Database Auto-schema');

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
SELECT 'Integrate Real-Time Status Filter', 'Add debounced search input and status drop-down filtering on React task grid.', 'TODO', 'MEDIUM', 'Frontend', 'Deepanshi Kaushal', CURRENT_DATE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Integrate Real-Time Status Filter');

INSERT INTO tasks (title, description, status, priority, category, assignee, due_date, project_id, created_at, updated_at)
SELECT 'Setup Docker & Containerization Pipeline', 'Write Dockerfiles for Spring Boot jar and Vite React static build.', 'IN_REVIEW', 'HIGH', 'DevOps', 'Marcus Vance', CURRENT_DATE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup Docker & Containerization Pipeline');
