package com.vortiq.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_replies", indexes = {
    @Index(name = "idx_reply_discussion", columnList = "discussion_id")
})
public class DiscussionReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id", nullable = false)
    @JsonBackReference
    private Discussion discussion;

    private Long authorId;

    @Column(nullable = false)
    private String authorName;

    private String authorEmail;

    @Column(columnDefinition = "TEXT")
    private String authorAvatar;

    private String authorDepartment;

    @Column(nullable = false, length = 3000)
    private String content;

    private LocalDateTime createdAt;

    public DiscussionReply() {
        this.createdAt = LocalDateTime.now();
    }

    public DiscussionReply(Discussion discussion, String authorName, String authorEmail, String authorAvatar, String content) {
        this.discussion = discussion;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.authorAvatar = authorAvatar;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Discussion getDiscussion() { return discussion; }
    public void setDiscussion(Discussion discussion) { this.discussion = discussion; }

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

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
