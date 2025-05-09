package com.example.soa.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "assessments")

public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assessmentId;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String title;

    @Enumerated(EnumType.STRING)
    private AssessmentType type;

    private Integer totalMarks;

    private String questions;
    private String answers;
    private LocalDateTime dueDate;
    private String instructions;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL)
    private List<Submission> submissions;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL)
    private List<QuizAnswer> quizAnswers;

    public void autoGradeQuiz() {
        if (this.type == AssessmentType.QUIZ) {
            for (Submission submission : submissions) {
                float score = 0;
                for (QuizAnswer answer : this.quizAnswers) {
                    if (submission.getStudentAnswer(answer.getQuestion()).equals(answer.getCorrectAnswer())) {
                        score += 1;
                    }
                }
                submission.setScore(score);
                System.out.println("Quiz auto-graded for student: " + submission.getStudent().getName() +
                        ", Score: " + submission.getScore());
            }
        }
    }

    // Default constructor
    public Assessment() {
    }

    // Parameterized constructor
    public Assessment(Course course, String title, AssessmentType type, Integer totalMarks) {
        this.course = course;
        this.title = title;
        this.type = type;
        this.totalMarks = totalMarks;
    }

    // Getters and Setters
    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public AssessmentType getType() {
        return type;
    }

    public void setType(AssessmentType type) {
        this.type = type;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public List<Submission> getSubmissions() {
        return submissions;
    }

    public void setSubmissions(List<Submission> submissions) {
        this.submissions = submissions;
    }

    public List<QuizAnswer> getQuizAnswers() {
        return quizAnswers;
    }

    public void setQuizAnswers(List<QuizAnswer> quizAnswers) {
        this.quizAnswers = quizAnswers;
    }

    // Override toString
    @Override
    public String toString() {
        return "Assessment{" +
                "assessmentId=" + assessmentId +
                ", course=" + course +
                ", title='" + title + '\'' +
                ", type=" + type +
                ", totalMarks=" + totalMarks +
                '}';
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Assessment that = (Assessment) o;
        return Objects.equals(assessmentId, that.assessmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(assessmentId);
    }

    // _____________________________________________________________________________________________________
    // ENROLLMENT
    // _____________________________________________________________________________________________________

    public enum AssessmentType {
        QUIZ, ASSIGNMENT
    }
}