package com.vortiq.service;

import com.vortiq.model.AuditLog;
import java.util.List;

public interface AuditLogService {
    AuditLog record(String action, String entityType, String entityId, String performedBy, String details, String ipAddress);
    List<AuditLog> getRecentLogs();
}
