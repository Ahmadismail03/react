package com.example.soa.Service;

import com.example.soa.Model.Module;
import com.example.soa.Model.Course;
import com.example.soa.Repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {
    @Autowired
    private ModuleRepository moduleRepository;

    public List<Module> getModulesByCourseId(Long courseId) {
        return moduleRepository.findByCourse_CourseId(courseId);
    }

    public Module getModuleById(Long moduleId) {
        return moduleRepository.findById(moduleId).orElse(null);
    }
}