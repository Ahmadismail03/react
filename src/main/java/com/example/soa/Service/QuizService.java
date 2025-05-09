package com.example.soa.Service;

import com.example.soa.Model.Quiz;
import com.example.soa.Model.Question;
import com.example.soa.Model.Score;
import com.example.soa.Repository.QuizRepository;
import com.example.soa.Repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {
    private final QuizRepository quizRepository;
    private final ScoreRepository scoreRepository;

    @Autowired
    public QuizService(QuizRepository quizRepository, ScoreRepository scoreRepository) {
        this.quizRepository = quizRepository;
        this.scoreRepository = scoreRepository;
    }

    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public Quiz getQuiz(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getActiveQuizzes() {
        return quizRepository.findByActive(true);
    }

    @Transactional
    public Quiz updateQuiz(Long id, Quiz quizDetails) {
        Quiz quiz = getQuiz(id);
        quiz.setTitle(quizDetails.getTitle());
        quiz.setDescription(quizDetails.getDescription());
        quiz.setTimeLimit(quizDetails.getTimeLimit());
        quiz.setActive(quizDetails.isActive());
        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    @Transactional
    public Score submitQuiz(Long quizId, String studentId, Map<Long, String> answers, Integer timeSpentInSeconds) {
        Quiz quiz = getQuiz(quizId);
        int totalScore = 0;
        int totalPossibleScore = 0;

        for (Question question : quiz.getQuestions()) {
            totalPossibleScore += question.getPoints();
            String studentAnswer = answers.get(question.getId());
            if (studentAnswer != null && studentAnswer.equals(question.getCorrectAnswer())) {
                totalScore += question.getPoints();
            }
        }

        Score score = new Score();
        score.setQuiz(quiz);
        score.setStudentId(studentId);
        score.setScore(totalScore);
        score.setTotalPossibleScore(totalPossibleScore);
        score.setSubmissionTime(LocalDateTime.now());
        score.setTimeSpentInSeconds(timeSpentInSeconds);

        return scoreRepository.save(score);
    }

    public List<Score> getStudentScores(String studentId) {
        return scoreRepository.findByStudentId(studentId);
    }

    public List<Score> getQuizScores(Long quizId) {
        return scoreRepository.findByQuizId(quizId);
    }

    public Double getQuizAverageScore(Long quizId) {
        return scoreRepository.getAverageScoreForQuiz(quizId);
    }

    public Integer getQuizHighestScore(Long quizId) {
        return scoreRepository.getHighestScoreForQuiz(quizId);
    }
}