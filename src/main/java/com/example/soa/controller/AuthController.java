package com.example.soa.controller;

import com.example.soa.Model.PasswordResetToken;
import com.example.soa.Model.RefreshToken;
import com.example.soa.Model.User;
import com.example.soa.Dto.UpdateProfileRequest;
import com.example.soa.Repository.PasswordResetTokenRepository;
import com.example.soa.Service.EmailService;
import com.example.soa.Service.PasswordResetService;
import com.example.soa.payload.ApiResponse;
import com.example.soa.payload.LoginRequest;
import com.example.soa.payload.RegisterRequest;
import com.example.soa.payload.TokenRefreshRequest;
import com.example.soa.payload.TokenRefreshResponse;
import com.example.soa.security.JwtTokenProvider;
import com.example.soa.security.UserPrincipal;
import com.example.soa.Service.RefreshTokenService;
import com.example.soa.Service.UserService;
import com.example.soa.exception.TokenExpiredException;
import com.example.soa.exception.TokenNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.util.StringUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    // Password change request DTO
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
        
        public String getOldPassword() {
            return oldPassword;
        }
        
        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
    
    // Reset password request DTO
    public static class ResetPasswordRequest {
        private String newPassword;
        
        public String getNewPassword() {
            return newPassword;
        }
        
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;
    
    @Value("${app.url}")
    private String appUrl;

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserService userService,
            JwtTokenProvider tokenProvider,
            RefreshTokenService refreshTokenService,
            PasswordResetService passwordResetService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt received for email: {}", loginRequest.getEmail());

            // Validate request
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                logger.error("Login failed: Email is empty");
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid request", "Email cannot be empty"));
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                logger.error("Login failed: Password is empty");
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid request", "Password cannot be empty"));
            }

            // Check if user exists
            Optional<User> userOptional = userService.findByEmail(loginRequest.getEmail());
            if (userOptional.isEmpty()) {
                logger.error("Login failed: User not found with email: {}", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication failed", "User not found with email: " + loginRequest.getEmail()));
            }

            User user = userOptional.get();
            logger.info("Found user with ID: {}, Role: {}", user.getUserId(), user.getRole());

            // Custom authentication logic to handle plaintext passwords
            if (!userService.validatePassword(user, loginRequest.getPassword())) {
                logger.error("Authentication failed for user: {} - Error: Bad credentials", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication failed", "Invalid email or password"));
            }
            
            // Create UserPrincipal from the user object
            UserPrincipal userPrincipal = UserPrincipal.create(user);
            
            // Create authentication token with authenticated user
            // Convert user role to Spring Security authorities
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userPrincipal, // Use UserPrincipal as the principal
                null, // No credentials needed here as we've already validated
                authorities // Use the manually created authorities
            );
            
            // Set authentication in security context
            Authentication authentication = authToken;
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT
            String jwt = tokenProvider.generateToken(authentication);
            logger.info("JWT token generated for user: {}", loginRequest.getEmail());

            // Generate refresh token
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            logger.info("Refresh token generated for user: {}", loginRequest.getEmail());

            // Save refresh token
            RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(user.getUserId());
            logger.info("Refresh token saved to database for user: {}", loginRequest.getEmail());

            // Get user details from authentication
            UserPrincipal authenticatedUser = (UserPrincipal) authentication.getPrincipal();

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("refreshToken", refreshTokenEntity.getToken());
            response.put("tokenType", "Bearer");
            response.put("id", authenticatedUser.getId());
            response.put("email", authenticatedUser.getEmail());
            response.put("name", authenticatedUser.getName());
            response.put("role", authenticatedUser.getAuthorities().iterator().next().getAuthority());
            response.put("expiresIn", jwtExpirationInMs / 1000);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            logger.error("Authentication failed for user: {} - Error: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Authentication failed", "Invalid email or password"));
        } catch (Exception e) {
            logger.error("Unexpected error during login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Server error", "An unexpected error occurred"));
        }
    }

    /**
     * Register a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.debug("Registration attempt received for email: {}", registerRequest.getEmail());
        
        try {
            // Validate request
            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                logger.error("Registration failed: Email is empty");
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("error", "Invalid request");
                    put("message", "Email cannot be empty");
                }});
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                logger.error("Registration failed: Password is empty");
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("error", "Invalid request");
                    put("message", "Password cannot be empty");
                }});
            }

            if (registerRequest.getName() == null || registerRequest.getName().trim().isEmpty()) {
                logger.error("Registration failed: Name is empty");
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("error", "Invalid request");
                    put("message", "Name cannot be empty");
                }});
            }

            // Check if user already exists
            if (userService.findByEmail(registerRequest.getEmail()).isPresent()) {
                logger.error("Registration failed: Email already exists: {}", registerRequest.getEmail());
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("error", "Registration failed");
                    put("message", "Email is already taken");
                }});
            }

            // Create new user
            User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getRole() != null ? registerRequest.getRole() : User.Role.STUDENT
            );

            User registeredUser = userService.registerUser(user);
            logger.debug("User registered successfully with ID: {}", registeredUser.getUserId());

            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "User registered successfully");
                put("userId", registeredUser.getUserId().toString());
            }});
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("error", "Registration failed");
                put("message", e.getMessage());
            }});
        }
    }

    /**
     * Get the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", currentUser.getId());
            response.put("email", currentUser.getEmail());
            response.put("name", currentUser.getName());
            response.put("role", currentUser.getRole().name());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting current user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error", "Failed to get user information"));
        }
    }

    /**
     * Update user profile.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest updateRequest,
            Authentication authentication) {
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
        User user = userService.getUserById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updateRequest.getName());
        if (!user.getEmail().equals(updateRequest.getEmail())) {
            if (userService.findByEmail(updateRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email is already taken!");
            }
            user.setEmail(updateRequest.getEmail());
        }

        userService.updateUser(user.getUserId(), user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    /**
     * Refresh access token using refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            String requestRefreshToken = request.getRefreshToken();
            RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(requestRefreshToken);
            User user = refreshToken.getUser();
            String token = tokenProvider.generateTokenFromUserId(user.getUserId());
            return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Token refresh failed", e.getMessage()));
        }
    }

    /**
     * Logout user and invalidate refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            refreshTokenService.deleteByUserId(userPrincipal.getId());
            logger.info("User logged out: {}", userPrincipal.getEmail());
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Not logged in"));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        logger.info("Password change request received");
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            logger.error("Password change failed: User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Authentication required", "You must be logged in to change your password"));
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();
        
        // Validate request
        if (StringUtils.isBlank(request.getOldPassword()) || StringUtils.isBlank(request.getNewPassword())) {
            logger.error("Password change failed: Missing required fields");
            return ResponseEntity.badRequest()
                .body(createErrorResponse("Invalid request", "Old password and new password are required"));
        }
        
        try {
            // Get user from database
            Optional<User> userOptional = userService.getUserById(userId);
            if (userOptional.isEmpty()) {
                logger.error("Password change failed: User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("User not found", "User not found with ID: " + userId));
            }
            
            User user = userOptional.get();
            
            // Validate old password
            if (!userService.validatePassword(user, request.getOldPassword())) {
                logger.error("Password change failed for user ID {}: Incorrect old password", userId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication failed", "Current password is incorrect"));
            }
            
            // Update password
            userService.updatePassword(userId, request.getNewPassword());
            logger.info("Password changed successfully for user ID: {}", userId);
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            
        } catch (Exception e) {
            logger.error("Password change failed for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Server error", "An error occurred while changing password"));
        }
    }

    /**
     * Utility method to validate user roles.
     */
    private boolean isValidRole(User.Role role) {
        return role == User.Role.ADMIN ||
                role == User.Role.INSTRUCTOR ||
                role == User.Role.STUDENT;
    }

    private void writeResponse(HttpServletResponse response, int status, Map<String, Object> body) {
        try {
            response.setStatus(status);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            new ObjectMapper().writeValue(response.getWriter(), body);
        } catch (IOException e) {
            logger.error("Failed to write error response", e);
        }
    }

    private Map<String, String> createErrorResponse(String error, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", error);
        response.put("message", message);
        return response;
    }
    
    /**
     * Handle forgot password request
     * Creates a token and sends a password reset email with instructions
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            logger.info("Forgot password request received for email: {}", request.getEmail());
            
            // Check if user exists
            Optional<User> userOptional = userService.findByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                // For security reasons, don't reveal that the email doesn't exist
                logger.warn("Forgot password requested for non-existent email: {}", request.getEmail());
                return ResponseEntity.ok(
                    Map.of("message", "If your email is registered, password reset instructions have been sent.")
                );
            }
            
            User user = userOptional.get();
            
            // Generate reset link and send email using the service
            try {
                // Use the frontend URL for the reset password page
                String resetLink = passwordResetService.generatePasswordResetLink(user, appUrl + "/reset-password");
                passwordResetService.sendPasswordResetEmail(user, resetLink);
                logger.info("Password reset email sent to user ID: {}, email: {}", user.getUserId(), user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send password reset email: {}", e.getMessage(), e);
                // We still return success to the user for security reasons
            }
            
            return ResponseEntity.ok(
                Map.of("message", "If your email is registered, password reset instructions have been sent.")
            );
        } catch (Exception e) {
            logger.error("Error processing forgot password request: {}", e.getMessage(), e);
            return ResponseEntity.ok(
                Map.of("message", "If your email is registered, password reset instructions have been sent.")
            );
        }
    }
    
    /**
     * Validate a password reset token
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam("token") String token) {
        try {
            logger.info("Validating password reset token");
            
            // Use the service to validate the token
            passwordResetService.validateToken(token);
            return ResponseEntity.ok(Map.of("valid", true, "message", "Valid password reset token"));
            
        } catch (TokenNotFoundException e) {
            logger.warn("Invalid password reset token: {}", token);
            return ResponseEntity.badRequest()
                .body(Map.of("valid", false, "message", "Invalid password reset token"));
        } catch (TokenExpiredException e) {
            logger.warn("Expired password reset token: {}", token);
            return ResponseEntity.badRequest()
                .body(Map.of("valid", false, "message", "Password reset token has expired"));
        } catch (Exception e) {
            logger.error("Error validating password reset token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("valid", false, "message", "An error occurred while validating the token"));
        }
    }
    
    /**
     * Reset password using token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("token") String token,
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            logger.info("Password reset request received");
            
            // Validate password
            if (StringUtils.isBlank(request.getNewPassword())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "New password is required"));
            }
            
            // Use the service to reset the password
            passwordResetService.resetPassword(token, request.getNewPassword());
            logger.info("Password reset successfully");
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Password has been reset successfully"));
        } catch (TokenNotFoundException e) {
            logger.warn("Invalid password reset token: {}", token);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid password reset token"));
        } catch (TokenExpiredException e) {
            logger.warn("Expired password reset token: {}", token);
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Password reset token has expired"));
        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "An error occurred while resetting your password"));
        }
    }

    /**
     * Change user password (duplicate method - can be removed)
     */
    @PostMapping("/users/change-password")
    public ResponseEntity<?> changeUserPassword(
            @RequestBody Map<String, String> passwordRequest,
            Authentication authentication) {
        try {
            UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
            String oldPassword = passwordRequest.get("oldPassword");
            String newPassword = passwordRequest.get("newPassword");
            
            if (StringUtils.isBlank(oldPassword) || StringUtils.isBlank(newPassword)) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid request", "Old password and new password are required"));
            }
            
            User user = userService.getUserById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate old password
            if (!userService.validatePassword(user, oldPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Password change failed", "Current password is incorrect"));
            }
            
            // Update password
            userService.updatePassword(user.getUserId(), newPassword);
            
            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Password change failed", e.getMessage()));
        }
    }
}