package com.example.soa.Repository;

import com.example.soa.Model.Module;
import com.example.soa.Model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourse(Course course);
    List<Module> findByCourse_CourseId(Long courseId);
}