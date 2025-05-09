package com.example.soa.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "enrollment")
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long enrollmentId;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "userId")
    @JsonBackReference(value="user-enrollment")
    private User student;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference(value="course-enrollment")
    private Course course;

    private LocalDate enrollmentDate;
    private Float progress;
    private Boolean completionStatus;

    // Default constructor
    public Enrollment() {
    }

    // Parameterized constructor
    public Enrollment(User student, Course course, LocalDate enrollmentDate, Float progress, Boolean completionStatus) {
        this.student = student;
        this.course = course;
        this.enrollmentDate = enrollmentDate;
        this.progress = progress;
        this.completionStatus = completionStatus;
    }

    public void trackProgress(float progress) {
        this.progress = progress;
    }

    // Getters and Setters
    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public Float getProgress() {
        return progress;
    }

    public void setProgress(Float progress) {
        this.progress = progress;
    }

    public Boolean getCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(Boolean completionStatus) {
        this.completionStatus = completionStatus;
    }

    // Override toString
    @Override
    public String toString() {
        return "Enrollment{" +
                "enrollmentId=" + enrollmentId +
                ", course=" + course +
                ", enrollmentDate=" + enrollmentDate +
                ", progress=" + progress +
                ", completionStatus=" + completionStatus +
                '}';
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Enrollment that = (Enrollment) o;
        return Objects.equals(enrollmentId, that.enrollmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(enrollmentId);
    }
}