package com.vortiq.repository;

import com.vortiq.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByWorkspaceIdOrderByCreatedAtAsc(Long workspaceId);

    List<Message> findByWorkspaceIdAndMessageTypeOrderByCreatedAtAsc(Long workspaceId, String messageType);

    @Query("SELECT m FROM Message m WHERE m.workspaceId = :workspaceId AND " +
           "(m.recipientId IS NULL OR m.recipientId = :userId OR m.senderId = :userId) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findVisibleMessages(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);
}
