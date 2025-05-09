package com.example.soa.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "scores")
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonBackReference(value="quiz-score")
    private Quiz quiz;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer totalPossibleScore;

    @Column(nullable = false)
    private LocalDateTime submissionTime;

    @Column(nullable = false)
    private Integer timeSpentInSeconds;

    @Column(length = 1000)
    private String feedback;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalPossibleScore() {
        return totalPossibleScore;
    }

    public void setTotalPossibleScore(Integer totalPossibleScore) {
        this.totalPossibleScore = totalPossibleScore;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }

    public Integer getTimeSpentInSeconds() {
        return timeSpentInSeconds;
    }

    public void setTimeSpentInSeconds(Integer timeSpentInSeconds) {
        this.timeSpentInSeconds = timeSpentInSeconds;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}