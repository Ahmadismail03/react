package com.example.soa.Model;



import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "quiz_answer")
public class QuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    @ManyToOne
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    private String question;
    private String correctAnswer;

    
    public QuizAnswer() {
    }

    
    public QuizAnswer(Assessment assessment, String question, String correctAnswer) {
        this.assessment = assessment;
        this.question = question;
        this.correctAnswer = correctAnswer;
    }

    
    public Long getAnswerId() {
        return answerId;
    }

    public void setAnswerId(Long answerId) {
        this.answerId = answerId;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
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

    
    @Override
    public String toString() {
        return "QuizAnswer{" +
                "answerId=" + answerId +
                ", assessment=" + assessment +
                ", question='" + question + '\'' +
                ", correctAnswer='" + correctAnswer + '\'' +
                '}';
    }

    
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        QuizAnswer that = (QuizAnswer) o;
        return Objects.equals(answerId, that.answerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(answerId);
    }
}