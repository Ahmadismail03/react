package com.example.soa.Model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;

@Entity

@Table(name = "profile")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @MapsId
    @JsonIgnore
    private User user;

    private String profilePictureUrl;
    private String bio;
    private String socialLinks;

    // Default constructor
    public Profile() {
    }

    // Parameterized constructor
    public Profile(User user, String profilePictureUrl, String bio, String socialLinks) {
        this.user = user;
        this.profilePictureUrl = profilePictureUrl;
        this.bio = bio;
        this.socialLinks = socialLinks;
    }

    public void updateProfile(String profilePictureUrl, String bio, String socialLinks) {
        this.profilePictureUrl = profilePictureUrl;
        this.bio = bio;
        this.socialLinks = socialLinks;
    }

    // Getters and Setters

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(String socialLinks) {
        this.socialLinks = socialLinks;
    }

    @Override
    public String toString() {
        return "Profile{" +
                "profileId=" + profileId +
                ", user=" + user +
                ", profilePictureUrl='" + profilePictureUrl + '\'' +
                ", bio='" + bio + '\'' +
                ", socialLinks='" + socialLinks + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Profile profile = (Profile) o;
        return Objects.equals(profileId, profile.profileId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(profileId);
    }
}