package com.vortiq.service;

import com.vortiq.model.Project;
import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import com.vortiq.model.User;
import com.vortiq.model.Workspace;
import com.vortiq.repository.ProjectRepository;
import com.vortiq.repository.TaskRepository;
import com.vortiq.repository.UserRepository;
import com.vortiq.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<Task> getAllTasks(Long workspaceId, TaskStatus status, TaskPriority priority, Long assignedToId, String search) {
        if (workspaceId == null && status == null && priority == null && assignedToId == null && (search == null || search.trim().isEmpty())) {
            return taskRepository.findAll();
        }
        return taskRepository.filterTasks(workspaceId, status, priority, assignedToId, search != null ? search.trim() : null);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional
    public Task createTask(Task task, User creator) {
        task.setUser(creator);
        task.setCreatedBy(creator);

        if (task.getProjectId() != null) {
            projectRepository.findById(task.getProjectId()).ifPresent(task::setProject);
        }
        if (task.getWorkspaceId() != null) {
            workspaceRepository.findById(task.getWorkspaceId()).ifPresent(task::setWorkspace);
        }
        if (task.getAssignedToId() != null) {
            userRepository.findById(task.getAssignedToId()).ifPresent(task::setAssignedTo);
        }

        Task saved = taskRepository.save(task);
        auditLogService.record("TASK_CREATED", "TASK", saved.getId().toString(),
                creator != null ? creator.getUsername() : "System",
                "Created task: " + saved.getTitle() + " [Priority: " + saved.getPriority() + "]", null);
        return saved;
    }

    @Transactional
    public Task updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedTask.getTitle());
                    existing.setDescription(updatedTask.getDescription());
                    existing.setStatus(updatedTask.getStatus());
                    existing.setPriority(updatedTask.getPriority());
                    existing.setCategory(updatedTask.getCategory());
                    existing.setAssignee(updatedTask.getAssignee());
                    existing.setDueDate(updatedTask.getDueDate());

                    if (updatedTask.getProjectId() != null) {
                        projectRepository.findById(updatedTask.getProjectId()).ifPresent(existing::setProject);
                    }
                    if (updatedTask.getWorkspaceId() != null) {
                        workspaceRepository.findById(updatedTask.getWorkspaceId()).ifPresent(existing::setWorkspace);
                    }
                    if (updatedTask.getAssignedToId() != null) {
                        userRepository.findById(updatedTask.getAssignedToId()).ifPresent(existing::setAssignedTo);
                    }
                    Task saved = taskRepository.save(existing);
                    auditLogService.record("TASK_UPDATED", "TASK", id.toString(), "User",
                            "Updated task: " + saved.getTitle(), null);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    @Transactional
    public Task assignTask(Long taskId, Long assigneeId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }
        Task saved = taskRepository.save(task);
        auditLogService.record("TASK_ASSIGNED", "TASK", taskId.toString(), "User",
                "Assigned task to: " + (task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : "Unassigned"), null);
        return saved;
    }

    @Transactional
    public Task updateTaskStatus(Long id, TaskStatus status) {
        return taskRepository.findById(id)
                .map(task -> {
                    TaskStatus oldStatus = task.getStatus();
                    task.setStatus(status);
                    Task saved = taskRepository.save(task);
                    auditLogService.record("STATUS_TRANSITION", "TASK", id.toString(), "User",
                            "Changed status from " + oldStatus + " to " + status + " on: " + task.getTitle(), null);
                    return saved;
                })
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.findById(id).ifPresent(task ->
            auditLogService.record("TASK_DELETED", "TASK", id.toString(), "User",
                    "Deleted task: " + task.getTitle(), null)
        );
        taskRepository.deleteById(id);
    }

    public Map<String, Object> getTaskStats(Long workspaceId) {
        Map<String, Object> stats = new HashMap<>();
        long total = workspaceId != null ? taskRepository.countByWorkspaceId(workspaceId) : taskRepository.count();
        long todo = workspaceId != null ? taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.TODO) : taskRepository.countByStatus(TaskStatus.TODO);
        long inProgress = workspaceId != null ? taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.IN_PROGRESS) : taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long inReview = workspaceId != null ? taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.IN_REVIEW) : taskRepository.countByStatus(TaskStatus.IN_REVIEW);
        long completed = workspaceId != null ? taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.COMPLETED) : taskRepository.countByStatus(TaskStatus.COMPLETED);

        stats.put("total", total);
        stats.put("todo", todo);
        stats.put("inProgress", inProgress);
        stats.put("inReview", inReview);
        stats.put("completed", completed);
        stats.put("completionRate", total > 0 ? Math.round((double) completed / total * 100) : 0);

        return stats;
    }
}
