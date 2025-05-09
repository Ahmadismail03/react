package com.example.soa.payload;

import java.util.List;

public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    private String role;
    private List<String> roles;

    public JwtResponse(String token, Long id, String email, String role, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
} 