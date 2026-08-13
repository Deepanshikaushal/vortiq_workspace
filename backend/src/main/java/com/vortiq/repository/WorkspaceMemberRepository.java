package com.vortiq.repository;

import com.vortiq.model.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    Boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    void deleteByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    void deleteByWorkspaceId(Long workspaceId);
}
