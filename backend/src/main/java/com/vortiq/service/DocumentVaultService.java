package com.vortiq.service;

import com.vortiq.model.docs.DocumentVaultItem;
import com.vortiq.repository.DocumentVaultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentVaultService {

    @Autowired
    private DocumentVaultRepository documentRepository;

    public List<DocumentVaultItem> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc();
    }

    public List<DocumentVaultItem> getDocumentsByCategory(String category) {
        return documentRepository.findByCategory(category);
    }

    public List<DocumentVaultItem> getDocumentsByProject(Long projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    public DocumentVaultItem uploadDocument(DocumentVaultItem document) {
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public Map<String, Object> getDocumentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFiles", documentRepository.count());
        stats.put("categoriesCount", documentRepository.findAll().stream().map(DocumentVaultItem::getCategory).distinct().count());
        return stats;
    }
}
