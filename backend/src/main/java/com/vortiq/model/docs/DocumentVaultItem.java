package com.vortiq.model.docs;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_vault")
public class DocumentVaultItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    private String fileType; // PDF, DOCX, XLSX, PNG, ZIP, CODE
    private String fileSize;
    private String fileUrl;
    private String category; // CONTRACT, SPECIFICATION, ARCHITECTURE, INVOICE, REPORT, DESIGN
    private String uploadedBy;
    private Long projectId;
    private String version;
    private LocalDateTime uploadedAt;

    public DocumentVaultItem() {
        this.uploadedAt = LocalDateTime.now();
        this.version = "v1.0";
    }

    public DocumentVaultItem(String fileName, String fileType, String fileSize, String fileUrl, String category, String uploadedBy, Long projectId, String version) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileUrl = fileUrl;
        this.category = category;
        this.uploadedBy = uploadedBy;
        this.projectId = projectId;
        this.version = version != null ? version : "v1.0";
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
