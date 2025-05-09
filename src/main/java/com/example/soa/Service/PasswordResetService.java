package com.example.soa.Service;

import com.example.soa.Model.PasswordResetToken;
import com.example.soa.Model.User;
import com.example.soa.Repository.PasswordResetTokenRepository;
import com.example.soa.Repository.UserRepository;
import com.example.soa.exception.TokenExpiredException;
import com.example.soa.exception.TokenNotFoundException;
import com.example.soa.exception.UserNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class PasswordResetService {
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    @Value("${app.resetPasswordTokenExpirationSec:86400}")
    private Long resetPasswordTokenExpirationSec; // Default 24 hours

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PasswordResetService(PasswordResetTokenRepository passwordResetTokenRepository, 
                               UserRepository userRepository,
                               EmailService emailService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Find a token by its value
     */
    public Optional<PasswordResetToken> findByToken(String token) {
        return passwordResetTokenRepository.findByToken(token);
    }

    /**
     * Create a password reset token for a user
     */
    @Transactional
    public PasswordResetToken createPasswordResetTokenForUser(User user) {
        logger.info("Creating password reset token for user: {}", user.getEmail());
        
        // Delete any existing tokens for this user
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);
        
        // Create new token
        PasswordResetToken token = new PasswordResetToken(user);
        
        // Set expiry date if not using default in constructor
        if (resetPasswordTokenExpirationSec != null) {
            token.setExpiryDate(Instant.now().plusSeconds(resetPasswordTokenExpirationSec));
        }
        
        return passwordResetTokenRepository.save(token);
    }

    /**
     * Validate a password reset token
     */
    public PasswordResetToken validateToken(String token) {
        logger.info("Validating password reset token");
        
        return passwordResetTokenRepository.findByToken(token)
                .map(this::verifyExpiration)
                .orElseThrow(() -> new TokenNotFoundException("Invalid password reset token"));
    }

    /**
     * Verify if a token has expired
     */
    private PasswordResetToken verifyExpiration(PasswordResetToken token) {
        if (token.isExpired()) {
            logger.warn("Password reset token has expired: {}", token.getToken());
            throw new TokenExpiredException("Password reset token has expired");
        }
        return token;
    }

    /**
     * Process password reset for a user
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        logger.info("Processing password reset request");
        
        // Validate token
        PasswordResetToken resetToken = validateToken(token);
        
        // Get user from token
        User user = resetToken.getUser();
        
        // Update password
        user.setPassword(newPassword); // Note: Password should be encoded by UserService
        userRepository.save(user);
        
        // Delete the used token
        passwordResetTokenRepository.delete(resetToken);
        
        logger.info("Password reset successfully for user: {}", user.getEmail());
    }

    /**
     * Generate a password reset link for a user
     */
    public String generatePasswordResetLink(User user, String baseUrl) {
        PasswordResetToken token = createPasswordResetTokenForUser(user);
        return baseUrl + "?token=" + token.getToken();
    }

    /**
     * Send password reset email to a user
     */
    public void sendPasswordResetEmail(User user, String resetLink) {
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink, user.getName());
            logger.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send password reset email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}