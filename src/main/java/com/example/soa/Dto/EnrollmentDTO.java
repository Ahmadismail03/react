package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;
import java.time.LocalDate;

public class EnrollmentDTO extends RepresentationModel<EnrollmentDTO> {
    private Long enrollmentId;
    private Long studentId;
    private Long courseId;
    private LocalDate enrollmentDate;
    private Float progress;
    private Boolean completionStatus;

    public Long getEnrollmentId() {
        return enrollmentId;
    }
    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }
    public Long getStudentId() {
        return studentId;
    }
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    public Long getCourseId() {
        return courseId;
    }
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
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
}