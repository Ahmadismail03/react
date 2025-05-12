package com.example.soa.Model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Entity
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long submissionId;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "userId")
    private User student;

    @ManyToOne
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    private LocalDateTime submissionDate;
    
    private Float score;
    
    private Long gradedBy;
    
    private LocalDateTime gradedDate;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection
    @CollectionTable(name = "student_answers", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "question")
    @Column(name = "answer")
    private Map<String, String> studentAnswers = new HashMap<>();

    // Default constructor
    public Submission() {
    }

    // Parameterized constructor
    public Submission(User student, Assessment assessment, LocalDateTime submissionDate, Float score) {
        this.student = student;
        this.assessment = assessment;
        this.submissionDate = submissionDate;
        this.score = score;
    }

    public void submitAssessment() {
        this.submissionDate = LocalDateTime.now();
        System.out.println("Assessment submitted by student: " + this.student.getName() +
                ", Submission Date: " + this.submissionDate);
    }

    public String getStudentAnswer(String question) {
        return studentAnswers.get(question);
    }

    public void addStudentAnswer(String question, String answer) {
        studentAnswers.put(question, answer);
    }

    // Getters and Setters
    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Float getScore() {
        return score;
    }

    public void setScore(Float score) {
        this.score = score;
    }

    public Long getGradedBy() {
        return gradedBy;
    }

    public void setGradedBy(Long gradedBy) {
        this.gradedBy = gradedBy;
    }

    public LocalDateTime getGradedDate() {
        return gradedDate;
    }

    public void setGradedDate(LocalDateTime gradedDate) {
        this.gradedDate = gradedDate;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Map<String, String> getStudentAnswers() {
        return studentAnswers;
    }

    public void setStudentAnswers(Map<String, String> studentAnswers) {
        this.studentAnswers = studentAnswers;
    }

    // Helper method to set submitted answers (alias for setStudentAnswers)
    public void setSubmittedAnswers(Map<String, String> submittedAnswers) {
        this.studentAnswers = submittedAnswers;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    // Utility method to set student by ID
    public void setStudentId(Long studentId) {
        if (this.student == null) {
            this.student = new User();
        }
        this.student.setUserId(studentId);
    }

    // Utility method to set score as Integer
    public void setScore(Integer score) {
        this.score = score != null ? score.floatValue() : null;
    }

    @Override
    public String toString() {
        return "Submission{" +
                "submissionId=" + submissionId +
                ", student=" + student +
                ", assessment=" + assessment +
                ", submissionDate=" + submissionDate +
                ", score=" + score +
                ", gradedBy=" + gradedBy +
                ", gradedDate=" + gradedDate +
                ", feedback='" + feedback + '\'' +
                ", content='" + content + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Submission that = (Submission) o;
        return Objects.equals(submissionId, that.submissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(submissionId);
    }
}