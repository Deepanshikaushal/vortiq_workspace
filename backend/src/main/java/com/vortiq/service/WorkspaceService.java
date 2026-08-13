package com.vortiq.service;

import com.vortiq.dto.InviteMemberRequest;
import com.vortiq.dto.WorkspaceDto;
import com.vortiq.dto.WorkspaceMemberDto;
import com.vortiq.model.User;
import com.vortiq.model.Workspace;
import com.vortiq.model.WorkspaceMember;
import com.vortiq.model.WorkspaceRole;
import com.vortiq.repository.UserRepository;
import com.vortiq.repository.WorkspaceMemberRepository;
import com.vortiq.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    public List<WorkspaceDto> getUserWorkspaces(User user) {
        List<Workspace> workspaces = workspaceRepository.findAllUserWorkspaces(user.getId());
        return workspaces.stream().map(ws -> {
            WorkspaceRole role = getMemberRole(ws.getId(), user.getId());
            return new WorkspaceDto(ws, role);
        }).collect(Collectors.toList());
    }

    public Optional<Workspace> getWorkspaceById(Long id) {
        return workspaceRepository.findById(id);
    }

    @Transactional
    public WorkspaceDto createWorkspace(Workspace workspace, User owner) {
        workspace.setOwner(owner);
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = new WorkspaceMember(saved, owner, WorkspaceRole.OWNER);
        workspaceMemberRepository.save(ownerMember);

        return new WorkspaceDto(saved, WorkspaceRole.OWNER);
    }

    @Transactional
    public WorkspaceDto updateWorkspace(Long id, Workspace updated, User user) {
        Workspace ws = workspaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        verifyAdminOrOwner(ws.getId(), user.getId());

        ws.setName(updated.getName());
        ws.setDescription(updated.getDescription());
        if (updated.getColorCode() != null) {
            ws.setColorCode(updated.getColorCode());
        }
        Workspace saved = workspaceRepository.save(ws);
        return new WorkspaceDto(saved, getMemberRole(id, user.getId()));
    }

    @Transactional
    public void deleteWorkspace(Long id, User user) {
        Workspace ws = workspaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (!ws.getOwner().getId().equals(user.getId())) {
            throw new IllegalStateException("Only workspace owner can delete workspace");
        }

        workspaceMemberRepository.deleteByWorkspaceId(id);
        workspaceRepository.deleteById(id);
    }

    @Transactional
    public WorkspaceMemberDto inviteMember(Long workspaceId, InviteMemberRequest request, User requester) {
        verifyAdminOrOwner(workspaceId, requester.getId());

        User targetUser = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUser.getId())) {
            throw new IllegalStateException("User is already a member of this workspace");
        }

        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        WorkspaceMember member = new WorkspaceMember(ws, targetUser, request.getRole());
        WorkspaceMember saved = workspaceMemberRepository.save(member);
        return new WorkspaceMemberDto(saved);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long userId, User requester) {
        verifyAdminOrOwner(workspaceId, requester.getId());

        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (ws.getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Cannot remove workspace owner");
        }

        workspaceMemberRepository.deleteByWorkspaceIdAndUserId(workspaceId, userId);
    }

    @Transactional
    public WorkspaceMemberDto changeMemberRole(Long workspaceId, Long userId, WorkspaceRole role, User requester) {
        verifyAdminOrOwner(workspaceId, requester.getId());

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace member not found"));

        if (member.getWorkspace().getOwner().getId().equals(userId)) {
            throw new IllegalStateException("Cannot change owner role");
        }

        member.setRole(role);
        WorkspaceMember saved = workspaceMemberRepository.save(member);
        return new WorkspaceMemberDto(saved);
    }

    public List<WorkspaceMemberDto> getWorkspaceMembers(Long workspaceId, User user) {
        verifyMember(workspaceId, user.getId());
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        return members.stream().map(WorkspaceMemberDto::new).collect(Collectors.toList());
    }

    private WorkspaceRole getMemberRole(Long workspaceId, Long userId) {
        Workspace ws = workspaceRepository.findById(workspaceId).orElse(null);
        if (ws != null && ws.getOwner().getId().equals(userId)) {
            return WorkspaceRole.OWNER;
        }
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(WorkspaceMember::getRole)
                .orElse(WorkspaceRole.VIEWER);
    }

    private void verifyAdminOrOwner(Long workspaceId, Long userId) {
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (ws.getOwner().getId().equals(userId)) return;

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new IllegalStateException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new IllegalStateException("Admin or Owner role required for this action");
        }
    }

    private void verifyMember(Long workspaceId, Long userId) {
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found"));

        if (ws.getOwner().getId().equals(userId)) return;

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new IllegalStateException("Access denied: Not a workspace member");
        }
    }
}
