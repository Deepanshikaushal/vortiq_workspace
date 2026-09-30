package com.vortiq.controller;

import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import com.vortiq.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    @Test
    @DisplayName("Should return list of tasks filtered by criteria")
    void testGetAllTasks() {
        Task t1 = new Task();
        t1.setId(1L);
        t1.setTitle("Configure Security Filters");
        t1.setStatus(TaskStatus.COMPLETED);

        when(taskService.getAllTasks(null, null, null, null, null)).thenReturn(List.of(t1));

        List<Task> response = taskController.getTasks(null, null, null, null, null);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Configure Security Filters", response.get(0).getTitle());
    }

    @Test
    @DisplayName("Should return 404 when task is not found by ID")
    void testGetTaskByIdNotFound() {
        when(taskService.getTaskById(999L)).thenReturn(Optional.empty());

        ResponseEntity<Task> response = taskController.getTaskById(999L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    @DisplayName("Should return workspace task statistics")
    void testGetTaskStats() {
        when(taskService.getTaskStats(1L)).thenReturn(Map.of("total", 10L, "completed", 5L, "completionRate", 50L));

        ResponseEntity<Map<String, Object>> response = taskController.getTaskStats(1L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(50L, response.getBody().get("completionRate"));
    }
}
