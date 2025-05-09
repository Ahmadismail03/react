package com.example.soa.Model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import java.util.List;
import java.util.Objects;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Convert;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "title", nullable = true)
    private String title;
    
    @Column(name = "tags", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> tags = new ArrayList<>();
    
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> prerequisites = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "instructor_id", referencedColumnName = "userId")
    @JsonIdentityReference(alwaysAsId = true)
    private User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonManagedReference(value="course-enrollment")
    private List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Content> contents = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Assessment> assessments = new ArrayList<>();

    public void assignInstructor(User instructor) {
        this.instructor = instructor;
    }

    // Default constructor
    public Course() {
        this.enrollments = new ArrayList<>();
        this.contents = new ArrayList<>();
        this.assessments = new ArrayList<>();
    }

    // Constructor with required fields
    public Course(String name) {
        this.name = name;
        this.enrollments = new ArrayList<>();
        this.contents = new ArrayList<>();
        this.assessments = new ArrayList<>();
    }

    // Constructor with courseId
    public Course(Long courseId) {
        this.courseId = courseId;
        this.enrollments = new ArrayList<>();
        this.contents = new ArrayList<>();
        this.assessments = new ArrayList<>();
    }

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getInstructor() {
        return instructor;
    }

    public void setInstructor(User instructor) {
        this.instructor = instructor;
    }

    public List<Enrollment> getEnrollments() {
        return enrollments != null ? enrollments : new ArrayList<>();
    }

    public void setEnrollments(List<Enrollment> enrollments) {
        this.enrollments = enrollments != null ? enrollments : new ArrayList<>();
    }

    public List<Content> getContents() {
        return contents != null ? contents : new ArrayList<>();
    }

    public void setContents(List<Content> contents) {
        this.contents = contents != null ? contents : new ArrayList<>();
    }

    public List<Assessment> getAssessments() {
        return assessments != null ? assessments : new ArrayList<>();
    }

    public void setAssessments(List<Assessment> assessments) {
        this.assessments = assessments != null ? assessments : new ArrayList<>();
    }
    
    public List<String> getTags() {
        return tags != null ? tags : new ArrayList<>();
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }
    
    public List<String> getPrerequisites() {
        return prerequisites != null ? prerequisites : new ArrayList<>();
    }
    
    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites != null ? prerequisites : new ArrayList<>();
    }

    // Override toString
    @Override
    public String toString() {
        return "Course{" +
                "courseId=" + courseId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", tags=" + tags +
                ", prerequisites=" + prerequisites +
                ", instructor=" + instructor +
                '}';
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Course course = (Course) o;
        return Objects.equals(courseId, course.courseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId);
    }

    public void addContent(Content content) {
        if (this.contents == null) {
            this.contents = new ArrayList<>();
        }
        this.contents.add(content);
        System.out.println("Content added to course: " + content.getTitle());
    }

    public void addAssessment(Assessment assessment) {
        if (this.assessments == null) {
            this.assessments = new ArrayList<>();
        }
        this.assessments.add(assessment);
        System.out.println("Assessment added to course: " + assessment.getTitle());
    }

    public Content getContentById(Long contentId) {
        if (this.contents != null) {
            for (Content content : this.contents) {
                if (content.getContentId().equals(contentId)) {
                    return content;
                }
            }
        }
        throw new RuntimeException("Content not found with ID: " + contentId);
    }

    @PrePersist
    protected void onCreate() {
        if (this.name == null) {
            throw new IllegalStateException("Course name cannot be null");
        }
    }
}