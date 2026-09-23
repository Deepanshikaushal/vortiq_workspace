package com.vortiq.repository;

import com.vortiq.model.docs.DocumentVaultItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentVaultRepository extends JpaRepository<DocumentVaultItem, Long> {
    List<DocumentVaultItem> findByCategory(String category);
    List<DocumentVaultItem> findByProjectId(Long projectId);
    List<DocumentVaultItem> findAllByOrderByUploadedAtDesc();
}
