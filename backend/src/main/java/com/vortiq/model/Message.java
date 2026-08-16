package com.vortiq.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workspace_messages", indexes = {
    @Index(name = "idx_msg_workspace", columnList = "workspaceId"),
    @Index(name = "idx_msg_type", columnList = "messageType"),
    @Index(name = "idx_msg_recipient", columnList = "recipientId")
})
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workspaceId;

    private Long senderId;

    @Column(nullable = false)
    private String senderName;

    private String senderEmail;

    @Column(columnDefinition = "TEXT")
    private String senderAvatar;

    private Long recipientId; // null for public workspace broadcast, or specific user ID

    private String recipientName;

    @Column(nullable = false, length = 3000)
    private String content;

    private String messageType; // "INCONVENIENCE", "BLOCKER", "URGENT", "GENERAL", "TASK_INQUIRY"

    private Long taskId; // optional linked task

    private String taskTitle; // optional linked task title

    private LocalDateTime createdAt;

    public Message() {
        this.createdAt = LocalDateTime.now();
        this.messageType = "GENERAL";
    }

    public Message(Long workspaceId, String senderName, String senderEmail, String content, String messageType) {
        this.workspaceId = workspaceId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.content = content;
        this.messageType = messageType != null ? messageType : "GENERAL";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(Long workspaceId) { this.workspaceId = workspaceId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderAvatar() { return senderAvatar; }
    public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
