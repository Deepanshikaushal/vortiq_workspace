package com.vortiq.controller;

import com.vortiq.model.docs.DocumentVaultItem;
import com.vortiq.service.DocumentVaultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/documents")
@CrossOrigin(origins = "*")
public class DocumentVaultController {

    @Autowired
    private DocumentVaultService documentService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(documentService.getDocumentStats());
    }

    @GetMapping
    public ResponseEntity<List<DocumentVaultItem>> getAllDocuments(@RequestParam(required = false) String category,
                                                                  @RequestParam(required = false) Long projectId) {
        if (category != null) {
            return ResponseEntity.ok(documentService.getDocumentsByCategory(category));
        }
        if (projectId != null) {
            return ResponseEntity.ok(documentService.getDocumentsByProject(projectId));
        }
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping
    public ResponseEntity<DocumentVaultItem> uploadDocument(@RequestBody DocumentVaultItem document) {
        return ResponseEntity.ok(documentService.uploadDocument(document));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
