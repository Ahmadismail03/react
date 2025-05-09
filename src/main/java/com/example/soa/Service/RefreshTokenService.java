package com.example.soa.Service;

import com.example.soa.Model.RefreshToken;
import com.example.soa.Model.User;
import com.example.soa.exception.ActiveTokenException;
import com.example.soa.exception.TokenExpiredException;
import com.example.soa.exception.TokenNotFoundException;
import com.example.soa.exception.UserNotFoundException;
import com.example.soa.Repository.RefreshTokenRepository;
import com.example.soa.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${app.refreshTokenExpirationMs}") // Ensure this matches your properties file
    private Long refreshTokenExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        // Delete existing refresh tokens for the user
        refreshTokenRepository.deleteByUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)));

        // Create new refresh token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)));
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public RefreshToken verifyRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(this::verifyExpiration)
                .orElseThrow(() -> new TokenNotFoundException("Refresh token not found in database"));
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            // Log instead of deleting first
            System.out.println("Refresh token expired: " + token.getToken());
            throw new TokenExpiredException("Refresh token has expired. Please log in again.");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        // Verify user exists before deleting tokens
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        refreshTokenRepository.deleteByUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId)));
    }
}
