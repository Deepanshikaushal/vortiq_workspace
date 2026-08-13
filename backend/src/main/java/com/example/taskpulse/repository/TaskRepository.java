package com.example.taskpulse.repository;

import com.example.taskpulse.model.Task;
import com.example.taskpulse.model.TaskPriority;
import com.example.taskpulse.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByPriority(TaskPriority priority);

    List<Task> findByProjectId(Long projectId);

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Task> filterTasks(@Param("status") TaskStatus status,
                           @Param("priority") TaskPriority priority,
                           @Param("search") String search);

    long countByStatus(TaskStatus status);
}
