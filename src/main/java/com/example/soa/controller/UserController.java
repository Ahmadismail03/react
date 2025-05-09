package com.example.soa.controller;

import com.example.soa.Model.User;
import com.example.soa.Model.Profile;
import com.example.soa.Dto.ProfileUpdateDTO;
import com.example.soa.Dto.UserUpdateRequest;
import com.example.soa.exception.ResourceNotFoundException;
import com.example.soa.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}/profile")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<Profile> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody ProfileUpdateDTO profileDTO) {
        Profile updatedProfile = userService.updateProfile(userId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }
    
    @PostMapping("/profile/picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("profilePicture") MultipartFile file) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            Long userId = user.getUserId();
            
            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/profile-pictures";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to server
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile with new picture URL
            // Use a relative URL that will be resolved by the resource handler
            String profilePictureUrl = "/" + uploadDir + "/" + filename;
            ProfileUpdateDTO profileDTO = new ProfileUpdateDTO();
            profileDTO.setProfilePictureUrl(profilePictureUrl);
            
            // If user has existing profile, preserve bio
            User existingUser = userService.getUserById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            if (existingUser.getProfile() != null && existingUser.getProfile().getBio() != null) {
                profileDTO.setBio(existingUser.getProfile().getBio());
            }
            
            userService.updateProfile(userId, profileDTO);
            
            // Return success response with URL
            Map<String, String> response = new HashMap<>();
            response.put("url", profilePictureUrl);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload profile picture: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest updateRequest
    ) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(updateRequest.getUsername());
        userService.updateUser(id, user);
        return ResponseEntity.ok("Profile updated!");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        User updatedUser = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody User newUser) {
        User createdUser = userService.registerUser(newUser);
        return ResponseEntity.ok(createdUser);
    }
    
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(userId, userDetails);
        return ResponseEntity.ok(updatedUser);
    }
}