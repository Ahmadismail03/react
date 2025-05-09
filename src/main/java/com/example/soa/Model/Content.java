package com.example.soa.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "content")
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contentId;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Enumerated(EnumType.STRING)
    private ContentType type;

    private String title;
    private String urlFileLocation;
    private LocalDateTime uploadDate;
    private Long fileSize;
    private String fileType;
    private String description;
    private String fileName;
    private String fileUrl;
    private Boolean isActive = true;
    private Integer orderIndex = 0;
    @Column(name = "content")
    private String content; // Add this field
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }

    // Default constructor
    public Content() {
    }

    // Parameterized constructor
    public Content(Course course, ContentType type, String urlFileLocation) {
        this.course = course;
        this.type = type;
        this.urlFileLocation = urlFileLocation;
    }

    public void uploadContent(String fileUrl) {
        setUrlFileLocation(fileUrl);
        this.uploadDate = LocalDateTime.now();
        System.out.println("Content uploaded successfully: " + fileUrl);
    }
    public LocalDateTime getUploadDate() {
        return uploadDate;
    }


    // Getters and Setters
    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Module getModule() {
        return module;
    }

    public void setModule(Module module) {
        this.module = module;
    }

    public ContentType getType() {
        return type;
    }

    public void setType(ContentType type) {
        this.type = type;
    }
    public void setFileSize(Long fileSize) {
       this.fileSize = fileSize;
    }
    public Long getFileSize() {
        return fileSize;
    }
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    public String getFileType() {
        return fileType;
    }
    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getDescription() {
        return description; 
    }

    public String getUrlFileLocation() {
        return urlFileLocation;
    }

    public void setUrlFileLocation(String urlFileLocation) {
        if (urlFileLocation == null || urlFileLocation.trim().isEmpty()) {
            throw new IllegalArgumentException("URL file location cannot be null or empty");
        }
        
        // Check if it's a URL or a file path
        if (urlFileLocation.startsWith("http://") || urlFileLocation.startsWith("https://")) {
            try {
                new java.net.URL(urlFileLocation);
            } catch (java.net.MalformedURLException e) {
                throw new IllegalArgumentException("Invalid URL format: " + urlFileLocation);
            }
        }
        
        // Accept the value whether it's a URL or a file path
        this.urlFileLocation = urlFileLocation;
    }

    // Override toString
    @Override
    public String toString() {
        return "Content{" +
                "contentId=" + contentId +
                ", course=" + course +
                ", type=" + type +
                ", urlFileLocation='" + urlFileLocation + '\'' +
                '}';
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Content content = (Content) o;
        return Objects.equals(contentId, content.contentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(contentId);
    }

    // _____________________________________________________________________________________________________
    // ENROLLMENT
    // _____________________________________________________________________________________________________

    public enum ContentType {
        PDF, VIDEO, QUIZ, LINK, TEXT, AUDIO, IMAGE, PRESENTATION, DOCUMENT, OTHER
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        this.title = title;
    }

    public Content orElseThrow(Object object) {
        throw new UnsupportedOperationException("Unimplemented method 'orElseThrow'");
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}