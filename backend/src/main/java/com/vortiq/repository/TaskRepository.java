package com.vortiq.repository;

import com.vortiq.model.Task;
import com.vortiq.model.TaskPriority;
import com.vortiq.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByPriority(TaskPriority priority);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    List<Task> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t WHERE t.workspace.id = :workspaceId")
    List<Task> findByWorkspaceId(@Param("workspaceId") Long workspaceId);

    @Query("SELECT t FROM Task t WHERE " +
           "(:workspaceId IS NULL OR t.workspace.id = :workspaceId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Task> filterTasks(
            @Param("workspaceId") Long workspaceId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("assignedToId") Long assignedToId,
            @Param("search") String search);

    long countByStatus(TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE (:workspaceId IS NULL OR t.workspace.id = :workspaceId) AND t.status = :status")
    long countByWorkspaceIdAndStatus(@Param("workspaceId") Long workspaceId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE (:workspaceId IS NULL OR t.workspace.id = :workspaceId)")
    long countByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
