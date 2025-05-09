package com.example.soa.Service.impl;

import com.example.soa.Model.Profile;

import com.example.soa.Model.User;
import com.example.soa.Dto.ProfileUpdateDTO;
import com.example.soa.exception.InvalidRoleException;
import com.example.soa.exception.ResourceNotFoundException;
import com.example.soa.exception.UserAlreadyExistsException;
import com.example.soa.Repository.UserRepository;
import com.example.soa.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl extends UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Override
@Transactional
public User registerUser(User user) {
    // Log the beginning of registration
    logger.info("Starting user registration process for email: {}", user.getEmail());
    
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        throw new UserAlreadyExistsException("Email is already registered: " + user.getEmail());
    }

    // Set default role if not specified
    if (user.getRole() == null) {
        user.setRole(User.Role.STUDENT);
    }

    // Encode password
    user.setPassword(passwordEncoder.encode(user.getPassword()));

    // Save user first without profile
    user.setProfile(null); // Clear any existing profile reference
    User savedUser = userRepository.save(user);
    
    // Now create profile in a separate transaction
    try {
        Profile profile = new Profile();
        profile.setUser(savedUser);
        // Manually set any required fields
        profile.setBio(user.getBio());
        profile.setProfilePictureUrl(user.getProfilePictureUrl());
        
        // If you have a repository for Profile, use it here
        // profileRepository.save(profile);
        // Otherwise, set it on user and save again
        savedUser.setProfile(profile);
        savedUser = userRepository.save(savedUser);
        
        logger.info("User registration completed successfully for ID: {}", savedUser.getUserId());
        return savedUser;
    } catch (Exception e) {
        logger.error("Error creating profile for user: {}", e.getMessage(), e);
        // Still return the user even if profile creation fails
        return savedUser;
    }
}

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional
    public User updateUser(Long id, User userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User details cannot be null");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDetails.getName() != null && !userDetails.getName().trim().isEmpty()) {
            user.setName(userDetails.getName());
        }

        if (userDetails.getEmail() != null && !userDetails.getEmail().trim().isEmpty() 
            && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new UserAlreadyExistsException("Email is already in use");
            }
            user.setEmail(userDetails.getEmail());
        }

        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public Profile updateProfile(Long userId, ProfileUpdateDTO profileDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

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

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public User updateUserRole(Long userId, String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        try {
            User.Role newRole = User.Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid role: " + role + ". Available roles: STUDENT, INSTRUCTOR, ADMIN");
        }
    }
}