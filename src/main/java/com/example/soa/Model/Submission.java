package com.example.soa.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import java.time.LocalDate;

import jakarta.persistence.*;
import java.time.LocalDate;
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

    private LocalDate submissionDate;
    private Float score;

    @ElementCollection
    @CollectionTable(name = "student_answers", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "question")
    @Column(name = "answer")
    private Map<String, String> studentAnswers = new HashMap<>();

    private String content;

    // Default constructor
    public Submission() {
    }

    // Parameterized constructor
    public Submission(User student, Assessment assessment, LocalDate submissionDate, Float score) {
        this.student = student;
        this.assessment = assessment;
        this.submissionDate = submissionDate;
        this.score = score;
    }

    public void submitAssessment() {
        this.submissionDate = LocalDate.now();
        System.out.println("Assessment submitted by student: " + this.student.getName() +
                ", Submission Date: " + this.submissionDate);
    }

    public String getStudentAnswer(String question) {
        return studentAnswers.get(question);
    }

    public void addStudentAnswer(String question, String answer) {
        studentAnswers.put(question, answer);
    }

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

    public LocalDate getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDate submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Float getScore() {
        return score;
    }

    public void setScore(Float score) {
        this.score = score;
    }

    public Map<String, String> getStudentAnswers() {
        return studentAnswers;
    }

    public void setStudentAnswers(Map<String, String> studentAnswers) {
        this.studentAnswers = studentAnswers;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "Submission{" +
                "submissionId=" + submissionId +
                ", student=" + student +
                ", assessment=" + assessment +
                ", submissionDate=" + submissionDate +
                ", score=" + score +
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