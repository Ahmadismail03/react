package com.example.soa.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.time.LocalDateTime;
import java.util.Objects;
import jakarta.persistence.Table;

@Entity
@Table(name = "progress")
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long progressId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "content_id")
    private Content content;

    private LocalDateTime lastAccessDate;
    private Integer timeSpentMinutes;
    private Boolean isCompleted;
    private Float completionPercentage;
    private String notes;

    // Default constructor
    public Progress() {}

    // Parameterized constructor
    public Progress(User student, Content content, LocalDateTime lastAccessDate, Integer timeSpentMinutes, 
                   Boolean isCompleted, Float completionPercentage, String notes) {
        this.student = student;
        this.content = content;
        this.lastAccessDate = lastAccessDate;
        this.timeSpentMinutes = timeSpentMinutes;
        this.isCompleted = isCompleted;
        this.completionPercentage = completionPercentage;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getProgressId() {
        return progressId;
    }

    public void setProgressId(Long progressId) {
        this.progressId = progressId;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }

    public LocalDateTime getLastAccessDate() {
        return lastAccessDate;
    }

    public void setLastAccessDate(LocalDateTime lastAccessDate) {
        this.lastAccessDate = lastAccessDate;
    }

    public Integer getTimeSpentMinutes() {
        return timeSpentMinutes;
    }

    public void setTimeSpentMinutes(Integer timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean completed) {
        isCompleted = completed;
    }

    public Float getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Float completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Override toString
    @Override
    public String toString() {
        return "Progress{" +
                "progressId=" + progressId +
                ", student=" + student +
                ", content=" + content +
                ", lastAccessDate=" + lastAccessDate +
                ", timeSpentMinutes=" + timeSpentMinutes +
                ", isCompleted=" + isCompleted +
                ", completionPercentage=" + completionPercentage +
                ", notes='" + notes + '\'' +
                '}';
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Progress progress = (Progress) o;
        return Objects.equals(progressId, progress.progressId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(progressId);
    }
}