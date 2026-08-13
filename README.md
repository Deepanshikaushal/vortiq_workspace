# 🚀 VortiQ Studio - Enterprise Task & Workspace Platform

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)
![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![License](https://img.shields.io/badge/License-MIT-green)

**VortiQ Studio** is a modern full-stack enterprise task management platform engineered with a **Core Java Spring Boot REST API** backend and a **React 18 (Vite)** frontend UI. It features interactive Kanban boards, data matrix tables, real-time velocity metrics, and dynamic workspace categorization.

---

## ✨ Features

- **⚡ Interactive Kanban Board**: Move task cards seamlessly across workflow stages (`To Do`, `In Progress`, `In Review`, `Completed`).
- **📊 Real-Time Analytics**: Sprint velocity calculation meter, backlog tracking, and progress indicators.
- **🎨 Glassmorphic Cyber UI**: Cyber-midnight theme with backdrop blurs, glow cards, and light/dark theme switching.
- **🏷️ Smart Categorization & Priority Badges**: Category tagging (`Frontend`, `Backend`, `DevOps`, `Design`, `Database`) and LED-style priority badges (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **🔍 Instant Search & Multi-Filters**: Debounced text search, workspace selector, and multi-field dropdown filters.
- **🔔 Toast Alert System**: Real-time feedback for task creation, status updates, and deletions.
- **⌨️ Keyboard Shortcuts**: Press `Ctrl + K` to jump directly to global search.
- **🛢️ In-Memory H2 Database**: Pre-populated initial dataset on boot; zero database installation required.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.4 (Java Web, Spring Data JPA)
- **Database**: H2 In-Memory Database (`jdbc:h2:mem:vortiqdb`)
- **Build Tool**: Apache Maven 3.9+

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Modules with CSS Variables & Glassmorphism Design Tokens

---

## 📁 Repository Structure

```
vortiq-workspace/
├── backend/                              # Java Spring Boot REST API Application
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/vortiq/
│           │   ├── VortiQApplication.java
│           │   ├── controller/           # Task, Project & Health REST Controllers
│           │   ├── model/                # Task & Project JPA Entities & Enums
│           │   ├── repository/           # Spring Data JPA Interfaces
│           │   ├── service/              # Business Logic & Analytics Aggregation
│           │   └── config/               # CORS WebConfig & DataInitializer
│           └── resources/
│               └── application.properties
│
├── frontend/                             # React (Vite) Single Page Application
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── index.css                     # Design Tokens & Cyber Theme Styles
│       ├── App.jsx                       # State Management & View Controller
│       ├── services/api.js               # REST Client for Spring Boot Endpoints
│       └── components/                   # Sidebar, Navbar, KanbanBoard, TaskTable, TaskModal, Toast
│
├── Dockerfile                            # Multi-stage Docker deployment config
├── docker-compose.yml                    # Docker Compose orchestration
└── run-production.ps1                    # One-click launch script for standalone JAR
```

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK 21)**
- **Node.js (v18+)** & **npm (v9+)**
- **Apache Maven 3.9+**

### Running Locally (Development Mode)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deepanshikaushal/vortiq-workspace.git
   cd vortiq-workspace
   ```

2. **Start Spring Boot Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Backend runs on `http://localhost:8080` (H2 Console: `http://localhost:8080/h2-console`)*

3. **Start React Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Frontend dev server runs on `http://localhost:5173`*

---

## 📦 Production Single-JAR Build

You can bundle the React frontend static build directly inside the Spring Boot JAR for a single-file executable deployment:

```powershell
# 1. Build React frontend
cd frontend
npm run build

# 2. Copy build output to Spring Boot static resources
Copy-Item -Path "dist\*" -Destination "..\backend\src\main\resources\static" -Recurse -Force

# 3. Package Spring Boot executable JAR
cd ..\backend
mvn clean package -DskipTests

# 4. Launch Production Executable
java -jar target\taskpulse-backend-0.0.1-SNAPSHOT.jar
```
*Access full application at `http://localhost:8080`*

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks (supports `status`, `priority`, `search` query params) |
| `GET` | `/api/tasks/{id}` | Get task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/{id}` | Update existing task |
| `PATCH` | `/api/tasks/{id}/status` | Update task status stage |
| `DELETE` | `/api/tasks/{id}` | Delete task |
| `GET` | `/api/tasks/stats` | Aggregate task velocity statistics |
| `GET` | `/api/projects` | List project workspaces |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
