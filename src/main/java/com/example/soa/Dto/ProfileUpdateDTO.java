package com.example.soa.Dto;

import jakarta.validation.constraints.Size;

public class ProfileUpdateDTO {
    @Size(max = 500)
    private String bio;

    private String profilePictureUrl;

    // Getters and Setters
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}