package com.example.soa.Repository;

import com.example.soa.Model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByStudentId(String studentId);
    List<Score> findByQuizId(Long quizId);
    
    @Query("SELECT s FROM Score s WHERE s.quiz.id = :quizId AND s.studentId = :studentId")
    List<Score> findByQuizIdAndStudentId(Long quizId, String studentId);
    
    @Query("SELECT AVG(s.score) FROM Score s WHERE s.quiz.id = :quizId")
    Double getAverageScoreForQuiz(Long quizId);
    
    @Query("SELECT MAX(s.score) FROM Score s WHERE s.quiz.id = :quizId")
    Integer getHighestScoreForQuiz(Long quizId);
}