package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;

import java.util.List;

public class AssessmentDTO extends RepresentationModel<AssessmentDTO> {
    private Long assessmentId;
    private Long courseId;
    private String title;
    private String type;
    private Integer totalMarks;
    private List<SubmissionDTO> submissions;
    private List<QuizAnswerDTO> quizAnswers;

    
    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public List<SubmissionDTO> getSubmissions() {
        return submissions;
    }

    public void setSubmissions(List<SubmissionDTO> submissions) {
        this.submissions = submissions;
    }

    public List<QuizAnswerDTO> getQuizAnswers() {
        return quizAnswers;
    }

    public void setQuizAnswers(List<QuizAnswerDTO> quizAnswers) {
        this.quizAnswers = quizAnswers;
    }
}