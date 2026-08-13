package com.vortiq.repository;

import com.vortiq.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE (:workspaceId IS NULL OR p.workspace.id = :workspaceId)")
    List<Project> findByWorkspaceId(@Param("workspaceId") Long workspaceId);

    @Query("SELECT p FROM Project p WHERE p.user.id = :userId")
    List<Project> findByUserId(@Param("userId") Long userId);
}
