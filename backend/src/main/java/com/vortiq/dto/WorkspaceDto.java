package com.vortiq.dto;

import com.vortiq.model.Workspace;
import com.vortiq.model.WorkspaceRole;

import java.time.LocalDateTime;

public class WorkspaceDto {

    private Long id;
    private String name;
    private String description;
    private String colorCode;
    private Long ownerId;
    private String ownerName;
    private String currentUserRole;
    private LocalDateTime createdAt;

    public WorkspaceDto() {}

    public WorkspaceDto(Workspace workspace, WorkspaceRole userRole) {
        this.id = workspace.getId();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        this.colorCode = workspace.getColorCode();
        if (workspace.getOwner() != null) {
            this.ownerId = workspace.getOwner().getId();
            this.ownerName = workspace.getOwner().getName();
        }
        this.currentUserRole = userRole != null ? userRole.name() : "MEMBER";
        this.createdAt = workspace.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getCurrentUserRole() { return currentUserRole; }
    public void setCurrentUserRole(String currentUserRole) { this.currentUserRole = currentUserRole; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
