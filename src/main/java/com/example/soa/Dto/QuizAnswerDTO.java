package com.example.soa.Dto;

import org.springframework.hateoas.RepresentationModel;

public class QuizAnswerDTO extends RepresentationModel<QuizAnswerDTO> {
    private Long id;
    private Long assessmentId;
    private String question;
    private String correctAnswer;

    
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

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
}