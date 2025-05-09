package com.example.soa.Service;

import com.example.soa.Model.Notification;
import com.example.soa.Model.User;
import com.example.soa.Repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public Notification createNotification(String title, String message, String recipientEmail, String type, User user) {
        logger.info("Creating notification for recipient: {} with type: {}", recipientEmail, type);
        // User is now optional
        
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRecipientEmail(recipientEmail);
        notification.setType(type);
        notification.setRead(false);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setUser(user);

        // Save notification to database
        notification = notificationRepository.save(notification);
        logger.info("Notification saved with ID: {}", notification.getNotificationId());

        // Send email notification asynchronously
        sendEmailNotificationAsync(notification);

        return notification;
    }

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 1000; // 1 second delay between retries

    @Async
    protected void sendEmailNotificationAsync(Notification notification) {
        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < MAX_RETRY_ATTEMPTS) {
            try {
                logger.info("Processing email notification for ID: {} (Attempt: {})", notification.getNotificationId(), retryCount + 1);
                
                // Validate notification data
                if (notification.getRecipientEmail() == null || notification.getTitle() == null) {
                    logger.error("Invalid notification data: recipient email or title is null for notification {}", notification.getNotificationId());
                    return;
                }

                Context context = new Context();
                context.setVariable("message", notification.getMessage());
                context.setVariable("title", notification.getTitle());
                
                // Process template data with enhanced error handling
                if (notification.getTemplateData() != null) {
                    try {
                        Map<String, Object> templateData = objectMapper.readValue(notification.getTemplateData(), Map.class);
                        if (templateData == null) {
                            throw new IllegalArgumentException("Template data parsing resulted in null");
                        }
                        templateData.forEach((key, value) -> {
                            if (key != null) {
                                logger.trace("Setting template variable: {} = {}", key, value);
                                context.setVariable(key, value);
                            }
                        });
                        logger.debug("Template data processed successfully: {}", templateData.keySet());
                    } catch (Exception e) {
                        logger.error("Error processing template data for notification {}: {}", notification.getNotificationId(), e.getMessage());
                        logger.debug("Raw template data: {}", notification.getTemplateData());
                        // Continue with basic template if template data processing fails
                    }
                }

                // Validate and process template
                String templateName = notification.getTemplateName();
                if (templateName == null || templateName.trim().isEmpty()) {
                    templateName = "default-email";
                }
                logger.debug("Processing template: {} for notification {}", templateName, notification.getNotificationId());
                
                String htmlContent;
                try {
                    htmlContent = templateEngine.process(templateName, context);
                    if (htmlContent == null || htmlContent.trim().isEmpty()) {
                        throw new IllegalStateException("Template processing resulted in empty content");
                    }
                } catch (Exception e) {
                    logger.error("Template processing failed for notification {}: {}", notification.getNotificationId(), e.getMessage());
                    if (retryCount == MAX_RETRY_ATTEMPTS - 1) {
                        // On last retry, fall back to basic email format
                        htmlContent = String.format("<html><body><h1>%s</h1><p>%s</p></body></html>",
                            notification.getTitle(), notification.getMessage());
                    } else {
                        throw e;
                    }
                }
                
                sendEmail(notification.getRecipientEmail(), notification.getTitle(), htmlContent);
                logger.info("Email sent successfully to: {} for notification {}", notification.getRecipientEmail(), notification.getNotificationId());
                return; // Success - exit the retry loop
                
            } catch (Exception e) {
                lastException = e;
                logger.warn("Attempt {} failed for notification {}: {}", retryCount + 1, notification.getNotificationId(), e.getMessage());
                
                if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * (retryCount + 1)); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        logger.error("Retry interrupted for notification {}", notification.getNotificationId());
                        break;
                    }
                }
                retryCount++;
            }
        }

        // If we get here, all retries failed
        logger.error("All {} retry attempts failed for notification {}", MAX_RETRY_ATTEMPTS, notification.getNotificationId(), lastException);
    }

    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public List<Notification> getUserNotifications(String recipientEmail) {
        logger.debug("Fetching all notifications for user: {}", recipientEmail);
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(recipientEmail);
    }

    public List<Notification> getUnreadNotifications(String recipientEmail) {
        logger.debug("Fetching unread notifications for user: {}", recipientEmail);
        // Support both legacy isRead field and new status field
        List<Notification> unreadByIsRead = notificationRepository.findByRecipientEmailAndIsReadOrderByCreatedAtDesc(recipientEmail, false);
        List<Notification> unreadByStatus = notificationRepository.findByRecipientEmailAndStatusOrderByCreatedAtDesc(
            recipientEmail, Notification.NotificationStatus.PENDING);
        
        // Combine both lists and remove duplicates
        Set<Notification> combinedSet = new HashSet<>(unreadByIsRead);
        combinedSet.addAll(unreadByStatus);
        
        // Convert back to list and sort by createdAt
        List<Notification> result = new ArrayList<>(combinedSet);
        result.sort((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()));
        
        return result;
    }
    
    public List<Notification> getNotificationsByStatus(String recipientEmail, Notification.NotificationStatus status) {
        logger.debug("Fetching notifications with status {} for user: {}", status, recipientEmail);
        return notificationRepository.findByRecipientEmailAndStatusOrderByCreatedAtDesc(recipientEmail, status);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        logger.info("Marking notification as read: {}", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notification.setStatus(Notification.NotificationStatus.READ);
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public Notification updateNotificationStatus(Long notificationId, Notification.NotificationStatus status) {
        logger.info("Updating notification {} status to: {}", notificationId, status);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Update status
        notification.setStatus(status);
        
        // If status is READ, also update isRead flag for backward compatibility
        if (status == Notification.NotificationStatus.READ) {
            notification.setRead(true);
        }
        
        return notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        logger.info("Deleting notification: {}", notificationId);
        // Option 1: Hard delete - remove from database
        // notificationRepository.deleteById(notificationId);
        
        // Option 2: Soft delete - mark as DELETED status
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus(Notification.NotificationStatus.DELETED);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void purgeDeletedNotifications() {
        logger.info("Purging notifications marked as DELETED");
        // Find all notifications with DELETED status and remove them
        List<Notification> deletedNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getStatus() == Notification.NotificationStatus.DELETED)
                .collect(Collectors.toList());
        
        if (!deletedNotifications.isEmpty()) {
            notificationRepository.deleteAll(deletedNotifications);
            logger.info("Purged {} notifications", deletedNotifications.size());
        }
    }
}