package com.example.soa.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    // Default constructor
    public LoginRequest() {
    }

    // Constructor with all fields
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    @JsonProperty("email")
    public String getEmail() {
        return email;
    }

    @JsonProperty("email")
    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    @JsonProperty("password")
    public String getPassword() {
        return password;
    }

    @JsonProperty("password")
    public void setPassword(String password) {
        this.password = password != null ? password.trim() : null;
    }

    @Override
    public String toString() {
        return "LoginRequest{" +
            "email='" + email + '\'' +
            ", password='[PROTECTED]'" +
            '}';
    }
}