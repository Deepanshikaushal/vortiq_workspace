package com.vortiq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_project_name", columnList = "name"),
    @Index(name = "idx_project_user_id", columnList = "user_id"),
    @Index(name = "idx_project_workspace_id", columnList = "workspace_id")
})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;
    
    private String colorCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    @JsonIgnore
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @JsonIgnore
    private User createdBy;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Task> tasks = new ArrayList<>();

    public Project() {
        this.createdAt = LocalDateTime.now();
    }

    public Project(String name, String description, String colorCode) {
        this.name = name;
        this.description = description;
        this.colorCode = colorCode;
        this.createdAt = LocalDateTime.now();
    }

    public Project(String name, String description, String colorCode, User user) {
        this.name = name;
        this.description = description;
        this.colorCode = colorCode;
        this.user = user;
        this.createdBy = user;
        this.createdAt = LocalDateTime.now();
    }

    public Project(String name, String description, String colorCode, Workspace workspace, User createdBy) {
        this.name = name;
        this.description = description;
        this.colorCode = colorCode;
        this.workspace = workspace;
        this.createdBy = createdBy;
        this.user = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    @JsonProperty("workspaceId")
    public Long getWorkspaceId() {
        return workspace != null ? workspace.getId() : null;
    }

    @JsonProperty("workspaceId")
    public void setWorkspaceId(Long workspaceId) {
        if (workspaceId != null) {
            Workspace dummy = new Workspace();
            dummy.setId(workspaceId);
            this.workspace = dummy;
        } else {
            this.workspace = null;
        }
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
