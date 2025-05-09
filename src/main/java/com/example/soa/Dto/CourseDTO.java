package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CourseDTO extends RepresentationModel<CourseDTO> {
    private Long courseId;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String title;
    private Long instructorId;
    private List<Long> enrollmentIds = new ArrayList<>();
    private List<Long> contentIds = new ArrayList<>();
    private List<Long> assessmentIds = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private List<String> prerequisites = new ArrayList<>();

    public CourseDTO() {
        // Initialize empty lists
        this.enrollmentIds = new ArrayList<>();
        this.contentIds = new ArrayList<>();
        this.assessmentIds = new ArrayList<>();
    }

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

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }

    public List<Long> getEnrollmentIds() {
        return enrollmentIds != null ? enrollmentIds : new ArrayList<>();
    }

    public void setEnrollmentIds(List<Long> enrollmentIds) {
        this.enrollmentIds = enrollmentIds != null ? enrollmentIds : new ArrayList<>();
    }

    public List<Long> getContentIds() {
        return contentIds != null ? contentIds : new ArrayList<>();
    }

    public void setContentIds(List<Long> contentIds) {
        this.contentIds = contentIds != null ? contentIds : new ArrayList<>();
    }

    public List<Long> getAssessmentIds() {
        return assessmentIds != null ? assessmentIds : new ArrayList<>();
    }

    public void setAssessmentIds(List<Long> assessmentIds) {
        this.assessmentIds = assessmentIds != null ? assessmentIds : new ArrayList<>();
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
}