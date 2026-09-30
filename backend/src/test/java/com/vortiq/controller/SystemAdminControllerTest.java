package com.vortiq.controller;

import com.vortiq.service.DemoDataSeeder;
import com.vortiq.repository.ProjectRepository;
import com.vortiq.repository.TaskRepository;
import com.vortiq.repository.UserRepository;
import com.vortiq.repository.WorkspaceRepository;
import com.vortiq.service.AuditLogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemAdminControllerTest {

    @Mock
    private DemoDataSeeder demoDataSeeder;

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
    private SystemAdminController systemAdminController;

    @Test
    @DisplayName("Should return system telemetry with JVM metrics and counts")
    void testGetSystemInfo() {
        when(userRepository.count()).thenReturn(5L);
        when(workspaceRepository.count()).thenReturn(2L);
        when(projectRepository.count()).thenReturn(4L);
        when(taskRepository.count()).thenReturn(20L);
        when(auditLogService.getRecentLogs()).thenReturn(Collections.emptyList());

        ResponseEntity<Map<String, Object>> response = systemAdminController.getSystemInfo();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("VortiQ Workspace Enterprise Edition", body.get("application"));
        assertEquals("HEALTHY", body.get("status"));
        assertEquals(20L, body.get("totalTasks"));
        assertTrue((Long) body.get("heapUsedMB") > 0);
    }

    @Test
    @DisplayName("Should re-seed enterprise demonstration data successfully")
    void testSeedDemoData() throws Exception {
        doNothing().when(demoDataSeeder).seedEnterpriseData();
        when(taskRepository.count()).thenReturn(15L);
        when(projectRepository.count()).thenReturn(3L);

        ResponseEntity<Map<String, Object>> response = systemAdminController.seedDemoData();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue((Boolean) response.getBody().get("success"));
        verify(demoDataSeeder, times(1)).seedEnterpriseData();
        verify(auditLogService, times(1)).record(eq("DATA_SEEDED"), anyString(), anyString(), anyString(), anyString(), anyString());
    }
}
