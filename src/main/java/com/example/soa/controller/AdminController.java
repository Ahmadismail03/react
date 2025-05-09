package com.example.soa.controller;

import com.example.soa.Model.User;
import com.example.soa.Service.UserService;
import com.example.soa.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Admin fetching all users");
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        logger.info("Admin fetching user with ID: {}", userId);
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        logger.info("Admin creating new user with email: {}", user.getEmail());
        User createdUser = userService.registerUser(user);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @Valid @RequestBody User user) {
        logger.info("Admin updating user with ID: {}", userId);
        User updatedUser = userService.updateUser(userId, user);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        logger.info("Admin updating role for user with ID: {} to {}", userId, role);
        User updatedUser = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("Admin deleting user with ID: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}