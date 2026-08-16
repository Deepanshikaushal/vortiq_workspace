package com.vortiq.repository;

import com.vortiq.model.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    List<Discussion> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    List<Discussion> findByWorkspaceIdAndCategoryOrderByCreatedAtDesc(Long workspaceId, String category);
}
