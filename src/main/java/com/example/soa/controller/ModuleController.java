package com.example.soa.controller;

import com.example.soa.Dto.ModuleDTO;
import com.example.soa.Model.Module;
import com.example.soa.Model.Course;
import com.example.soa.Model.Content;
import com.example.soa.Service.ModuleService;
import com.example.soa.Service.CourseService;
import com.example.soa.mapper.ModuleMapper;
import com.example.soa.Repository.ModuleRepository;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.security.UserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/module")
@Tag(name = "Module Management", description = "APIs for managing course modules")
public class ModuleController {
    
    private static final Logger logger = LoggerFactory.getLogger(ModuleController.class);
    
    @Autowired
    private ModuleService moduleService;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Operation(summary = "Get modules for a specific course")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ModuleDTO>> getModulesByCourse(@PathVariable Long courseId) {
        logger.info("Fetching modules for course ID: {}", courseId);
        List<Module> modules = moduleService.getModulesByCourseId(courseId);
        List<ModuleDTO> moduleDTOs = modules.stream().map(ModuleMapper::toModuleDTO).collect(Collectors.toList());
        logger.info("Found {} modules for course ID: {}", moduleDTOs.size(), courseId);
        return ResponseEntity.ok(moduleDTOs);
    }

    @Operation(summary = "Get module by ID")
    @GetMapping("/{moduleId}")
    public ResponseEntity<ModuleDTO> getModuleById(@PathVariable Long moduleId) {
        logger.info("Fetching module with ID: {}", moduleId);
        Module module = moduleService.getModuleById(moduleId);
        if (module == null) {
            logger.warn("Module not found with ID: {}", moduleId);
            return ResponseEntity.notFound().build();
        }
        logger.info("Module found with ID: {}", moduleId);
        return ResponseEntity.ok(ModuleMapper.toModuleDTO(module));
    }
    
    @Operation(summary = "Create a new module")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ModuleDTO> createModule(
            @RequestBody ModuleDTO moduleDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Creating new module with title: {}", moduleDTO.getTitle());
        
        // Validate input
        if (moduleDTO.getTitle() == null || moduleDTO.getTitle().trim().isEmpty()) {
            logger.warn("Module title is required");
            return ResponseEntity.badRequest().build();
        }
        
        if (moduleDTO.getCourseId() == null) {
            logger.warn("Course ID is required");
            return ResponseEntity.badRequest().build();
        }
        
        // Check if the course exists
        Course course = courseService.getCourseById(moduleDTO.getCourseId());
        if (course == null) {
            logger.warn("Course not found with ID: {}", moduleDTO.getCourseId());
            return ResponseEntity.badRequest().build();
        }
        
        // Verify user has permission to create a module for this course
        if (!currentUser.getRole().name().equals("ADMIN") && 
            (course.getInstructor() == null || 
             !course.getInstructor().getUserId().equals(currentUser.getId()))) {
            
            logger.warn("User {} is not authorized to create modules for course {}", 
                     currentUser.getId(), moduleDTO.getCourseId());
            return ResponseEntity.status(403).build();
        }
        
        // Create and save the module
        Module module = new Module();
        module.setCourse(course);
        module.setTitle(moduleDTO.getTitle());
        module.setDescription(moduleDTO.getDescription());
        module.setContents(new ArrayList<>());
        
        Module savedModule = moduleRepository.save(module);
        
        logger.info("Module created successfully with ID: {}", savedModule.getModuleId());
        return ResponseEntity.ok(ModuleMapper.toModuleDTO(savedModule));
    }
    
    @Operation(summary = "Update an existing module")
    @PutMapping("/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ModuleDTO> updateModule(
            @PathVariable Long moduleId,
            @RequestBody ModuleDTO moduleDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Updating module with ID: {}", moduleId);
        
        // Validate input
        if (moduleDTO.getTitle() == null || moduleDTO.getTitle().trim().isEmpty()) {
            logger.warn("Module title is required");
            return ResponseEntity.badRequest().build();
        }
        
        // Find the existing module
        Module module = moduleService.getModuleById(moduleId);
        if (module == null) {
            logger.warn("Module not found with ID: {}", moduleId);
            return ResponseEntity.notFound().build();
        }
        
        // Verify user has permission to update this module
        Course course = module.getCourse();
        if (!currentUser.getRole().name().equals("ADMIN") && 
            (course.getInstructor() == null || 
             !course.getInstructor().getUserId().equals(currentUser.getId()))) {
            
            logger.warn("User {} is not authorized to update module {}", 
                     currentUser.getId(), moduleId);
            return ResponseEntity.status(403).build();
        }
        
        // Update the module
        module.setTitle(moduleDTO.getTitle());
        module.setDescription(moduleDTO.getDescription());
        
        Module updatedModule = moduleRepository.save(module);
        
        logger.info("Module updated successfully with ID: {}", updatedModule.getModuleId());
        return ResponseEntity.ok(ModuleMapper.toModuleDTO(updatedModule));
    }
    
    @Operation(summary = "Delete a module")
    @DeleteMapping("/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Deleting module with ID: {}", moduleId);
        
        // Find the existing module
        Module module = moduleService.getModuleById(moduleId);
        if (module == null) {
            logger.warn("Module not found with ID: {}", moduleId);
            return ResponseEntity.notFound().build();
        }
        
        // Verify user has permission to delete this module
        Course course = module.getCourse();
        if (!currentUser.getRole().name().equals("ADMIN") && 
            (course.getInstructor() == null || 
             !course.getInstructor().getUserId().equals(currentUser.getId()))) {
            
            logger.warn("User {} is not authorized to delete module {}", 
                     currentUser.getId(), moduleId);
            return ResponseEntity.status(403).build();
        }
        
        // Delete the module
        moduleRepository.delete(module);
        
        logger.info("Module deleted successfully with ID: {}", moduleId);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Update the order of modules within a course")
    @PutMapping("/course/{courseId}/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<ModuleDTO>> updateModuleOrder(
            @PathVariable Long courseId,
            @RequestBody List<Map<String, Object>> moduleOrderData,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Updating module order for course ID: {}", courseId);
        
        // Check if the course exists
        Course course = courseService.getCourseById(courseId);
        if (course == null) {
            logger.warn("Course not found with ID: {}", courseId);
            return ResponseEntity.badRequest().build();
        }
        
        // Verify user has permission to update modules for this course
        if (!currentUser.getRole().name().equals("ADMIN") && 
            (course.getInstructor() == null || 
             !course.getInstructor().getUserId().equals(currentUser.getId()))) {
            
            logger.warn("User {} is not authorized to update module order for course {}", 
                     currentUser.getId(), courseId);
            return ResponseEntity.status(403).build();
        }
        
        // Process the module order data
        for (Map<String, Object> moduleData : moduleOrderData) {
            Long moduleId = Long.valueOf(moduleData.get("moduleId").toString());
            Integer orderIndex = Integer.valueOf(moduleData.get("orderIndex").toString());
            
            Module module = moduleService.getModuleById(moduleId);
            if (module != null && module.getCourse().getCourseId().equals(courseId)) {
                // For now, we're not storing orderIndex in the Module entity
                // This would need to be added to the Module class
                // module.setOrderIndex(orderIndex);
                moduleRepository.save(module);
            }
        }
        
        // Return updated modules
        List<Module> modules = moduleService.getModulesByCourseId(courseId);
        List<ModuleDTO> moduleDTOs = modules.stream().map(ModuleMapper::toModuleDTO).collect(Collectors.toList());
        
        logger.info("Module order updated successfully for course ID: {}", courseId);
        return ResponseEntity.ok(moduleDTOs);
    }
    
    @Operation(summary = "Get content for a specific module")
    @GetMapping("/{moduleId}/content")
    public ResponseEntity<List<Content>> getModuleContent(@PathVariable Long moduleId) {
        logger.info("Fetching content for module ID: {}", moduleId);
        
        // Find the existing module
        Module module = moduleService.getModuleById(moduleId);
        if (module == null) {
            logger.warn("Module not found with ID: {}", moduleId);
            return ResponseEntity.notFound().build();
        }
        
        List<Content> contents = module.getContents();
        
        logger.info("Found {} content items for module ID: {}", contents.size(), moduleId);
        return ResponseEntity.ok(contents);
    }
    
    @Operation(summary = "Add content to a module")
    @PostMapping("/{moduleId}/content/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ModuleDTO> addContentToModule(
            @PathVariable Long moduleId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Adding content ID: {} to module ID: {}", contentId, moduleId);
        
        try {
            Module updatedModule = moduleService.addContentToModule(moduleId, contentId, currentUser.getId());
            
            logger.info("Content added successfully to module");
            return ResponseEntity.ok(ModuleMapper.toModuleDTO(updatedModule));
        } catch (Exception e) {
            logger.error("Error adding content to module: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @Operation(summary = "Remove content from a module")
    @DeleteMapping("/{moduleId}/content/{contentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ModuleDTO> removeContentFromModule(
            @PathVariable Long moduleId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        logger.info("Removing content ID: {} from module ID: {}", contentId, moduleId);
        
        try {
            Module updatedModule = moduleService.removeContentFromModule(moduleId, contentId, currentUser.getId());
            
            logger.info("Content removed successfully from module");
            return ResponseEntity.ok(ModuleMapper.toModuleDTO(updatedModule));
        } catch (Exception e) {
            logger.error("Error removing content from module: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}