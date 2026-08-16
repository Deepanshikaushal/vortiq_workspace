package com.vortiq.controller;

import com.vortiq.dto.InviteMemberRequest;
import com.vortiq.dto.WorkspaceDto;
import com.vortiq.dto.WorkspaceMemberDto;
import com.vortiq.model.User;
import com.vortiq.model.Workspace;
import com.vortiq.model.WorkspaceRole;
import com.vortiq.repository.UserRepository;
import com.vortiq.service.WorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = "*")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final UserRepository userRepository;

    public WorkspaceController(WorkspaceService workspaceService, UserRepository userRepository) {
        this.workspaceService = workspaceService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceDto>> getWorkspaces(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user != null) {
            return ResponseEntity.ok(workspaceService.getUserWorkspaces(user));
        }
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @PostMapping
    public ResponseEntity<WorkspaceDto> createWorkspace(@RequestBody Workspace workspace, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElseThrow(() -> new IllegalStateException("No user available"));
        }
        WorkspaceDto created = workspaceService.createWorkspace(workspace, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkspaceDto> updateWorkspace(
            @PathVariable Long id,
            @RequestBody Workspace workspace,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, workspace, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        workspaceService.deleteWorkspace(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<WorkspaceMemberDto>> getWorkspaceMembers(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(workspaceService.getWorkspaceMembers(id, user));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<WorkspaceMemberDto> inviteMember(
            @PathVariable Long id,
            @RequestBody InviteMemberRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        WorkspaceMemberDto member = workspaceService.inviteMember(id, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        workspaceService.removeMember(id, userId, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/members/{userId}/role")
    public ResponseEntity<WorkspaceMemberDto> changeMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        WorkspaceRole role = WorkspaceRole.valueOf(payload.get("role"));
        WorkspaceMemberDto updated = workspaceService.changeMemberRole(id, userId, role, user);
        return ResponseEntity.ok(updated);
    }
}
