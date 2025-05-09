package com.example.soa.Repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.soa.Model.Assessment;



@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    
    List<Assessment> findByCourse_CourseId(Long courseId);
}