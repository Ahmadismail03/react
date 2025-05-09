package com.example.soa.Repository;




import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.soa.Model.QuizAnswer;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
   
    List<QuizAnswer> findByAssessment_AssessmentId(Long assessmentId);
}