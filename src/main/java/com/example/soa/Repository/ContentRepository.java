package com.example.soa.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.soa.Model.Content;
import com.example.soa.Model.Course;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findByCourse(Course course);
    List<Content> findByCourse_CourseId(Long courseId);
    List<Content> findByModule_ModuleId(Long moduleId);
}