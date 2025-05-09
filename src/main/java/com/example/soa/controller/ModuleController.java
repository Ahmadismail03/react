package com.example.soa.controller;

import com.example.soa.Dto.ModuleDTO;
import com.example.soa.Model.Module;
import com.example.soa.Service.ModuleService;
import com.example.soa.mapper.ModuleMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/module")
@Tag(name = "Module Management", description = "APIs for managing course modules")
public class ModuleController {
    @Autowired
    private ModuleService moduleService;

    @Operation(summary = "Get modules for a specific course")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ModuleDTO>> getModulesByCourse(@PathVariable Long courseId) {
        List<Module> modules = moduleService.getModulesByCourseId(courseId);
        List<ModuleDTO> moduleDTOs = modules.stream().map(ModuleMapper::toModuleDTO).collect(Collectors.toList());
        return ResponseEntity.ok(moduleDTOs);
    }

    @Operation(summary = "Get module by ID")
    @GetMapping("/{moduleId}")
    public ResponseEntity<ModuleDTO> getModuleById(@PathVariable Long moduleId) {
        Module module = moduleService.getModuleById(moduleId);
        if (module == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ModuleMapper.toModuleDTO(module));
    }
}