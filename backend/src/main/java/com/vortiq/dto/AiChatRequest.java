package com.vortiq.dto;

import java.util.List;
import java.util.Map;

public class AiChatRequest {
    private String message;
    private String workspaceName;
    private Long workspaceId;
    private Long projectId;
    private Integer taskCount;
    private List<Map<String, Object>> recentTasks;
    private String mode;

    public AiChatRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Integer getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(Integer taskCount) {
        this.taskCount = taskCount;
    }

    public List<Map<String, Object>> getRecentTasks() {
        return recentTasks;
    }

    public void setRecentTasks(List<Map<String, Object>> recentTasks) {
        this.recentTasks = recentTasks;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
