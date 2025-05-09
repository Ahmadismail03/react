package com.example.soa.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Message cannot be empty")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @NotBlank(message = "Recipient email cannot be empty")
    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String recipientEmail;

    @NotBlank(message = "Notification type cannot be empty")
    @Column(nullable = false)
    private String type; // COURSE_UPDATE, ASSIGNMENT_DUE, etc.

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Size(max = 100, message = "Template name cannot exceed 100 characters")
    @Column
    private String templateName;

    @Column(columnDefinition = "TEXT")
    private String templateData;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User user;

    public Notification() {
    }

    public Notification(User user, String title, String message, String recipientEmail, String type) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.recipientEmail = recipientEmail;
        this.type = type;
        this.createdAt = Instant.now();
        this.updatedAt = createdAt;
        this.status = NotificationStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public void markAsUnread() {
        this.isRead = false;
    }

    public boolean isTemplate() {
        return templateName != null && !templateName.isEmpty();
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateData() {
        return templateData;
    }

    public void setTemplateData(String templateData) {
        this.templateData = templateData;
    }

    public LocalDateTime getTimestamp() {
        return LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Notification{" +
                "notificationId=" + notificationId +
                ", title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", type='" + type + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", templateName='" + templateName + '\'' +
                ", user=" + user +
                ", status=" + status +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Notification that = (Notification) o;
        return Objects.equals(notificationId, that.notificationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(notificationId);
    }

    public enum NotificationStatus {
        SENT, PENDING, READ, DELETED
    }
}
