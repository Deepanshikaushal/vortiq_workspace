package com.vortiq.dto;

import com.vortiq.model.WorkspaceMember;

import java.time.LocalDateTime;

public class WorkspaceMemberDto {

    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String role;
    private LocalDateTime joinedAt;

    public WorkspaceMemberDto() {}

    public WorkspaceMemberDto(WorkspaceMember member) {
        this.id = member.getId();
        if (member.getUser() != null) {
            this.userId = member.getUser().getId();
            this.username = member.getUser().getUsername();
            this.name = member.getUser().getName();
            this.email = member.getUser().getEmail();
        }
        this.role = member.getRole() != null ? member.getRole().name() : "MEMBER";
        this.joinedAt = member.getJoinedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
