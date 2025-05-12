package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;
import java.util.Map;
import java.util.HashMap;

public class SubmissionDTO extends RepresentationModel<SubmissionDTO> {
    private Long id;
    private Long assessmentId;
    private String content;
    private Map<String, String> submittedAnswers = new HashMap<>();
    
    // Default constructor
    public SubmissionDTO() {
    }
    
    // Getters and Setters
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
    
    public Map<String, String> getSubmittedAnswers() {
        return submittedAnswers;
    }
    
    public void setSubmittedAnswers(Map<String, String> submittedAnswers) {
        this.submittedAnswers = submittedAnswers;
    }
}