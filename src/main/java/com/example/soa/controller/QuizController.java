package com.example.soa.controller;

import com.example.soa.Model.Quiz;
import com.example.soa.Model.Score;
import com.example.soa.Service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        Quiz createdQuiz = quizService.createQuiz(quiz);
        return ResponseEntity.ok(createdQuiz);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        Quiz quiz = quizService.getQuiz(id);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes(@RequestParam(required = false) Boolean active) {
        List<Quiz> quizzes = active != null && active ? 
            quizService.getActiveQuizzes() : quizService.getAllQuizzes();
        return ResponseEntity.ok(quizzes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizDetails) {
        Quiz updatedQuiz = quizService.updateQuiz(id, quizDetails);
        return ResponseEntity.ok(updatedQuiz);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Score> submitQuiz(
            @PathVariable Long id,
            @RequestParam String studentId,
            @RequestBody Map<Long, String> answers,
            @RequestParam Integer timeSpentInSeconds) {
        Score score = quizService.submitQuiz(id, studentId, answers, timeSpentInSeconds);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/scores/student/{studentId}")
    public ResponseEntity<List<Score>> getStudentScores(@PathVariable String studentId) {
        List<Score> scores = quizService.getStudentScores(studentId);
        return ResponseEntity.ok(scores);
    }

    @GetMapping("/{id}/scores")
    public ResponseEntity<List<Score>> getQuizScores(@PathVariable Long id) {
        List<Score> scores = quizService.getQuizScores(id);
        return ResponseEntity.ok(scores);
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long id) {
        Double averageScore = quizService.getQuizAverageScore(id);
        Integer highestScore = quizService.getQuizHighestScore(id);
        
        Map<String, Object> statistics = Map.of(
            "averageScore", averageScore != null ? averageScore : 0.0,
            "highestScore", highestScore != null ? highestScore : 0
        );
        
        return ResponseEntity.ok(statistics);
    }
}