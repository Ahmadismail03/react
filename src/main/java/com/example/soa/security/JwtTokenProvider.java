package com.example.soa.security;

import io.jsonwebtoken.*;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.soa.Model.User;
import com.example.soa.exception.CustomJwtException;
import com.example.soa.Repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    @Value("${app.refreshTokenExpirationMs}")
    private Long refreshTokenExpirationMs;

    @Autowired
    private UserRepository userRepository;

    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT secret key cannot be null or empty.");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 32 characters long.");
        }
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

   public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal;
        try {
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                userPrincipal = (UserPrincipal) authentication.getPrincipal();
            } else if (authentication.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
                userPrincipal = UserPrincipal.create(
                    userRepository.findByEmail(oidcUser.getEmail())
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + oidcUser.getEmail()))
                );
            } else {
                throw new IllegalArgumentException("Unsupported principal type: " + authentication.getPrincipal().getClass().getName());
            }
            return generateToken(userPrincipal);
        } catch (Exception e) {
            logger.error("Error generating token for authentication: {}", e.getMessage());
            throw new CustomJwtException("Failed to generate token: " + e.getMessage());
        }
    }

    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userPrincipal.getAuthorities().iterator().next().getAuthority());
        claims.put("userId", userPrincipal.getId());
        claims.put("email", userPrincipal.getEmail());
        claims.put("name", userPrincipal.getName());
        claims.put("tokenType", "ACCESS");
        claims.put("issuedAt", now.getTime());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(userPrincipal.getId()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateTokenFromUserId(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", user.getRole().name());
            claims.put("userId", user.getUserId());
            claims.put("email", user.getEmail());
            claims.put("name", user.getName());
            claims.put("tokenType", "ACCESS");
            claims.put("issuedAt", now.getTime());

            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(Long.toString(userId))
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            logger.error("Error generating token for user ID {}: {}", userId, e.getMessage());
            throw new CustomJwtException("Failed to generate token for user: " + e.getMessage());
        }
    }

    public Long getUserIdFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String subject = claims.getSubject();
            if (subject == null || subject.trim().isEmpty()) {
                throw new CustomJwtException("Invalid token: subject is missing");
            }

            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            logger.error("Error parsing user ID from token: {}", e.getMessage());
            throw new CustomJwtException("Invalid token: user ID is not a valid number");
        } catch (Exception e) {
            logger.error("Error extracting user ID from token: {}", e.getMessage());
            throw new CustomJwtException("Failed to extract user ID from token: " + e.getMessage());
        }
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal;
        try {
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                userPrincipal = (UserPrincipal) authentication.getPrincipal();
            } else if (authentication.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
                userPrincipal = UserPrincipal.create(
                    userRepository.findByEmail(oidcUser.getEmail())
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + oidcUser.getEmail()))
                );
            } else {
                throw new IllegalArgumentException("Unsupported principal type: " + authentication.getPrincipal().getClass().getName());
            }

            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMs);

            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userPrincipal.getId());
            claims.put("tokenType", "REFRESH");
            claims.put("issuedAt", now.getTime());

            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(String.valueOf(userPrincipal.getId()))
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            logger.error("Error generating refresh token: {}", e.getMessage());
            throw new CustomJwtException("Failed to generate refresh token: " + e.getMessage());
        }
    }

    public boolean validateToken(String authToken) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken)
                    .getBody();

            // Check if token is expired
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                logger.error("Token has expired");
                throw new ExpiredJwtException(null, claims, "Token has expired");
            }

            // Validate token type
            String tokenType = (String) claims.get("tokenType");
            if (tokenType == null) {
                logger.error("Token type is missing");
                throw new MalformedJwtException("Token type is missing");
            }

            // Additional validation based on token type
            if ("REFRESH".equals(tokenType) || "ACCESS".equals(tokenType)) {
                return true;
            } else {
                logger.error("Invalid token type: {}", tokenType);
                throw new MalformedJwtException("Invalid token type: " + tokenType);
            }
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Error validating token: {}", ex.getMessage());
        }
        return false;
    }
}
