package com.example.soa.Repository;

import com.example.soa.Model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByActive(boolean active);
    List<Quiz> findByTitleContainingIgnoreCase(String title);
}