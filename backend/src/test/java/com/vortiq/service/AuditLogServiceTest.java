package com.vortiq.service;

import com.vortiq.model.AuditLog;
import com.vortiq.repository.AuditLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    @Test
    @DisplayName("Should persist and return new audit event")
    void testRecordAuditLog() {
        AuditLog mockLog = new AuditLog("TASK_CREATED", "TASK", "1", "Deepanshi", "Created task", "192.168.1.10");
        mockLog.setId(1L);

        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(mockLog);

        AuditLog saved = auditLogService.record("TASK_CREATED", "TASK", "1", "Deepanshi", "Created task", "192.168.1.10");

        assertNotNull(saved);
        assertEquals("TASK_CREATED", saved.getAction());
        assertEquals("Deepanshi", saved.getPerformedBy());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Should fetch recent 50 audit logs ordered by timestamp")
    void testGetRecentLogs() {
        AuditLog log1 = new AuditLog("AUTH_LOGIN", "AUTH", "0", "Admin", "Admin logged in", "127.0.0.1");
        AuditLog log2 = new AuditLog("TASK_CREATED", "TASK", "2", "Sarah", "Created backend task", "127.0.0.1");

        when(auditLogRepository.findTop50ByOrderByTimestampDesc()).thenReturn(List.of(log1, log2));

        List<AuditLog> results = auditLogService.getRecentLogs();

        assertEquals(2, results.size());
        assertEquals("AUTH_LOGIN", results.get(0).getAction());
        verify(auditLogRepository, times(1)).findTop50ByOrderByTimestampDesc();
    }
}
