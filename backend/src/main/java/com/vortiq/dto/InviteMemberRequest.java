package com.vortiq.dto;

import com.vortiq.model.WorkspaceRole;

public class InviteMemberRequest {

    private String email;
    private WorkspaceRole role;

    public InviteMemberRequest() {}

    public InviteMemberRequest(String email, WorkspaceRole role) {
        this.email = email;
        this.role = role != null ? role : WorkspaceRole.MEMBER;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public WorkspaceRole getRole() { return role != null ? role : WorkspaceRole.MEMBER; }
    public void setRole(WorkspaceRole role) { this.role = role; }
}
