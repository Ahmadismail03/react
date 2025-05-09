package com.example.soa.Service;

import com.example.soa.Model.User;
import com.example.soa.Model.Profile;
import com.example.soa.Dto.ProfileUpdateDTO;
import com.example.soa.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(User user) {
        logger.info("Starting user registration process for email: {}", user.getEmail());
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.error("Registration failed: User already exists with email: {}", user.getEmail());
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        logger.debug("Password encoded successfully for user: {}", user.getEmail());
        user.setPassword(encodedPassword);
        
        Profile profile = new Profile();
        profile.setUser(user);
        user.setProfile(profile);
        
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with ID: {}, Email: {}, Role: {}", 
            savedUser.getUserId(), savedUser.getEmail(), savedUser.getRole());
        
        // Verify the user was saved
        Optional<User> verifyUser = userRepository.findByEmail(user.getEmail());
        if (verifyUser.isPresent()) {
            logger.info("User verification successful - User exists in database");
        } else {
            logger.error("User verification failed - User not found in database after save");
        }
        
        return savedUser;
    }

    public Optional<User> findByEmail(String email) {
        logger.info("Attempting to find user with email: {}", email);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User foundUser = user.get();
            logger.info("User found - ID: {}, Email: {}, Role: {}, Enabled: {}", 
                foundUser.getUserId(), foundUser.getEmail(), foundUser.getRole(), foundUser.isEnabled());
        } else {
            logger.warn("No user found with email: {}", email);
        }
        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setName(userDetails.getName());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        user.updateProfile(userDetails.getBio(), userDetails.getProfilePictureUrl());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public boolean validatePassword(User user, String password) {
        logger.info("Validating password for user: {}", user.getEmail());
        logger.debug("Raw password length: {}", password.length());
        logger.debug("Stored hashed password: {}", user.getPassword());
        
        // TEMPORARY FIX: Check if the stored password is not in BCrypt format
        // If it's not a BCrypt hash, compare directly for testing purposes
        if (!user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$") && !user.getPassword().startsWith("$2y$")) {
            logger.warn("Using direct password comparison for user: {} as password is not BCrypt hashed", user.getEmail());
            boolean isDirectMatch = password.equals(user.getPassword());
            logger.info("Direct password validation result for user {}: {}", user.getEmail(), isDirectMatch);
            return isDirectMatch;
        }
        
        // Normal BCrypt validation
        boolean isValid = passwordEncoder.matches(password, user.getPassword());
        logger.info("Password validation result for user {}: {}", user.getEmail(), isValid);
        if (!isValid) {
            logger.warn("Password validation failed for user: {}", user.getEmail());
        }
        return isValid;
    }

    @Transactional
    public Profile updateProfile(Long userId, ProfileUpdateDTO profileDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
        }
        profile.setBio(profileDTO.getBio());
        profile.setProfilePictureUrl(profileDTO.getProfilePictureUrl());
        user.setProfile(profile);
        userRepository.save(user);
        return profile;
    }

    @Transactional
    public User updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        try {
            User.Role newRole = User.Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role + ". Available roles: STUDENT, INSTRUCTOR, ADMIN");
        }
    }
    
    /**
     * Update user password with proper encoding
     */
    @Transactional
    public User updatePassword(Long userId, String newPassword) {
        logger.info("Updating password for user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Encode the new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        
        User updatedUser = userRepository.save(user);
        logger.info("Password updated successfully for user with ID: {}", userId);
        
        return updatedUser;
    }
    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }}
