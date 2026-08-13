package com.example.taskpulse.service;

import com.example.taskpulse.model.Task;
import com.example.taskpulse.model.TaskPriority;
import com.example.taskpulse.model.TaskStatus;
import com.example.taskpulse.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service handling core task management logic, status transitions, and metric calculations.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Fetch tasks with optional filtering by status, priority, or search query.
     */
    public List<Task> getAllTasks(TaskStatus status, TaskPriority priority, String search) {
        if (status == null && priority == null && (search == null || search.trim().isEmpty())) {
            return taskRepository.findAll();
        }
        return taskRepository.filterTasks(status, priority, search != null ? search.trim() : null);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

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
                    existing.setProjectId(updatedTask.getProjectId());
                    return taskRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    public Task updateTaskStatus(Long id, TaskStatus status) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setStatus(status);
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    /**
     * Compute task statistics for the analytics overview.
     */
    public Map<String, Object> getTaskStats() {
        Map<String, Object> stats = new HashMap<>();
        long total = taskRepository.count();
        long todo = taskRepository.countByStatus(TaskStatus.TODO);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long inReview = taskRepository.countByStatus(TaskStatus.IN_REVIEW);
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);

        stats.put("total", total);
        stats.put("todo", todo);
        stats.put("inProgress", inProgress);
        stats.put("inReview", inReview);
        stats.put("completed", completed);
        stats.put("completionRate", total > 0 ? Math.round((double) completed / total * 100) : 0);

        return stats;
    }
}
