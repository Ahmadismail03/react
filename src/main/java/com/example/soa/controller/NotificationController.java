package com.example.soa.controller;

import com.example.soa.Model.Notification;
import com.example.soa.Model.User;
import com.example.soa.Model.Notification.NotificationStatus;
import com.example.soa.Repository.NotificationRepository;
import com.example.soa.security.UserPrincipal;
import com.example.soa.Service.NotificationService;
import com.example.soa.Service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/test-connection")
    public ResponseEntity<?> testConnection(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Notification testNotification = new Notification();
            testNotification.setTitle("Test Notification");
            testNotification.setMessage("This is a test notification");
            testNotification.setType("TEST");
            testNotification.setRecipientEmail(userPrincipal.getEmail());
            testNotification.setRead(false);
            testNotification.setStatus(NotificationStatus.valueOf(NotificationStatus.PENDING.name()));
            testNotification.setTemplateName("test_template");
            testNotification.setTemplateData("{}");
            
            // Get the user from the database
            User user = userService.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            testNotification.setUser(user);
            
            notificationRepository.save(testNotification);
            return ResponseEntity.ok("Test notification created successfully");
        } catch (Exception e) {
            logger.error("Error creating test notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to create test notification: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String recipientEmail,
            @RequestParam String type,
            @RequestParam(required = false) Long userId) {
        // Make user optional in notification creation
        Notification notification = notificationService.createNotification(title, message, recipientEmail, type, null);
        return ResponseEntity.ok(notification);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("Fetching all notifications for user: {}", currentUser.getEmail());
        List<Notification> notifications = notificationService.getUserNotifications(currentUser.getEmail());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("Fetching unread notifications for user: {}", currentUser.getEmail());
        List<Notification> notifications = notificationService.getUnreadNotifications(currentUser.getEmail());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        logger.info("Marking notification as read: {}", notificationId);
        Notification notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/count")
    public ResponseEntity<?> getNotificationCount(@AuthenticationPrincipal UserPrincipal currentUser) {
        logger.info("Getting notification count for user: {}", currentUser.getEmail());
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(currentUser.getEmail());
        List<Notification> allNotifications = notificationService.getUserNotifications(currentUser.getEmail());
        
        Map<String, Integer> counts = new HashMap<>();
        counts.put("unread", unreadNotifications.size());
        counts.put("total", allNotifications.size());
        
        return ResponseEntity.ok(counts);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{notificationId}/status/{status}")
    public ResponseEntity<?> updateNotificationStatus(
            @PathVariable Long notificationId,
            @PathVariable String status) {
        try {
            Notification.NotificationStatus notificationStatus = Notification.NotificationStatus.valueOf(status.toUpperCase());
            Notification notification = notificationService.updateNotificationStatus(notificationId, notificationStatus);
            return ResponseEntity.ok(notification);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid notification status: {}", status);
            return ResponseEntity.badRequest().body("Invalid notification status: " + status);
        } catch (Exception e) {
            logger.error("Error updating notification status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update notification status: " + e.getMessage());
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Notification.NotificationStatus notificationStatus = Notification.NotificationStatus.valueOf(status.toUpperCase());
            List<Notification> notifications = notificationService.getNotificationsByStatus(currentUser.getEmail(), notificationStatus);
            return ResponseEntity.ok(notifications);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid notification status: {}", status);
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Notification>> getNotificationsByUserEmail(
            @PathVariable String email,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Only allow admins to view other users' notifications
        if (!currentUser.getRole().equals(User.Role.ADMIN) && !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        logger.info("Fetching notifications for user with email: {}", email);
        List<Notification> notifications = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{email}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotificationsByUserEmail(
            @PathVariable String email,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Only allow admins to view other users' notifications
        if (!currentUser.getRole().equals(User.Role.ADMIN) && !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        logger.info("Fetching unread notifications for user with email: {}", email);
        List<Notification> notifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{email}/count")
    public ResponseEntity<?> getNotificationCountByUserEmail(
            @PathVariable String email,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Only allow admins to view other users' notifications
        if (!currentUser.getRole().equals(User.Role.ADMIN) && !currentUser.getEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        logger.info("Getting notification count for user with email: {}", email);
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications(email);
        List<Notification> allNotifications = notificationService.getUserNotifications(email);
        
        Map<String, Integer> counts = new HashMap<>();
        counts.put("unread", unreadNotifications.size());
        counts.put("total", allNotifications.size());
        
        return ResponseEntity.ok(counts);
    }

    @PostMapping("/create")
public ResponseEntity<?> createNotificationWithBody(
        @RequestBody NotificationRequest request,
        @AuthenticationPrincipal UserPrincipal currentUser) {
    try {
        // If recipientEmail is null or empty, use the current user's email
        if (request.getRecipientEmail() == null || request.getRecipientEmail().isEmpty()) {
            request.setRecipientEmail(currentUser.getEmail());
        }
        
        // Only allow admins to create notifications for other users
        if (!currentUser.getRole().equals(User.Role.ADMIN) && 
            !currentUser.getEmail().equals(request.getRecipientEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You can only create notifications for yourself");
        }

        logger.info("Creating notification for user: {}", request.getRecipientEmail());
        
        // Get the recipient user
        User recipient = userService.findByEmail(request.getRecipientEmail())
            .orElseThrow(() -> new RuntimeException("Recipient user not found"));

        // Create the notification
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setType(request.getType());
        notification.setRead(false);
        notification.setStatus(NotificationStatus.valueOf(NotificationStatus.PENDING.name()));
        notification.setUser(recipient);
        
        if (request.getTemplateName() != null) {
            notification.setTemplateName(request.getTemplateName());
        }
        if (request.getTemplateData() != null) {
            notification.setTemplateData(request.getTemplateData());
        }

        notification = notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    } catch (Exception e) {
        logger.error("Error creating notification: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Failed to create notification: " + e.getMessage());
    }
}}

class NotificationRequest {
    private String title;
    private String message;
    private String recipientEmail;
    private String type;
    private String templateName;
    private String templateData;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
}