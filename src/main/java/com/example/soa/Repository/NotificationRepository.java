package com.example.soa.Repository;

import com.example.soa.Model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    
    List<Notification> findByRecipientEmailAndIsReadOrderByCreatedAtDesc(String recipientEmail, boolean isRead);
    
    // Find notifications by status
    List<Notification> findByRecipientEmailAndStatusOrderByCreatedAtDesc(String recipientEmail, Notification.NotificationStatus status);
    
    // Pagination support for notifications by status
    Page<Notification> findByRecipientEmailAndStatusOrderByCreatedAtDesc(String recipientEmail, Notification.NotificationStatus status, Pageable pageable);
    
    // Pagination support for unread notifications (legacy support)
    Page<Notification> findByRecipientEmailAndIsReadOrderByCreatedAtDesc(String recipientEmail, boolean isRead, Pageable pageable);
    
    // Find notifications by type
    List<Notification> findByRecipientEmailAndTypeOrderByCreatedAtDesc(String recipientEmail, String type);
    
    // Find notifications within date range
    List<Notification> findByRecipientEmailAndCreatedAtBetweenOrderByCreatedAtDesc(String recipientEmail, LocalDateTime startDate, LocalDateTime endDate);
    
    // Count unread notifications for a recipient
    long countByRecipientEmailAndIsRead(String recipientEmail, boolean isRead);
    
    // Count notifications by status for a recipient
    long countByRecipientEmailAndStatus(String recipientEmail, Notification.NotificationStatus status);
    
    // Bulk update notifications as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.status = 'READ' WHERE n.recipientEmail = ?1 AND n.isRead = false")
    void markAllAsRead(String recipientEmail);
    
    // Bulk update notifications status
    @Modifying
    @Query("UPDATE Notification n SET n.status = ?2 WHERE n.recipientEmail = ?1 AND n.status = ?3")
    void updateNotificationStatus(String recipientEmail, Notification.NotificationStatus newStatus, Notification.NotificationStatus oldStatus);
    
    // Delete old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < ?1 AND n.isRead = true")
    void deleteOldReadNotifications(LocalDateTime beforeDate);
}