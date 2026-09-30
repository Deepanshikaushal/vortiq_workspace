package com.vortiq.service;

import com.vortiq.model.AuditLog;
import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import com.vortiq.model.User;
import com.vortiq.repository.ProjectRepository;
import com.vortiq.repository.TaskRepository;
import com.vortiq.repository.UserRepository;
import com.vortiq.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("deepanshi", "Deepanshi Kaushal", "deepanshi@vortiq.com", "password");
        sampleUser.setId(1L);

        sampleTask = new Task();
        sampleTask.setId(101L);
        sampleTask.setTitle("Implement WebSocket Collaboration");
        sampleTask.setDescription("Enable live Kanban card sync across concurrent browser sessions.");
        sampleTask.setStatus(TaskStatus.TODO);
        sampleTask.setPriority(TaskPriority.HIGH);
    }

    @Test
    @DisplayName("Should create task successfully and record audit log")
    void testCreateTask() {
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Task created = taskService.createTask(sampleTask, sampleUser);

        assertNotNull(created);
        assertEquals(101L, created.getId());
        assertEquals("Implement WebSocket Collaboration", created.getTitle());
        verify(taskRepository, times(1)).save(sampleTask);
        verify(auditLogService, times(1)).record(eq("TASK_CREATED"), eq("TASK"), anyString(), anyString(), anyString(), isNull());
    }

    @Test
    @DisplayName("Should update task status and trigger audit trail event")
    void testUpdateTaskStatus() {
        when(taskRepository.findById(101L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Task updated = taskService.updateTaskStatus(101L, TaskStatus.IN_PROGRESS);

        assertNotNull(updated);
        assertEquals(TaskStatus.IN_PROGRESS, updated.getStatus());
        verify(taskRepository, times(1)).save(sampleTask);
        verify(auditLogService, times(1)).record(eq("STATUS_TRANSITION"), eq("TASK"), eq("101"), anyString(), anyString(), isNull());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when updating non-existent task")
    void testUpdateTaskStatusNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> taskService.updateTaskStatus(999L, TaskStatus.COMPLETED));
        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should calculate workspace task metrics correctly")
    void testGetTaskStats() {
        Long workspaceId = 1L;
        when(taskRepository.countByWorkspaceId(workspaceId)).thenReturn(10L);
        when(taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.TODO)).thenReturn(3L);
        when(taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.IN_PROGRESS)).thenReturn(2L);
        when(taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.IN_REVIEW)).thenReturn(1L);
        when(taskRepository.countByWorkspaceIdAndStatus(workspaceId, TaskStatus.COMPLETED)).thenReturn(4L);

        Map<String, Object> stats = taskService.getTaskStats(workspaceId);

        assertEquals(10L, stats.get("total"));
        assertEquals(3L, stats.get("todo"));
        assertEquals(2L, stats.get("inProgress"));
        assertEquals(1L, stats.get("inReview"));
        assertEquals(4L, stats.get("completed"));
        assertEquals(40L, stats.get("completionRate"));
    }

    @Test
    @DisplayName("Should delete task and log audit trail")
    void testDeleteTask() {
        when(taskRepository.findById(101L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).deleteById(101L);

        taskService.deleteTask(101L);

        verify(taskRepository, times(1)).deleteById(101L);
        verify(auditLogService, times(1)).record(eq("TASK_DELETED"), eq("TASK"), eq("101"), anyString(), anyString(), isNull());
    }
}
