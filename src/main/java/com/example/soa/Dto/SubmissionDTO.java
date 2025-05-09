package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;

public class SubmissionDTO extends RepresentationModel<SubmissionDTO> {
    private Long id;
    private Long assessmentId;
    private String content;

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}