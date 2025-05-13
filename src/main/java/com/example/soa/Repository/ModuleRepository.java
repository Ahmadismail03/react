package com.example.soa.Repository;

import com.example.soa.Model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    
    List<Module> findByCourse_CourseId(Long courseId);
    
    List<Module> findByCourse_CourseIdOrderByModuleId(Long courseId);
    
    // If you add an orderIndex field to the Module entity, you can use this method
    // List<Module> findByCourse_CourseIdOrderByOrderIndex(Long courseId);
}