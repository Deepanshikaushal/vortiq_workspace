package com.vortiq.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discussions", indexes = {
    @Index(name = "idx_disc_workspace", columnList = "workspaceId"),
    @Index(name = "idx_disc_category", columnList = "category")
})
public class Discussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workspaceId;

    private Long authorId;

    @Column(nullable = false)
    private String authorName;

    private String authorEmail;

    @Column(columnDefinition = "TEXT")
    private String authorAvatar;

    private String authorDepartment;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String content;

    private String category; // "IDEA", "OPINION", "ROADMAP", "QUESTION", "CASUAL"

    private Integer likesCount = 0;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @OrderBy("createdAt ASC")
    private List<DiscussionReply> replies = new ArrayList<>();

    public Discussion() {
        this.createdAt = LocalDateTime.now();
        this.category = "OPINION";
        this.likesCount = 0;
    }

    public Discussion(Long workspaceId, String authorName, String authorEmail, String title, String content, String category) {
        this.workspaceId = workspaceId;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.title = title;
        this.content = content;
        this.category = category != null ? category : "OPINION";
        this.likesCount = 0;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getAuthorDepartment() { return authorDepartment; }
    public void setAuthorDepartment(String authorDepartment) { this.authorDepartment = authorDepartment; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getLikesCount() { return likesCount != null ? likesCount : 0; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DiscussionReply> getReplies() { return replies; }
    public void setReplies(List<DiscussionReply> replies) { this.replies = replies; }

    public void addReply(DiscussionReply reply) {
        replies.add(reply);
        reply.setDiscussion(this);
    }
}
