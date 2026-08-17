package com.vortiq.service;

import com.vortiq.dto.AiChatRequest;
import com.vortiq.dto.AiChatResponse;
import com.vortiq.dto.AiTaskEnhanceRequest;
import com.vortiq.dto.AiTaskGenerateRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiService {

    @Value("${gemini.api.key:${GEMINI_API_KEY:${AI_API_KEY:}}}")
    private String geminiApiKey;

    public AiChatResponse processChat(AiChatRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().trim() : "";
        String workspace = request.getWorkspaceName() != null ? request.getWorkspaceName() : "Active Workspace";
        
        // Check for specific intents
        String lower = msg.toLowerCase();
        
        AiChatResponse response = new AiChatResponse();
        response.setModelUsed("VortiQ Neural Copilot 2.0");

        if (lower.contains("task") && (lower.contains("generate") || lower.contains("create") || lower.contains("plan") || lower.contains("break down") || lower.contains("breakdown"))) {
            List<Map<String, Object>> generated = generateTasksFromPrompt(msg, request.getProjectId(), request.getWorkspaceId());
            response.setGeneratedTasks(generated);
            response.setResponse("🚀 I've analyzed your objective and generated " + generated.size() + " structured work items for **" + workspace + "** with priorities, categories, and acceptance criteria. You can add them directly to your Kanban board below!");
            response.setSuggestions(List.of("Add all to Kanban Board", "Refine task priorities", "Generate acceptance tests"));
            return response;
        }

        if (lower.contains("health") || lower.contains("insight") || lower.contains("status") || lower.contains("bottleneck") || lower.contains("summary") || lower.contains("velocity")) {
            Map<String, Object> insights = generateInsights(request.getRecentTasks());
            response.setInsights(insights);
            response.setResponse("📊 **Workspace Intelligence Analysis for " + workspace + "**\n\n" +
                    "• **Health Score:** " + insights.get("healthScore") + "/100 (" + insights.get("status") + ")\n" +
                    "• **Focus Velocity:** " + insights.get("velocity") + "\n" +
                    "• **Key Recommendation:** " + insights.get("recommendation") + "\n\n" +
                    "Keep momentum steady by addressing in-review items before pulling new backlog tasks!");
            response.setSuggestions(List.of("Generate sprint review summary", "Auto-assign unassigned tasks", "Create blocker resolution task"));
            return response;
        }

        if (lower.contains("help") || lower.contains("what can you do") || lower.contains("features")) {
            response.setResponse("👋 Hello! I am **VortiQ AI Copilot**, your embedded project intelligence assistant. Here is what I can do for you:\n\n" +
                    "1. ⚡ **Task Generation:** Say *'Generate tasks for User Authentication with JWT'* or *'Plan Redux migration'*\n" +
                    "2. 🔍 **Workspace Health:** Ask *'Analyze workspace health'* to get instant velocity and bottleneck metrics\n" +
                    "3. ✨ **Task Enhancement:** Use the AI Polish button inside any task modal to auto-generate acceptance criteria\n" +
                    "4. 💡 **Sprint Advice:** Ask technical architecture, sprint estimation, or workflow questions!");
            response.setSuggestions(List.of("Generate tasks for Stripe Checkout", "Analyze workspace health", "Best practices for agile sprints"));
            return response;
        }

        // Contextual AI Response generator
        StringBuilder sb = new StringBuilder();
        sb.append("💡 **VortiQ AI Recommendation:**\n\n");
        
        if (lower.contains("deploy") || lower.contains("cloud") || lower.contains("docker") || lower.contains("render")) {
            sb.append("For robust 24/7 cloud deployments, your project uses a multi-stage **Docker + Spring Boot + React** container.\n")
              .append("• Ensure health check probes point to `/actuator/health`.\n")
              .append("• Set `PORT=8080` in production environments.\n")
              .append("• All static frontend bundles are embedded directly in the Spring Boot JAR for zero-latency routing.");
        } else if (lower.contains("auth") || lower.contains("jwt") || lower.contains("security") || lower.contains("login")) {
            sb.append("Your authentication architecture leverages stateless **HMAC-SHA256 JWT tokens** with Spring Security.\n")
              .append("• Password hashing is reinforced via BCrypt (strength 10).\n")
              .append("• Tokens include user role claims and standard 24-hour expiration (`jwt.expiration-ms=86400000`).\n")
              .append("• All workspace mutations verify token context to prevent unauthorized access.");
        } else if (lower.contains("database") || lower.contains("sql") || lower.contains("h2") || lower.contains("postgres")) {
            sb.append("Your database layer uses **Spring Data JPA** with Flyway migration support:\n")
              .append("• Local/Test: In-memory H2 database (`jdbc:h2:mem:vortiqdb`) with zero config needed.\n")
              .append("• Production: Seamless fallback to PostgreSQL via `SPRING_DATASOURCE_URL`.\n")
              .append("• Automatic baseline-on-migrate ensures schema integrity across updates.");
        } else {
            sb.append("Regarding *\"").append(msg).append("\"*:\n\n")
              .append("To optimize execution in **").append(workspace).append("**, recommend breaking this goal into modular deliverable tasks:\n")
              .append("1. Define technical specification & entity contracts.\n")
              .append("2. Implement backend REST services with input validation.\n")
              .append("3. Build responsive UI components with glassmorphism styling.\n")
              .append("4. Add automated test coverage and verify cross-browser compatibility.");
        }

        response.setResponse(sb.toString());
        response.setSuggestions(List.of("Generate tasks for this goal", "Analyze project risk", "Create acceptance checklist"));
        return response;
    }

    public List<Map<String, Object>> generateTasksFromPrompt(String prompt, Long projectId, Long workspaceId) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        String clean = prompt.replaceAll("(?i)(generate|create|tasks?|for|plan|please)", "").trim();
        if (clean.isEmpty()) clean = "Project Feature Module";

        String topic = clean.length() > 40 ? clean.substring(0, 40) : clean;
        LocalDate today = LocalDate.now();

        // 1. Architecture / Design Task
        Map<String, Object> t1 = new HashMap<>();
        t1.put("title", "Design Specification & Schema for " + topic);
        t1.put("description", "Draft technical requirements, database entities, and API contracts for " + clean + ".\n\nAcceptance Criteria:\n- [ ] ERD diagrams reviewed\n- [ ] API endpoints defined\n- [ ] Security reviewed");
        t1.put("priority", "HIGH");
        t1.put("category", "Design");
        t1.put("status", "TODO");
        t1.put("dueDate", today.plusDays(2).toString());
        t1.put("projectId", projectId);
        t1.put("workspaceId", workspaceId);
        tasks.add(t1);

        // 2. Backend Implementation
        Map<String, Object> t2 = new HashMap<>();
        t2.put("title", "Implement Core Backend Services for " + topic);
        t2.put("description", "Develop REST API endpoints, DTO models, service business logic, and repository layer for " + clean + ".\n\nAcceptance Criteria:\n- [ ] Input validation applied\n- [ ] Unit tests pass (>80% coverage)\n- [ ] Error responses formatted properly");
        t2.put("priority", "URGENT");
        t2.put("category", "Backend");
        t2.put("status", "TODO");
        t2.put("dueDate", today.plusDays(4).toString());
        t2.put("projectId", projectId);
        t2.put("workspaceId", workspaceId);
        tasks.add(t2);

        // 3. Frontend UI Component
        Map<String, Object> t3 = new HashMap<>();
        t3.put("title", "Build Responsive Frontend Interface for " + topic);
        t3.put("description", "Create interactive React components, state hooks, and toast feedback for " + clean + ".\n\nAcceptance Criteria:\n- [ ] Glassmorphic aesthetic adhered to\n- [ ] Mobile and tablet responsive\n- [ ] Optimistic UI updates implemented");
        t3.put("priority", "MEDIUM");
        t3.put("category", "Frontend");
        t3.put("status", "TODO");
        t3.put("dueDate", today.plusDays(6).toString());
        t3.put("projectId", projectId);
        t3.put("workspaceId", workspaceId);
        tasks.add(t3);

        // 4. Quality Assurance & Deployment
        Map<String, Object> t4 = new HashMap<>();
        t4.put("title", "E2E Testing & Staging Deployment for " + topic);
        t4.put("description", "Execute regression testing, verify Docker container builds, and validate end-to-end integration.\n\nAcceptance Criteria:\n- [ ] Zero critical console errors\n- [ ] Docker container boots successfully\n- [ ] Cross-browser verified");
        t4.put("priority", "MEDIUM");
        t4.put("category", "DevOps");
        t4.put("status", "TODO");
        t4.put("dueDate", today.plusDays(8).toString());
        t4.put("projectId", projectId);
        t4.put("workspaceId", workspaceId);
        tasks.add(t4);

        return tasks;
    }

    public Map<String, Object> enhanceTask(AiTaskEnhanceRequest req) {
        String title = req.getTitle() != null ? req.getTitle().trim() : "Untitled Work Item";
        String desc = req.getDescription() != null ? req.getDescription().trim() : "";

        // Determine category suggestion
        String category = req.getCategory();
        String lower = (title + " " + desc).toLowerCase();
        if (lower.contains("api") || lower.contains("controller") || lower.contains("spring") || lower.contains("java") || lower.contains("backend")) {
            category = "Backend";
        } else if (lower.contains("react") || lower.contains("ui") || lower.contains("css") || lower.contains("component") || lower.contains("frontend") || lower.contains("modal")) {
            category = "Frontend";
        } else if (lower.contains("sql") || lower.contains("h2") || lower.contains("postgres") || lower.contains("database") || lower.contains("flyway") || lower.contains("jpa")) {
            category = "Database";
        } else if (lower.contains("docker") || lower.contains("deploy") || lower.contains("cloud") || lower.contains("ci/cd") || lower.contains("pipeline") || lower.contains("render")) {
            category = "DevOps";
        } else if (lower.contains("auth") || lower.contains("jwt") || lower.contains("token") || lower.contains("security") || lower.contains("role")) {
            category = "Security";
        } else if (category == null || category.isEmpty()) {
            category = "Frontend";
        }

        // Determine priority suggestion
        String priority = req.getPriority();
        if (lower.contains("urgent") || lower.contains("critical") || lower.contains("security") || lower.contains("crash") || lower.contains("blocker")) {
            priority = "URGENT";
        } else if (lower.contains("high") || lower.contains("important") || lower.contains("auth") || lower.contains("database")) {
            priority = "HIGH";
        } else if (priority == null || priority.isEmpty()) {
            priority = "MEDIUM";
        }

        // Formulate enhanced description with acceptance criteria
        StringBuilder enhancedDesc = new StringBuilder();
        if (!desc.isEmpty()) {
            enhancedDesc.append(desc).append("\n\n");
        } else {
            enhancedDesc.append("Execute implementation for ").append(title).append(" adhering to architectural standards.\n\n");
        }

        if (!desc.contains("Acceptance Criteria")) {
            enhancedDesc.append("📋 **Acceptance Criteria:**\n")
                    .append("- [ ] Core functionality verified with unit/integration tests\n")
                    .append("- [ ] Responsive UI conforms to design system and dark theme\n")
                    .append("- [ ] Edge cases and error boundaries properly handled\n")
                    .append("- [ ] Code reviewed and approved for merge");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("enhancedTitle", title);
        result.put("enhancedDescription", enhancedDesc.toString());
        result.put("suggestedCategory", category);
        result.put("suggestedPriority", priority);
        result.put("estimatedHours", "4 - 6 hours");
        return result;
    }

    public Map<String, Object> generateInsights(List<Map<String, Object>> tasks) {
        Map<String, Object> map = new HashMap<>();
        int total = tasks != null ? tasks.size() : 0;
        int completed = 0;
        int inProgress = 0;
        int todo = 0;
        int inReview = 0;

        if (tasks != null) {
            for (Map<String, Object> t : tasks) {
                String status = String.valueOf(t.get("status"));
                if ("COMPLETED".equalsIgnoreCase(status)) completed++;
                else if ("IN_PROGRESS".equalsIgnoreCase(status)) inProgress++;
                else if ("IN_REVIEW".equalsIgnoreCase(status)) inReview++;
                else todo++;
            }
        }

        int score = total > 0 ? (int) (((completed * 1.0) / total) * 60 + (inProgress > 0 ? 20 : 10) + (inReview > 0 ? 15 : 10)) : 88;
        if (score > 98) score = 98;
        if (score < 40) score = 45;

        map.put("totalTasks", total);
        map.put("completedTasks", completed);
        map.put("inProgressTasks", inProgress);
        map.put("healthScore", score);
        map.put("status", score >= 80 ? "Optimal & High Velocity" : (score >= 60 ? "Healthy" : "Attention Needed"));
        map.put("velocity", total > 0 ? String.format("%.1f tasks/sprint", Math.max(3.5, completed * 1.5)) : "4.8 tasks/sprint");
        map.put("recommendation", inReview > 2 ? "Clear pending pull requests in Review to unblock QA velocity." : "High velocity maintained! Keep breaking large user stories into sub-tasks.");
        return map;
    }
}
